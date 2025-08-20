import algosdk from 'algosdk';
import { algodClient } from './client';
import { decodePrivateKey, isValidAlgorandAddress } from './utils';

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
}

export class SizTokenTransferService {
  private readonly assetId: number;
  private readonly centralWalletAddress: string;
  private readonly centralWallet: { addr: string; sk: Uint8Array };

  constructor() {
    if (!process.env.SIZ_TOKEN_ASSET_ID) {
      throw new Error('SIZ_TOKEN_ASSET_ID is not set');
    }
    if (!process.env.CENTRAL_WALLET_ADDRESS) {
      throw new Error('CENTRAL_WALLET_ADDRESS is not set');
    }
    if (!process.env.CENTRAL_WALLET_MNEMONIC) {
      throw new Error('CENTRAL_WALLET_MNEMONIC is not set');
    }

    // Validate mnemonic format (25 words, all lowercase, space-separated)
    const mnemonic = process.env.CENTRAL_WALLET_MNEMONIC.trim();
    if (!/^[a-z]+( [a-z]+){24}$/.test(mnemonic)) {
      throw new Error('CENTRAL_WALLET_MNEMONIC is invalid format. Expected 25 lowercase words separated by spaces.');
    }

    try {
      this.centralWallet = algosdk.mnemonicToSecretKey(mnemonic);
    } catch (err) {
      throw new Error(`Failed to convert mnemonic to secret key: ${(err as Error).message}`);
    }

    this.assetId = Number(process.env.SIZ_TOKEN_ASSET_ID);
    this.centralWalletAddress = process.env.CENTRAL_WALLET_ADDRESS;
  }

  /**
   * Get the derived central wallet address from mnemonic
   */
  getDerivedCentralWalletAddress(): string {
    return this.centralWallet.addr;
  }

  /**
   * Validate that the derived address matches the configured address
   */
  validateCentralWalletAddress(): boolean {
    return this.centralWallet.addr === this.centralWalletAddress;
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
          error: `Mnemonic-derived address (${this.centralWallet.addr}) does not match configured address (${this.centralWalletAddress})` 
        };
      }

      const accountInfo = await algodClient.accountInformation(this.centralWalletAddress).do();
      const assetHolding = accountInfo.assets?.find((asset: any) => asset.assetId === this.assetId);
      
      if (!assetHolding) {
        return { hasBalance: false, balance: 0, error: 'Central wallet has not opted into SIZ token' };
      }

      return { hasBalance: true, balance: assetHolding.amount };
    } catch (error) {
      return { hasBalance: false, balance: 0, error: `Failed to check balance: ${error}` };
    }
  }

  /**
   * Check if the receiver has opted into the SIZ token
   */
  async checkReceiverOptIn(receiverAddress: string): Promise<{ isOptedIn: boolean; error?: string }> {
    try {
      if (!isValidAlgorandAddress(receiverAddress)) {
        return { isOptedIn: false, error: 'Invalid Algorand address format' };
      }

      const accountInfo = await algodClient.accountInformation(receiverAddress).do();
      const assetHolding = accountInfo.assets?.find((asset: any) => asset.assetId === this.assetId);
      
      return { isOptedIn: !!assetHolding };
    } catch (error) {
      return { isOptedIn: false, error: `Failed to check opt-in status: ${error}` };
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
      const assetInfo = await algodClient.getAssetByID(this.assetId).do();
      const freezeAddress = assetInfo.params.freeze;
      
      if (!freezeAddress) {
        return { centralWalletFrozen: false, receiverFrozen: false };
      }

      // Check if central wallet is frozen
      const centralAccountInfo = await algodClient.accountInformation(this.centralWalletAddress).do();
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

      // Check receiver opt-in status
      const optInCheck = await this.checkReceiverOptIn(params.receiverAddress);
      if (!optInCheck.isOptedIn) {
        return { 
          success: false, 
          error: `Receiver ${params.receiverAddress} has not opted into SIZ token` 
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
        from: this.centralWalletAddress,
        to: params.receiverAddress,
        assetIndex: this.assetId,
        amount: params.amount,
        suggestedParams,
      });

      // Sign transaction with mnemonic-derived private key
      const signedTxn = txn.signTxn(this.centralWallet.sk);

      // Send transaction
      const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

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
}

// Export singleton instance
export const sizTokenTransferService = new SizTokenTransferService();
