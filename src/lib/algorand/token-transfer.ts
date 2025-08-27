import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { algodClient } from './client';
import { decodePrivateKey, isValidAlgorandAddress } from './utils';

import { fundReceiverIfNeeded } from './funding';
import { sendSizViaArc59, claimSizFromInbox } from './arc59-send';
import dotenv from 'dotenv';

export interface TokenTransferParams {
  receiverAddress: string;
  amount: number;
  paymentId: string;
}

export interface TransferResult {
  success: boolean;
  txId?: string;
  error?: string;
  confirmedTxn?: any;
  requiresOptIn?: boolean;
  optInInstructions?: string;
  requiresUserAction?: boolean;
  actionRequired?: string;
  instructions?: string;
  message?: string;
}

export interface OptInStatus {
  isOptedIn: boolean;
  canOptIn: boolean;
  error?: string;
  alogBalance?: number;
  minBalanceRequired?: number;
}

export class SizTokenTransferService {
  private _assetId: bigint | null = null;
  private _centralWalletMnemonic: string | null = null;
  private _arc59AppId: number | null = null;
  private _arc59Client: any | null = null;

  constructor() {
    // Lazy initialization - don't validate environment variables here
  }

  // Lazy getters for environment variables
  private get assetId(): bigint {
    if (!this._assetId) {
      if (!process.env.SIZ_TOKEN_ASSET_ID) {
        throw new Error('SIZ_TOKEN_ASSET_ID is not set');
      }
      this._assetId = BigInt(process.env.SIZ_TOKEN_ASSET_ID);
    }
    return this._assetId;
  }

  private get centralWalletMnemonic(): string {
    if (!this._centralWalletMnemonic) {
      if (!process.env.CENTRAL_WALLET_MNEMONIC) {
        throw new Error('CENTRAL_WALLET_MNEMONIC is not set');
      }
      this._centralWalletMnemonic = process.env.CENTRAL_WALLET_MNEMONIC;
    }
    return this._centralWalletMnemonic;
  }

  private get arc59AppId(): number {
    if (!this._arc59AppId) {
      if (!process.env.ARC59_APP_ID) {
        throw new Error('ARC59_APP_ID is not set');
      }
      this._arc59AppId = parseInt(process.env.ARC59_APP_ID);
    }
    return this._arc59AppId;
  }

  private get arc59Client(): any {
    if (!this._arc59Client) {
      // ARC-0059 client is now handled by the new implementation
      this._arc59Client = null;
    }
    return this._arc59Client;
  }

  // Central wallet derivation and validation
  public getDerivedCentralWalletAddress(): string {
    try {
      const mnemonic = this.centralWalletMnemonic.trim();
      if (!/^[a-z]+( [a-z]+){24}$/.test(mnemonic)) {
        throw new Error('CENTRAL_WALLET_MNEMONIC is invalid format. Expected 25 lowercase words separated by spaces.');
      }
      
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      
      // The Address object's toString() method returns the proper address string
      const address = account.addr.toString();
      
      return address;
    } catch (err) {
      throw new Error(`Failed to derive central wallet address: ${(err as Error).message}`);
    }
  }

  private getCentralWalletSigner(): algosdk.TransactionSigner {
    try {
      const mnemonic = this.centralWalletMnemonic.trim();
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      
      return async (txns: algosdk.Transaction[], indexesToSign: number[]) => {
        const signedTxns: Uint8Array[] = [];
        for (const index of indexesToSign) {
          const txn = txns[index];
          const signedTxn = algosdk.signTransaction(txn, account.sk);
          signedTxns.push(signedTxn.blob);
        }
        return signedTxns;
      };
    } catch (err) {
      throw new Error(`Failed to create central wallet signer: ${(err as Error).message}`);
    }
  }

  public validateCentralWalletAddress(): boolean {
    try {
      const derivedAddress = this.getDerivedCentralWalletAddress();
      const expectedAddress = process.env.CENTRAL_WALLET_ADDRESS;
      
      console.log('🔍 Address Validation Debug:');
      console.log(`   Derived: "${derivedAddress}"`);
      console.log(`   Expected: "${expectedAddress}"`);
      console.log(`   Lengths: ${derivedAddress.length} vs ${expectedAddress?.length}`);
      console.log(`   Match: ${derivedAddress === expectedAddress}`);
      
      return derivedAddress === expectedAddress;
    } catch (error) {
      console.error('❌ Address validation error:', error);
      return false;
    }
  }



  /**
   * Check if the central wallet has sufficient SIZ token balance
   */
  async checkCentralWalletBalance(): Promise<{ hasBalance: boolean; balance: number; error?: string }> {
    try {
      // Validate that derived address matches configured address
      if (!this.validateCentralWalletAddress()) {
        return { 
          hasBalance: false, 
          balance: 0, 
          error: `Mnemonic-derived address (${this.getDerivedCentralWalletAddress()}) does not match configured address (${process.env.CENTRAL_WALLET_ADDRESS})` 
        };
      }

      const accountInfo = await algodClient.accountInformation(this.getDerivedCentralWalletAddress()).do();
      
      // Debug: Log all assets in the wallet
      console.log('🔍 Debug: All assets in central wallet for balance check:');
      const allAssets = accountInfo.assets || [];
      allAssets.forEach((asset: any) => {
        console.log(`   Asset ID: ${asset.assetId} (${typeof asset.assetId}), Amount: ${asset.amount}`);
      });
      console.log(`🔍 Looking for SIZ asset ID: ${this.assetId} (${typeof this.assetId})`);
      
      // Find SIZ asset with improved comparison
      const assetHolding = allAssets.find((asset: any) => {
        const assetIdNum = Number(asset.assetId);
        const targetAssetIdNum = Number(this.assetId);
        const match = assetIdNum === targetAssetIdNum;
        console.log(`   Balance check - Comparing: ${assetIdNum} === ${targetAssetIdNum} = ${match}`);
        return match;
      });
      
      if (!assetHolding) {
        return { hasBalance: false, balance: 0, error: 'Central wallet has not opted into SIZ token' };
      }

      const balance = Number(assetHolding.amount);
      console.log(`🔍 SIZ token balance found: ${balance}`);
      
      return { hasBalance: true, balance };
    } catch (error) {
      return { hasBalance: false, balance: 0, error: `Failed to check balance: ${error}` };
    }
  }

  /**
   * Comprehensive check of central wallet status for ARC-0059 operations
   * Following the Algorand agent's guidance for proper setup
   */
  async checkCentralWalletStatus(): Promise<{
    isReady: boolean;
    algoBalance: bigint;
    sizBalance: number;
    isOptedIntoSiz: boolean;
    canOptIntoSiz: boolean;
    error?: string;
    details: string;
  }> {
    try {
      console.log('🔍 Checking central wallet status for ARC-0059 operations...');
      
      // Validate address first
      if (!this.validateCentralWalletAddress()) {
        return {
          isReady: false,
          algoBalance: BigInt(0),
          sizBalance: 0,
          isOptedIntoSiz: false,
          canOptIntoSiz: false,
          error: 'Address validation failed',
          details: 'Central wallet address does not match configured address'
        };
      }
      
      const accountInfo = await algodClient.accountInformation(this.getDerivedCentralWalletAddress()).do();
      const algoBalance = BigInt(accountInfo.amount);
      const minBalance = BigInt(accountInfo.minBalance);
      
      // Debug: Log all assets in the wallet
      console.log('🔍 Debug: All assets in central wallet:');
      const allAssets = accountInfo.assets || [];
      allAssets.forEach((asset: any) => {
        console.log(`   Asset ID: ${asset.assetId} (${typeof asset.assetId}), Amount: ${asset.amount}`);
      });
      console.log(`🔍 Looking for SIZ asset ID: ${this.assetId} (${typeof this.assetId})`);
      
      // Check SIZ token status with improved comparison
      const sizAsset = allAssets.find((asset: any) => {
        // Convert both to numbers for comparison to avoid BigInt/Number mismatch
        const assetIdNum = Number(asset.assetId);
        const targetAssetIdNum = Number(this.assetId);
        const match = assetIdNum === targetAssetIdNum;
        console.log(`   Comparing: ${assetIdNum} === ${targetAssetIdNum} = ${match}`);
        return match;
      });
      
      const isOptedIntoSiz = !!sizAsset;
      const sizBalance = sizAsset ? Number(sizAsset.amount) : 0;
      
      console.log(`🔍 SIZ token detection result:`, {
        found: !!sizAsset,
        assetId: sizAsset?.assetId,
        amount: sizAsset?.amount,
        balance: sizBalance
      });
      
      // Calculate available ALGO for operations (excluding minimum balance)
      const availableAlgo = algoBalance - minBalance;
      
      // Check if wallet can opt into SIZ token (needs at least 0.1 ALGO for opt-in)
      const minAlgoForOptIn = BigInt(100000); // 0.1 ALGO
      const canOptIntoSiz = availableAlgo >= minAlgoForOptIn;
      
      // Determine if wallet is ready for ARC-0059 operations
      let isReady = false;
      let details = '';
      
      if (!isOptedIntoSiz) {
        if (canOptIntoSiz) {
          isReady = true;
          details = `Wallet can opt into SIZ tokens. Available ALGO: ${Number(availableAlgo) / 1e6} ALGO`;
        } else {
          details = `Wallet needs more ALGO to opt into SIZ tokens. Available: ${Number(availableAlgo) / 1e6} ALGO, Required: 0.1 ALGO`;
        }
      } else {
        if (sizBalance > 0) {
          isReady = true;
          details = `Wallet has ${sizBalance} SIZ tokens and ${Number(availableAlgo) / 1e6} ALGO available`;
        } else {
          details = `Wallet is opted into SIZ tokens but has no balance. Available ALGO: ${Number(availableAlgo) / 1e6} ALGO`;
        }
      }
      
      console.log('📊 Central Wallet Status:', {
        isReady,
        algoBalance: Number(algoBalance) / 1e6,
        sizBalance,
        isOptedIntoSiz,
        canOptIntoSiz,
        availableAlgo: Number(availableAlgo) / 1e6,
        details
      });
      
      return {
        isReady,
        algoBalance,
        sizBalance,
        isOptedIntoSiz,
        canOptIntoSiz,
        details
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to check central wallet status:', errorMessage);
      
      return {
        isReady: false,
        algoBalance: BigInt(0),
        sizBalance: 0,
        isOptedIntoSiz: false,
        canOptIntoSiz: false,
        error: errorMessage,
        details: `Error checking wallet status: ${errorMessage}`
      };
    }
  }

  /**
   * Check if the receiver has opted into the SIZ token and can opt-in if needed
   */
  async checkReceiverOptIn(receiverAddress: string): Promise<OptInStatus> {
    try {
      if (!isValidAlgorandAddress(receiverAddress)) {
        return { 
          isOptedIn: false, 
          canOptIn: false, 
          error: 'Invalid Algorand address format' 
        };
      }

      const accountInfo = await algodClient.accountInformation(receiverAddress).do();
      const assetHolding = accountInfo.assets?.find((asset: any) => asset.assetId === this.assetId);
      const isOptedIn = !!assetHolding;
      
      // Check if user can opt-in (has sufficient ALGO for minimum balance + fees)
      const alogBalance = Number(accountInfo.amount) / 1e6; // Convert from microAlgos
      const minBalanceRequired = 0.1; // 0.1 ALGO required for asset opt-in
      const canOptIn = alogBalance >= minBalanceRequired;
      
      // If ARC-0059 is available and user is not opted in, check inbox
      if (this.arc59Client && !isOptedIn) {
        try {
          const inboxBalance = await this.arc59Client.checkInboxBalance(receiverAddress, this.assetId);
          if (inboxBalance > 0) {
            return {
              isOptedIn: false,
              canOptIn: true,
              alogBalance,
              minBalanceRequired,
              error: `User has ${inboxBalance} SIZ tokens in ARC-0059 inbox. They can claim them without opt-in.`
            };
          }
        } catch (inboxError) {
          // Gracefully handle inbox check errors - this is expected for new users
          console.log(`ℹ️ Inbox check failed for ${receiverAddress} (expected for new users):`, inboxError instanceof Error ? inboxError.message : 'Unknown error');
          // Don't throw the error - just continue with normal opt-in check
        }
      }
      
      return { 
        isOptedIn, 
        canOptIn,
        alogBalance,
        minBalanceRequired
      };
    } catch (error) {
      return { 
        isOptedIn: false, 
        canOptIn: false, 
        error: `Failed to check opt-in status: ${error}` 
      };
    }
  }

  /**
   * Check if the SIZ token is frozen for either the central wallet or receiver
   */
  async checkAssetFreezeStatus(receiverAddress: string): Promise<{ 
    centralWalletFrozen: boolean; 
    receiverFrozen: boolean; 
    error?: string 
  }> {
    try {
      const assetInfo = await algodClient.getAssetByID(Number(this.assetId)).do();
      const freezeAddress = assetInfo.params.freeze;
      
      if (!freezeAddress) {
        return { centralWalletFrozen: false, receiverFrozen: false };
      }

      // Check if central wallet is frozen
      const centralAccountInfo = await algodClient.accountInformation(this.getDerivedCentralWalletAddress()).do();
      const centralAssetHolding = centralAccountInfo.assets?.find((asset: any) => asset.assetId === this.assetId);
      const centralWalletFrozen = centralAssetHolding?.isFrozen || false;

      // Check if receiver is frozen
      const receiverAccountInfo = await algodClient.accountInformation(receiverAddress).do();
      const receiverAssetHolding = receiverAccountInfo.assets?.find((asset: any) => asset.assetId === this.assetId);
      const receiverFrozen = receiverAssetHolding?.isFrozen || false;

      return { centralWalletFrozen, receiverFrozen };
    } catch (error) {
      return { 
        centralWalletFrozen: false, 
        receiverFrozen: false, 
        error: `Failed to check freeze status: ${error}` 
      };
    }
  }

  /**
   * Transfer SIZ tokens from central wallet to receiver
   */
  async transferSizTokens(params: TokenTransferParams): Promise<TransferResult> {
    // If ARC-0059 is available, use it for seamless transfers
    if (this.arc59Client) {
      return this.transferViaArc59(params);
    }
    
    // Fallback to direct transfer
    return this.transferDirect(params);
  }

  /**
   * Transfer SIZ tokens using ARC-0059 (handles opt-in automatically)
   * Following the Algorand agent's comprehensive ARC-0059 integration plan
   */
  private async transferViaArc59(params: TokenTransferParams): Promise<TransferResult> {
    try {
      console.log(`🔄 Starting ARC-0059 transfer of ${params.amount} SIZ tokens to ${params.receiverAddress}`);
      console.log(`   Asset ID: ${this.assetId}`);
      console.log(`   Payment ID: ${params.paymentId}`);
      
      // Step 1: Ensure the ARC-0059 router is opted into SIZ tokens
      console.log('\n📋 Step 1: Ensuring router opt-in...');
      const routerOptInStatus = await this.ensureRouterOptedIn();
      if (!routerOptInStatus.success) {
        throw new Error(`Router opt-in failed: ${routerOptInStatus.error}`);
      }
      
      // Step 2: Check and unfreeze assets for both router and recipient
      console.log('\n📋 Step 2: Checking and unfreezing assets...');
      const assetId = Number(this.assetId);
      
      // Check router address (ARC-0059 app address)
      const routerAddress = algosdk.getApplicationAddress(Number(process.env.ARC59_APP_ID));
      console.log(`   Router address: ${routerAddress}`);
      const routerUnfreezeResult = await this.checkAndUnfreezeAsset(routerAddress.toString(), assetId);
      
      // Check recipient address
      console.log(`   Recipient address: ${params.receiverAddress}`);
      const recipientUnfreezeResult = await this.checkAndUnfreezeAsset(params.receiverAddress, assetId);
      
      if (routerUnfreezeResult.wasFrozen || recipientUnfreezeResult.wasFrozen) {
        console.log('✅ Asset freeze status resolved, proceeding with transfer...');
      }
      
      // Step 3: Get send asset requirements
      console.log('\n📋 Step 3: Getting send asset requirements...');
      const sendAssetInfo = await this.arc59Client!.getSendAssetInfo(
        params.receiverAddress,
        BigInt(this.assetId)
      );
      
      console.log('📊 Send Asset Requirements:', sendAssetInfo);
      
      // Step 4: Execute ARC-0059 transfer
      console.log('\n📋 Step 4: Executing ARC-0059 transfer...');
      const additionalReceiverFunds = sendAssetInfo.receiverAlgoNeededForClaim;
      console.log(`   Using additionalReceiverFunds: ${additionalReceiverFunds} microALGO`);
      
      const transferTxId = await this.arc59Client!.sendAsset({
        receiver: params.receiverAddress,
        assetId: BigInt(this.assetId),
        amount: BigInt(params.amount),
        additionalReceiverFunds
      });
      
      console.log(`✅ ARC-0059 transfer completed successfully!`);
      console.log(`   Transaction ID: ${transferTxId}`);
      
      return {
        success: true,
        txId: transferTxId,
        requiresOptIn: false
      };
      
    } catch (error) {
      console.error('❌ ARC-0059 transfer failed:', error);
      
      // Provide detailed error information
      const errorMessage = (error as Error).message;
      console.error('📡 Detailed error information:', {
        errorType: (error as Error).constructor.name,
        errorMessage,
        requiresOptIn: false,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(`ARC-0059 transfer failed: ${errorMessage}`);
    }
  }

  /**
   * Ensure the ARC-0059 router is opted into SIZ tokens
   * This is required before any transfers can be made
   * Following the Algorand agent's router opt-in strategy
   */
  private async ensureRouterOptedIn(): Promise<{ success: boolean; error?: string; txId?: string }> {
    try {
      if (!this.arc59Client) {
        return { success: false, error: 'ARC-0059 client not initialized' };
      }

      console.log('🔍 Checking if ARC-0059 router is opted into SIZ tokens...');
      
      // Use arc59_getSendAssetInfo to check router opt-in status
      // This is the recommended approach per the Algorand agent
      const sendAssetInfo = await this.arc59Client.getSendAssetInfo(
        this.getDerivedCentralWalletAddress(), // Use central wallet as test receiver
        this.assetId
      );

      console.log('📊 Router Opt-in Status Check:', {
        routerOptedIn: sendAssetInfo.routerOptedIn,
        itxns: sendAssetInfo.itxns,
        mbr: sendAssetInfo.mbr,
        receiverOptedIn: sendAssetInfo.receiverOptedIn,
        receiverAlgoNeededForClaim: sendAssetInfo.receiverAlgoNeededForClaim
      });

      if (sendAssetInfo.routerOptedIn) {
        console.log('✅ Router is already opted into SIZ tokens');
        return { success: true };
      }

      console.log('🔄 Router needs to opt into SIZ tokens. Opting in...');
      console.log(`   Asset ID: ${this.assetId}`);
      console.log(`   Router App ID: ${this.arc59AppId}`);
      
      // Opt the router into SIZ tokens using arc59_optRouterIn
      const txId = await this.arc59Client.optRouterIn(this.assetId);
      
      console.log('✅ Router successfully opted into SIZ tokens');
      console.log(`   Transaction ID: ${txId}`);
      
      // Wait a moment for the transaction to be confirmed
      console.log('⏳ Waiting for router opt-in confirmation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the opt-in was successful by checking again
      const verificationInfo = await this.arc59Client.getSendAssetInfo(
        this.getDerivedCentralWalletAddress(),
        this.assetId
      );
      
      if (verificationInfo.routerOptedIn) {
        console.log('✅ Router opt-in verification successful');
        return { success: true, txId };
      } else {
        console.log('❌ Router opt-in verification failed');
        return { success: false, error: 'Router opt-in verification failed after transaction' };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to ensure router opt-in:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if an address is frozen for the SIZ token and unfreeze if needed
   * This is required before ARC-0059 transfers can succeed
   */
  private async checkAndUnfreezeAsset(address: string, assetId: number): Promise<{ wasFrozen: boolean; unfreezeTxId?: string }> {
    try {
      console.log(`🔍 Checking freeze status for address: ${address}`);
      
      // Get the asset holding information
      const assetInfo = await algodClient.accountAssetInformation(address, assetId).do();
      const assetHolding = assetInfo.assetHolding;
      
      if (!assetHolding) {
        console.log(`   Address ${address} is not opted into SIZ token`);
        return { wasFrozen: false };
      }
      
      const isFrozen = assetHolding.isFrozen;
      console.log(`   Freeze status: ${isFrozen ? 'FROZEN' : 'NOT FROZEN'}`);
      
      if (!isFrozen) {
        return { wasFrozen: false };
      }
      
      // Asset is frozen, need to unfreeze it
      console.log(`🔄 Unfreezing asset for address: ${address}`);
      
      // Get freeze manager credentials from environment
      const freezeManagerAddress = process.env.UNFREEZE_ACCOUNT_ADDRESS;
      const freezeManagerMnemonic = process.env.UNFREEZE_ACCOUNT_MNEMONIC;
      
      if (!freezeManagerAddress || !freezeManagerMnemonic) {
        throw new Error('UNFREEZE_ACCOUNT_ADDRESS and UNFREEZE_ACCOUNT_MNEMONIC must be set in environment');
      }
      
      // Create freeze manager signer
      const freezeManagerAccount = algosdk.mnemonicToSecretKey(freezeManagerMnemonic);
      const freezeManagerSigner = algosdk.makeBasicAccountTransactionSigner(freezeManagerAccount);
      
      // Create unfreeze transaction
      const suggestedParams = await algodClient.getTransactionParams().do();
      const unfreezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
        sender: freezeManagerAddress,
        assetIndex: assetId,
        freezeTarget: address,
        frozen: false, // Unfreeze
        suggestedParams
      });
      
      // Sign and submit the unfreeze transaction
      const signedUnfreezeTxn = await freezeManagerSigner([unfreezeTxn], [0]);
      const response = await algodClient.sendRawTransaction(signedUnfreezeTxn[0]).do();
      
      console.log(`✅ Unfreeze transaction submitted: ${response.txid}`);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, response.txid, 4);
      console.log(`✅ Asset unfrozen successfully for address: ${address}`);
      
      return { wasFrozen: true, unfreezeTxId: response.txid };
      
    } catch (error) {
      // Handle specific error cases gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('account asset info not found') || errorMessage.includes('404')) {
        // This is expected for addresses that haven't opted into the asset
        console.log(`ℹ️ Address ${address} has not opted into SIZ token (expected for new users)`);
        return { wasFrozen: false };
      }
      
      if (errorMessage.includes('account not found') || errorMessage.includes('404')) {
        // This is expected for test addresses or non-existent accounts
        console.log(`ℹ️ Address ${address} not found (expected for test addresses)`);
        return { wasFrozen: false };
      }
      
      // Log other errors but don't fail the transfer
      console.warn(`⚠️ Asset freeze check failed for ${address}:`, errorMessage);
      return { wasFrozen: false };
    }
  }

  /**
   * Direct transfer SIZ tokens (original method)
   */
  private async transferDirect(params: TokenTransferParams): Promise<TransferResult> {
    try {
      // Validate receiver address
      if (!isValidAlgorandAddress(params.receiverAddress)) {
        return { success: false, error: 'Invalid receiver address format' };
      }

      // Check central wallet balance
      const balanceCheck = await this.checkCentralWalletBalance();
      if (!balanceCheck.hasBalance) {
        return { success: false, error: balanceCheck.error || 'Insufficient balance in central wallet' };
      }

      if (balanceCheck.balance < params.amount) {
        return { 
          success: false, 
          error: `Insufficient balance. Available: ${balanceCheck.balance}, Required: ${params.amount}` 
        };
      }

      // Check receiver opt-in status with detailed information
      const optInCheck = await this.checkReceiverOptIn(params.receiverAddress);
      if (!optInCheck.isOptedIn) {
        const optInInstructions = this.generateOptInInstructions(params.receiverAddress, optInCheck);
        return { 
          success: false, 
          error: `Receiver ${params.receiverAddress} has not opted into SIZ token`,
          requiresOptIn: true,
          optInInstructions
        };
      }

      // Check freeze status
      const freezeCheck = await this.checkAssetFreezeStatus(params.receiverAddress);
      if (freezeCheck.centralWalletFrozen) {
        return { success: false, error: 'SIZ token is frozen for central wallet' };
      }
      if (freezeCheck.receiverFrozen) {
        return { success: false, error: 'SIZ token is frozen for receiver wallet' };
      }

      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do();

      // Construct asset transfer transaction
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: this.getDerivedCentralWalletAddress(),
        to: params.receiverAddress,
        assetIndex: Number(this.assetId),
        amount: params.amount,
        suggestedParams,
      } as any);

      // Sign transaction with mnemonic-derived private key
              const account = algosdk.mnemonicToSecretKey(this.centralWalletMnemonic.trim());
        const signedTxn = txn.signTxn(account.sk);

      // Send transaction
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      // Wait for confirmation (4 rounds)
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

      return {
        success: true,
        txId,
        confirmedTxn,
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during transfer',
      };
    }
  }

  /**
   * Fallback method: Simple direct token transfer with opt-in handling
   * This is the recommended approach for reliable token transfers
   */
  async transferSizTokensDirect(params: TokenTransferParams): Promise<TransferResult> {
    try {
      console.log(`🚀 Starting direct transfer of ${params.amount} SIZ tokens to ${params.receiverAddress}`);
      console.log(`   Asset ID: ${this.assetId}`);
      console.log(`   Payment ID: ${params.paymentId}`);
      
      // Step 1: Check if receiver is already opted into SIZ tokens
      console.log('\n📋 Step 1: Checking receiver opt-in status...');
      const optInStatus = await this.checkReceiverOptIn(params.receiverAddress);
      
      if (optInStatus.isOptedIn) {
        console.log('✅ Receiver already opted into SIZ tokens, proceeding with direct transfer...');
        return await this.executeDirectTransfer(params);
      }
      
      // Step 2: Receiver is not opted in - handle opt-in requirements
      console.log('\n📋 Step 2: Receiver not opted in, handling opt-in requirements...');
      
      if (!optInStatus.canOptIn) {
        const errorMessage = `Receiver wallet ${params.receiverAddress} has insufficient ALGO balance (${optInStatus.alogBalance} ALGO) to opt into SIZ tokens. Minimum required: ${optInStatus.minBalanceRequired} ALGO`;
        console.error('❌ Insufficient ALGO for opt-in:', errorMessage);
        
        return {
          success: false,
          error: errorMessage,
          requiresOptIn: true,
          optInInstructions: `User needs ${optInStatus.minBalanceRequired} ALGO to opt into SIZ tokens. Current balance: ${optInStatus.alogBalance} ALGO`
        };
      }
      
      // Step 3: Receiver can opt in but needs guidance
      console.log('⚠️ Receiver can opt in but needs to do so manually');
      console.log(`   Current balance: ${optInStatus.alogBalance} ALGO`);
      console.log(`   Required for opt-in: ${optInStatus.minBalanceRequired} ALGO`);
      
      return {
        success: false,
        error: 'User wallet not opted into SIZ tokens',
        requiresOptIn: true,
        optInInstructions: `Please opt into SIZ tokens (Asset ID: ${this.assetId}) in your wallet. You have sufficient ALGO balance (${optInStatus.alogBalance} ALGO) to complete the opt-in.`
      };
      
    } catch (error) {
      console.error('❌ Direct transfer failed:', error);
      
      // Check if this is an opt-in related error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not opted in') || errorMessage.includes('opted in')) {
        return {
          success: false,
          error: 'User wallet not opted into SIZ tokens',
          requiresOptIn: true,
          optInInstructions: `Please opt into SIZ tokens (Asset ID: ${this.assetId}) in your wallet before receiving the transfer.`
        };
      }
      
      throw error;
    }
  }

  /**
   * Execute direct token transfer (receiver must be opted in)
   */
  private async executeDirectTransfer(params: TokenTransferParams): Promise<TransferResult> {
    try {
      console.log('🔄 Executing direct SIZ token transfer...');
      
      // Get central wallet account
      const centralAccount = algosdk.mnemonicToSecretKey(this.centralWalletMnemonic);
      console.log(`   Central wallet: ${centralAccount.addr}`);
      
      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do();
      console.log(`   Fee: ${suggestedParams.fee} microALGO`);
      console.log(`   First valid round: ${suggestedParams.firstValid}`);
      console.log(`   Last valid round: ${suggestedParams.lastValid}`);
      
      // Create asset transfer transaction
      const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: centralAccount.addr,
        receiver: params.receiverAddress,
        assetIndex: Number(this.assetId),
        amount: params.amount,
        suggestedParams,
      });
      
      console.log('✅ Asset transfer transaction created');
      
      // Sign the transaction
      const signedTxn = algosdk.signTransaction(transferTxn, centralAccount.sk);
      console.log('✅ Transaction signed');
      
      // Submit the transaction
      console.log('📡 Submitting transaction to network...');
      const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
      const txId = response.txid;
      console.log(`✅ Transaction submitted! TxId: ${txId}`);
      
      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const confirmation = await algosdk.waitForConfirmation(algodClient, txId, 4);
      console.log(`✅ Transaction confirmed! Block: ${confirmation.confirmedRound}`);
      
      return {
        success: true,
        txId: txId,
        requiresOptIn: false
      };
      
    } catch (error) {
      console.error('❌ Direct transfer execution failed:', error);
      throw error;
    }
  }

  /**
   * Production-ready hybrid transfer approach using ALGO funding + ARC-0059
   * This autonomously funds the user wallet and sends tokens via ARC-0059 inbox
   */
  async transferSizTokensHybrid(params: TokenTransferParams): Promise<TransferResult> {
    try {
      console.log(`🚀 Starting ALGO funding + ARC-0059 transfer for ${params.amount} SIZ tokens to ${params.receiverAddress}`);
      console.log(`   Asset ID: ${this.assetId}`);
      console.log(`   Payment ID: ${params.paymentId}`);
      
      // Initialize AlgoKit client using recommended mainnet factory
      const algorand = algokit.AlgorandClient.mainNet();

      // Get central wallet account
      const centralWalletMnemonic = process.env.CENTRAL_WALLET_MNEMONIC;
      if (!centralWalletMnemonic) {
        throw new Error('CENTRAL_WALLET_MNEMONIC not found in environment variables');
      }
      const centralAccount = algosdk.mnemonicToSecretKey(centralWalletMnemonic);

      

      // Step 1: Check if user wallet is already opted into SIZ tokens
      console.log('\n📋 Step 1: Checking user wallet opt-in status...');
      let optInStatus;
      try {
        optInStatus = await this.checkReceiverOptIn(params.receiverAddress);
      } catch (optInError) {
        console.log('⚠️ Error checking opt-in status, proceeding with funding + ARC-0059:', optInError instanceof Error ? optInError.message : 'Unknown error');
        optInStatus = {
          isOptedIn: false,
          canOptIn: false,
          alogBalance: 0,
          minBalanceRequired: 0.1,
          error: 'Could not determine opt-in status'
        };
      }
      
      // If user is already opted in, use direct transfer for efficiency
      if (optInStatus.isOptedIn) {
        console.log('✅ User wallet already opted into SIZ tokens - proceeding with direct transfer...');
        return await this.executeDirectTransfer(params);
      }
      
                    // Step 2: Fund user wallet with ALGO for opt-in/claiming
              console.log('\n💰 Step 2: Funding user wallet with ALGO...');
              const fundingResult = await fundReceiverIfNeeded({
                algorand: algorand as any, // Type assertion for compatibility
                receiver: params.receiverAddress,
                centralAccount,
                minSpendableAlgo: algokit.algos(0.1), // This parameter is now ignored, using TARGET_TOTAL instead
              });

      if (!fundingResult.success) {
        console.log('❌ ALGO funding failed:', fundingResult.error);
        return {
          success: false,
          error: `Failed to fund user wallet: ${fundingResult.error}`,
          requiresOptIn: true,
          requiresUserAction: true,
          actionRequired: 'add-algo',
          instructions: `Unable to automatically fund your wallet. Please add at least 0.1 ALGO to your wallet to receive SIZ tokens.`
        };
      }

      if (fundingResult.funded) {
        console.log(`✅ User wallet funded with ${fundingResult.amount} ALGO`);
      } else {
        console.log('✅ User wallet already has sufficient ALGO balance');
      }

                    // Step 3: Send SIZ tokens via ARC-0059 inbox
              console.log('\n🚀 Step 3: Sending SIZ tokens via ARC-0059...');
              const arc59Result = await sendSizViaArc59({
                algorand: algorand as any, // Type assertion for compatibility
                sender: centralAccount.addr.toString(),
                receiver: params.receiverAddress,
                assetId: BigInt(this.assetId),
                amount: BigInt(params.amount),
              });

              if (!arc59Result.success) {
                console.log('❌ ARC-0059 send failed:', arc59Result.error);
                return {
                  success: false,
                  error: `Failed to send tokens via ARC-0059: ${arc59Result.error}`,
                  requiresOptIn: true,
                  requiresUserAction: true,
                  actionRequired: 'retry',
                  instructions: `Token transfer failed. Please try again or contact support.`
                };
              }

              console.log('✅ SIZ tokens sent successfully via ARC-0059!');
              console.log(`   Transaction ID: ${arc59Result.txId}`);
              console.log(`   Inbox Address: ${arc59Result.inboxAddress}`);

              // Step 4: Autonomously claim tokens for the receiver
              console.log('\n🎯 Step 4: Autonomously claiming tokens from inbox...');
              const claimResult = await claimSizFromInbox({
                algorand: algorand as any, // Type assertion for compatibility
                receiver: params.receiverAddress,
                assetId: BigInt(this.assetId),
              });

              if (!claimResult.success) {
                console.log('⚠️ Autonomous claim failed:', claimResult.error);
                console.log('   Tokens are still in the inbox and can be claimed manually');
                
                return {
                  success: true, // Send was successful, claim failed
                  txId: arc59Result.txId,
                  requiresOptIn: false,
                  requiresUserAction: true,
                  actionRequired: 'claim',
                  instructions: `🎉 Your SIZ tokens have been sent to your ARC-0059 inbox!\n\n` +
                    `To claim your tokens:\n` +
                    `1. Open your Algorand wallet (Pera, Defly, MyAlgo, etc.)\n` +
                    `2. Look for "Claimable Assets" or "Inbox" section\n` +
                    `3. Find SIZ tokens and claim them to your wallet\n` +
                    `4. You may need to opt into SIZ tokens first (Asset ID: ${this.assetId})\n\n` +
                    `Your wallet has been funded with ALGO to complete the claim process.`,
                  optInInstructions: `Claim your SIZ tokens from your ARC-0059 inbox. Your wallet has been funded with ALGO for the claim process.`
                };
              }

              console.log('✅ SIZ tokens claimed successfully!');
              console.log(`   Claim Transaction ID: ${claimResult.txId}`);

              return {
                success: true,
                txId: arc59Result.txId,
                requiresOptIn: false,
                requiresUserAction: false,
                instructions: `🎉 Your SIZ tokens have been successfully transferred and claimed to your wallet!`
              };
      
    } catch (error) {
      console.error('❌ ALGO funding + ARC-0059 transfer failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Transfer failed: ${errorMessage}`,
        requiresOptIn: true,
        requiresUserAction: true,
        actionRequired: 'retry',
        instructions: `Token transfer failed. Please try again or contact support. Error: ${errorMessage}`
      };
    }
  }

  /**
   * Generate opt-in instructions for users
   */
  generateOptInInstructions(receiverAddress: string, optInStatus: OptInStatus): string {
    if (optInStatus.isOptedIn) {
      return 'Your wallet is already opted into SIZ tokens. You can receive tokens immediately.';
    }

    if (!optInStatus.canOptIn) {
      return `Your wallet needs at least ${optInStatus.minBalanceRequired} ALGO to opt into SIZ tokens. Current balance: ${optInStatus.alogBalance?.toFixed(4) || 'Unknown'} ALGO. Please add more ALGO to your wallet.`;
    }

    return `To receive SIZ tokens, you need to opt into the SIZ asset. This requires a small transaction fee (about 0.001 ALGO) and increases your minimum balance by 0.1 ALGO. You can opt-in using any Algorand wallet (Pera, MyAlgo, Defly, etc.) by adding the SIZ token asset ID: ${this.assetId.toString()}. After opt-in, refresh this page to verify your wallet is ready.`;
  }

  /**
   * Get transaction details by transaction ID
   */
  async getTransactionDetails(txId: string): Promise<any> {
    try {
      const txn = await algodClient.pendingTransactionInformation(txId).do();
      return txn;
    } catch (error) {
      throw new Error(`Failed to get transaction details: ${error}`);
    }
  }

  /**
   * Production-ready token transfer flow following Algorand best practices
   * 1. Fund recipient MBR if needed
   * 2. Check opt-in status
   * 3. Handle opt-in if required
   * 4. Transfer tokens
   */
  async transferSizTokensProduction(params: TokenTransferParams): Promise<TransferResult> {
    try {
      console.log(`🚀 Starting production token transfer flow for ${params.amount} SIZ tokens to ${params.receiverAddress}`);
      console.log(`   Asset ID: ${this.assetId}`);
      console.log(`   Payment ID: ${params.paymentId}`);

      // Step 1: Check current opt-in status and balance
      console.log('\n📋 Step 1: Checking recipient status...');
      const status = await this.checkOptInAndBalance(params.receiverAddress);
      console.log('   Status:', status);

      // Step 2: Fund recipient MBR if needed
      if (status.requiredFunding > 0) {
        console.log(`\n💰 Step 2: Funding recipient with ${status.requiredFunding} microAlgos for MBR...`);
        const fundingResult = await this.fundRecipientMBR(params.receiverAddress, status.requiredFunding);
        console.log(`   Funding successful: ${fundingResult.txId}`);
        
        // Wait for funding to be confirmed before proceeding
        await this.waitForConfirmation(fundingResult.txId);
      } else {
        console.log('\n💰 Step 2: Recipient already has sufficient balance for MBR');
      }

      // Step 3: Check opt-in status again after funding
      const updatedStatus = await this.checkOptInAndBalance(params.receiverAddress);
      console.log('\n📋 Step 3: Updated status after funding:', updatedStatus);

      // Step 4: Handle opt-in if required
      if (!updatedStatus.isOptedIn) {
        console.log('\n🔐 Step 4: Recipient needs to opt-in to SIZ tokens');
        console.log('   Note: In production, this would be signed by the user\'s connected wallet');
        console.log('   For testing, we\'ll use the provided mnemonic');
        
        // In production, this would be a user action
        // For testing, we can simulate it if we have the user's mnemonic
        if (process.env.TEST_USER_MNEMONIC) {
          console.log('   Using test user mnemonic for opt-in...');
          const optInResult = await this.recipientOptInASA(params.receiverAddress, process.env.TEST_USER_MNEMONIC);
          console.log(`   Opt-in successful: ${optInResult.txId}`);
          await this.waitForConfirmation(optInResult.txId);
        } else {
          console.log('   ⚠️  No test user mnemonic provided - user must opt-in manually');
          return {
            success: false,
            error: 'User must opt-in to SIZ tokens before transfer can proceed',
            requiresUserAction: true,
            actionRequired: 'opt-in',
            instructions: 'Please opt-in to SIZ tokens using your wallet before completing the transfer'
          };
        }
      } else {
        console.log('\n🔐 Step 4: Recipient already opted into SIZ tokens');
      }

      // Step 5: Transfer SIZ tokens
      console.log('\n🚀 Step 5: Executing SIZ token transfer...');
      const transferResult = await this.directASATransfer(params.receiverAddress, params.amount);
      console.log(`   Transfer successful: ${transferResult.txId}`);

      // Wait for transfer confirmation
      await this.waitForConfirmation(transferResult.txId);

      console.log('✅ Production token transfer flow completed successfully!');
      
      return {
        success: true,
        txId: transferResult.txId,
        message: 'SIZ tokens transferred successfully'
      };

    } catch (error) {
      console.error('❌ Production token transfer flow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        requiresUserAction: false
      };
    }
  }

  /**
   * Check recipient opt-in status and balance requirements
   */
  private async checkOptInAndBalance(receiverAddress: string): Promise<{
    isOptedIn: boolean;
    hasEnoughForOptIn: boolean;
    requiredFunding: number;
  }> {
    try {
      const acctInfo = await algodClient.accountInformation(receiverAddress).do();
      const asset = acctInfo.assets?.find((a: any) => a['asset-id'] === Number(this.assetId));
      const isOptedIn = !!asset;
      
      // Calculate minimum balance requirement
      const currentAssetCount = acctInfo.assets?.length || 0;
      const newAssetCount = isOptedIn ? currentAssetCount : currentAssetCount + 1;
      const minBalance = 100_000 + (newAssetCount * 100_000); // Base + per-asset MBR
      
      const hasEnoughForOptIn = Number(acctInfo.amount) >= minBalance;
      const requiredFunding = hasEnoughForOptIn ? 0 : minBalance - Number(acctInfo.amount);
      
      return { isOptedIn, hasEnoughForOptIn, requiredFunding };
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      throw error;
    }
  }

  /**
   * Fund recipient with ALGO for MBR requirements
   */
  private async fundRecipientMBR(receiverAddress: string, amountMicroAlgos: number): Promise<{
    txId: string;
    confirmedRound: number;
  }> {
    try {
      const centralAccount = algosdk.mnemonicToSecretKey(this.centralWalletMnemonic);
      const sender = centralAccount.addr.toString();

      // Validate addresses
      if (!algosdk.isValidAddress(sender)) throw new Error('Invalid central wallet address');
      if (!algosdk.isValidAddress(receiverAddress)) throw new Error('Invalid receiver address');

      // Check if receiver already has enough balance (idempotency)
      const acctInfo = await algodClient.accountInformation(receiverAddress).do();
      if (Number(acctInfo.amount) >= amountMicroAlgos) {
        console.log('   Recipient already has sufficient balance');
        return { txId: '', confirmedRound: 0 };
      }

      const params = await algodClient.getTransactionParams().do();
      params.flatFee = true;
      params.fee = BigInt(1000);

      const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender,
        receiver: receiverAddress,
        amount: BigInt(amountMicroAlgos),
        suggestedParams: params,
      });

      const signed = algosdk.signTransaction(payTxn, centralAccount.sk);
      const response = await algodClient.sendRawTransaction(signed.blob).do();
      const txId = response.txid;
      
      // Wait for confirmation and return proper data
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 4);
      return { txId, confirmedRound: Number(confirmed.confirmedRound) || 0 };
    } catch (error) {
      console.error('Error funding recipient MBR:', error);
      throw error;
    }
  }

  /**
   * Recipient opts into SIZ tokens (signed by recipient)
   */
  private async recipientOptInASA(receiverAddress: string, receiverMnemonic: string): Promise<{
    txId: string;
    confirmedRound: number;
  }> {
    try {
      const acct = algosdk.mnemonicToSecretKey(receiverMnemonic);
      const from = acct.addr.toString();

      // Verify the mnemonic matches the receiver address
      if (from !== receiverAddress) {
        throw new Error('Receiver mnemonic does not match receiver address');
      }

      const params = await algodClient.getTransactionParams().do();
      params.flatFee = true;
      params.fee = BigInt(1000);

      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: from,
        receiver: from,
        assetIndex: Number(this.assetId),
        amount: BigInt(0),
        suggestedParams: params,
      });

      const signed = algosdk.signTransaction(optInTxn, acct.sk);
      const response = await algodClient.sendRawTransaction(signed.blob).do();
      const txId = response.txid;
      
      // Wait for confirmation and return proper data
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 4);
      return { txId, confirmedRound: Number(confirmed.confirmedRound) || 0 };
    } catch (error) {
      console.error('Error in recipient opt-in:', error);
      throw error;
    }
  }

  /**
   * Direct ASA transfer after opt-in
   */
  private async directASATransfer(receiverAddress: string, amount: number): Promise<{
    txId: string;
    confirmedRound: number;
  }> {
    try {
      const centralAccount = algosdk.mnemonicToSecretKey(this.centralWalletMnemonic);
      const from = centralAccount.addr.toString();

      const params = await algodClient.getTransactionParams().do();
      params.flatFee = true;
      params.fee = BigInt(1000);

      const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: from,
        receiver: receiverAddress,
        assetIndex: Number(this.assetId),
        amount: BigInt(amount),
        suggestedParams: params,
      });

      const signed = algosdk.signTransaction(axferTxn, centralAccount.sk);
      const response = await algodClient.sendRawTransaction(signed.blob).do();
      const txId = response.txid;
      
      // Wait for confirmation and return proper data
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 4);
      return { txId, confirmedRound: Number(confirmed.confirmedRound) || 0 };
    } catch (error) {
      console.error('Error in direct ASA transfer:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForConfirmation(txId: string): Promise<void> {
    try {
      console.log(`   Waiting for transaction ${txId} confirmation...`);
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 4);
      console.log(`   Transaction confirmed at round ${confirmed.confirmedRound}`);
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sizTokenTransferService = new SizTokenTransferService();
