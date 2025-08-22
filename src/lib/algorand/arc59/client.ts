import algosdk from 'algosdk';
import { algodClient } from '../client';
import crypto from 'crypto';

// Helper function to generate method selector from method signature
// This follows the ARC-4 specification for method selector generation
function generateMethodSelector(methodSignature: string): Uint8Array {
  // ARC-4 method selector is the first 4 bytes of the SHA-512/256 hash of the method signature
  const hash = crypto.createHash('sha512-256').update(methodSignature, 'ascii').digest();
  return new Uint8Array(hash.slice(0, 4));
}

// ARC-0059 Method Selectors (4-byte hashes of method signatures)
// These are derived from the method signatures according to ARC-4 specification
const ARC59_METHOD_SELECTORS = {
  // arc59_getSendAssetInfo(address,uint64)(uint64,uint64,bool,bool,uint64,uint64)
  getSendAssetInfo: generateMethodSelector('arc59_getSendAssetInfo(address,uint64)(uint64,uint64,bool,bool,uint64,uint64)'),
  
  // arc59_optRouterIn(uint64)void
  optRouterIn: generateMethodSelector('arc59_optRouterIn(uint64)void'),
  
  // arc59_sendAsset(axfer,address,uint64)address
  sendAsset: generateMethodSelector('arc59_sendAsset(axfer,address,uint64)address'),
  
  // arc59_getInbox(address)address
  getInbox: generateMethodSelector('arc59_getInbox(address)address'),
  
  // arc59_claim(uint64)void
  claim: generateMethodSelector('arc59_claim(uint64)void'),
  
  // arc59_claimAlgo()void
  claimAlgo: generateMethodSelector('arc59_claimAlgo()void'),
  
  // arc59_reject(uint64)void
  reject: generateMethodSelector('arc59_reject(uint64)void'),
  
  // arc59_getOrCreateInbox(address)address
  getOrCreateInbox: generateMethodSelector('arc59_getOrCreateInbox(address)address')
};

// ABI encoding helpers for ARC-4
const ABI_ENCODING = {
  // Encode uint64 to 8-byte big-endian
  encodeUint64: (value: number | bigint): Uint8Array => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(value), false); // false = big-endian
    return new Uint8Array(buffer);
  },
  
  // Encode address (32-byte public key)
  encodeAddress: (address: string): Uint8Array => {
    return algosdk.decodeAddress(address).publicKey;
  },
  
  // Encode boolean (1 byte, 0x80 for true, 0x00 for false)
  encodeBool: (value: boolean): Uint8Array => {
    return new Uint8Array([value ? 0x80 : 0x00]);
  }
};

export interface Arc59ClientConfig {
  appId: number;
  sender: string;
  signer: algosdk.TransactionSigner;
}

export interface SendAssetInfo {
  itxns: bigint;
  mbr: bigint;
  routerOptedIn: boolean;
  receiverOptedIn: boolean;
  receiverAlgoNeededForClaim: bigint;
}

export interface SendAssetParams {
  receiver: string;
  assetId: bigint;
  amount: bigint;
  additionalReceiverFunds: bigint;
}

export interface ClaimAssetParams {
  assetId: bigint;
  claimer: string;
}

export class Arc59Client {
  private appId: number;
  private sender: string;
  private signer: algosdk.TransactionSigner;

  constructor(config: Arc59ClientConfig) {
    this.appId = config.appId;
    this.sender = config.sender;
    this.signer = config.signer;
  }

  /**
   * Get information needed to send an asset via ARC-0059
   * Following ARC-4 method invocation specification
   */
  async getSendAssetInfo(receiver: string, assetId: bigint): Promise<SendAssetInfo> {
    // Convert assetId to number for comparisons - declare at function level for scope
    const assetIdNumber = Number(assetId);
    
    try {
      console.log(`🔍 [ARC-0059] Getting send asset info for:`, {
        receiver,
        assetId: assetId.toString()
      });

      // Use proper ARC-4 method invocation
      const methodSelector = ARC59_METHOD_SELECTORS.getSendAssetInfo;
      
      const txn = algosdk.makeApplicationCallTxnFromObject({
        appIndex: this.appId,
        sender: this.sender,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          methodSelector, // ApplicationArgs[0]: Method selector (4-byte)
          ABI_ENCODING.encodeAddress(receiver), // ApplicationArgs[1]: ABI-encoded receiver address
          ABI_ENCODING.encodeUint64(assetId) // ApplicationArgs[2]: ABI-encoded asset ID (uint64)
        ],
        foreignAssets: [assetIdNumber],
        suggestedParams: await algodClient.getTransactionParams().do()
      });

      console.log(`📝 [ARC-0059] Created transaction with ARC-4 method invocation:`, {
        methodSelector: Array.from(methodSelector).map(b => b.toString(16).padStart(2, '0')).join(''),
        receiver: receiver,
        assetId: assetId.toString(),
        appArgs: [
          'Method Selector (4-byte)',
          'ABI-encoded receiver address',
          'ABI-encoded asset ID (uint64)'
        ]
      });

      const signedTxn = await this.signer([txn], [0]);
      const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
      
      console.log(`✅ [ARC-0059] Transaction sent successfully:`, response.txid);
      
      await algosdk.waitForConfirmation(algodClient, response.txid, 4);
      
      // Get the actual account information to determine opt-in status
      const receiverAccount = await algodClient.accountInformation(receiver).do();
      const isReceiverOptedIn = receiverAccount.assets?.some((a: any) => Number(a.assetId) === assetIdNumber) || false;
      
      // Check if router is opted into the asset
      const routerAccount = await algodClient.accountInformation(algosdk.getApplicationAddress(this.appId)).do();
      const isRouterOptedIn = routerAccount.assets?.some((a: any) => Number(a.assetId) === assetIdNumber) || false;
      
      // Calculate MBR and transaction requirements based on ARC-0059 spec
      let itxns = 1n; // Base transaction
      let mbr = 0n;
      let receiverAlgoNeededForClaim = 0n;
      
      if (!isReceiverOptedIn) {
        // Receiver needs to opt in
        itxns += 1n; // Opt-in transaction
        mbr += 100000n; // 0.1 ALGO for asset opt-in
        
        // Check if receiver has enough ALGO for opt-in
        const receiverBalance = BigInt(receiverAccount.amount);
        const minBalanceRequired = BigInt(receiverAccount.minBalance) + 100000n; // min balance + asset opt-in MBR
        
        if (receiverBalance < minBalanceRequired) {
          receiverAlgoNeededForClaim = minBalanceRequired - receiverBalance;
        }
      }
      
      if (!isRouterOptedIn) {
        // Router needs to opt in
        itxns += 1n; // Router opt-in transaction
        mbr += 100000n; // 0.1 ALGO for router asset opt-in
      }
      
      // If receiver doesn't have an inbox, we need to create one
      // This requires additional transactions and MBR
      if (!isReceiverOptedIn) {
        itxns += 2n; // Create inbox + rekey transactions
        mbr += 100000n; // Additional MBR for inbox creation
      }
      
      const result: SendAssetInfo = {
        itxns,
        mbr,
        routerOptedIn: isRouterOptedIn,
        receiverOptedIn: isReceiverOptedIn,
        receiverAlgoNeededForClaim
      };
      
      console.log(`📊 [ARC-0059] Send asset info calculated:`, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ [ARC-0059] Failed to get send asset info:`, error);
      
      // Return fallback information based on basic checks
      try {
        const receiverAccount = await algodClient.accountInformation(receiver).do();
        const isOptedIn = receiverAccount.assets?.some((a: any) => Number(a.assetId) === assetIdNumber) || false;
        
        return {
          itxns: isOptedIn ? 1n : 3n,
          mbr: isOptedIn ? 0n : 100000n,
          routerOptedIn: false, // Assume router needs opt-in
          receiverOptedIn: isOptedIn,
          receiverAlgoNeededForClaim: isOptedIn ? 0n : 100000n
        };
      } catch (fallbackError) {
        // Last resort fallback
        return {
          itxns: 3n,
          mbr: 100000n,
          routerOptedIn: false,
          receiverOptedIn: false,
          receiverAlgoNeededForClaim: 100000n
        };
      }
    }
  }

  /**
   * Opt the ARC59 router into the ASA. This is required before this app can be used to send the ASA to anyone.
   * Following ARC-0059 specification: arc59_optRouterIn
   */
  async optRouterIn(assetId: bigint): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    const baseFee = Number(suggestedParams.fee) || 1000;
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.optRouterIn,
        algosdk.encodeUint64(Number(assetId))
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams: {
        ...suggestedParams,
        flatFee: true,
        fee: Math.max(3000, baseFee * 3)
      }
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    return response.txid;
  }

  /**
   * Send an asset to a receiver using the ARC59 router
   * Following ARC-0059 specification: arc59_sendAsset
   */
  async sendAsset(params: SendAssetParams): Promise<string> {
    const { receiver, assetId, amount, additionalReceiverFunds } = params;
    
    try {
      console.log(`🚀 [ARC-0059] Starting asset transfer:`, {
        receiver,
        assetId: Number(assetId),
        amount: Number(amount),
        additionalReceiverFunds: Number(additionalReceiverFunds)
      });

      const suggestedParams = await algodClient.getTransactionParams().do();
      const baseFee = Number(suggestedParams.fee) || 1000;
      
      // Step 1: Create the asset transfer transaction to the router
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: this.sender,
        receiver: algosdk.getApplicationAddress(this.appId),
        assetIndex: Number(assetId),
        amount: Number(amount),
        suggestedParams
      });

      // Step 2: Create the application call to send the asset via router
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        appIndex: this.appId,
        sender: this.sender,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          ARC59_METHOD_SELECTORS.sendAsset,
          algosdk.decodeAddress(receiver).publicKey,
          algosdk.encodeUint64(Number(additionalReceiverFunds))
        ],
        foreignAssets: [Number(assetId)],
        suggestedParams: {
          ...suggestedParams,
          flatFee: true,
          fee: Math.max(4000, baseFee * 4)
        }
      });

      // Step 3: Group the transactions atomically
      const groupId = algosdk.computeGroupID([assetTransferTxn, appCallTxn]);
      assetTransferTxn.group = groupId;
      appCallTxn.group = groupId;

      console.log(`📝 [ARC-0059] Transaction group created:`, {
        groupId: Buffer.from(groupId).toString('hex')
      });

      // Step 4: Sign both transactions together
      const signedGroup = await this.signer([assetTransferTxn, appCallTxn], [0, 1]);
      console.log(`✍️ [ARC-0059] Transactions signed:`, {
        signedCount: signedGroup.length,
        firstLen: signedGroup[0]?.length,
        secondLen: signedGroup[1]?.length
      });

      // Step 5: Submit the transaction group
      const response = await algodClient.sendRawTransaction(signedGroup).do();
      
      console.log(`🚀 [ARC-0059] Transaction group submitted:`, response.txid);
      
      // Step 6: Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, response.txid, 4);
      console.log(`✅ [ARC-0059] Transaction group confirmed!`);
      
      return response.txid;
      
    } catch (error) {
      console.error(`❌ [ARC-0059] Asset transfer failed:`, error);
      
      // Provide detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as any;
        console.error(`📡 [ARC-0059] Network response:`, {
          status: responseError.response?.status,
          body: responseError.response?.body,
          text: responseError.response?.text
        });
      }
      
      throw new Error(`ARC-0059 asset transfer failed: ${(error as Error).message}`);
    }
  }

  /**
   * Claim an asset from the ARC59 inbox
   * Following the exact pattern from the reference implementation: arc59_claim
   * 
   * IMPORTANT: Prior to calling this, a call to arc59_claimAlgo SHOULD be made
   * if the inbox balance is above its minimum balance.
   */
  async claimAsset(params: ClaimAssetParams): Promise<string> {
    const { assetId, claimer } = params;
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: claimer,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.claim,
        algosdk.encodeUint64(Number(assetId))
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    return response.txid;
  }

  /**
   * Claim any extra ALGO from the inbox
   * This SHOULD be called before claiming assets if the inbox has extra ALGO
   * Following ARC-0059 specification: arc59_claimAlgo
   */
  async claimAlgo(claimer: string): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: claimer,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.claimAlgo
      ],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    return response.txid;
  }

  /**
   * Check the balance of an asset in a receiver's inbox
   */
  async checkInboxBalance(receiver: string, assetId: bigint): Promise<number> {
    try {
      const inboxAddress = await this.getInboxAddress(receiver);
      if (inboxAddress === '') {
        return 0; // No inbox exists
      }
      
      const inboxAccount = await algodClient.accountInformation(inboxAddress).do();
      const assetHolding = inboxAccount.assets?.find(a => a.assetId === assetId);
      
      return assetHolding ? Number(assetHolding.amount) : 0;
    } catch (error) {
      console.error('Error checking inbox balance:', error);
      return 0;
    }
  }

  /**
   * Get the inbox address for the given receiver
   * Following ARC-0059 specification: arc59_getInbox
   */
  async getInboxAddress(receiver: string): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.getInbox,
        algosdk.decodeAddress(receiver).publicKey
      ],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    
    // Parse the response to extract the inbox address
    // This would need to be implemented based on the actual response format
    // For now, return empty string as placeholder
    return '';
  }

  /**
   * Reject an asset by closing it out to the ASA creator
   * Following ARC-0059 specification: arc59_reject
   */
  async rejectAsset(params: ClaimAssetParams): Promise<string> {
    const { assetId, claimer } = params;
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: claimer,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.reject,
        algosdk.encodeUint64(Number(assetId))
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    return response.txid;
  }

  /**
   * Get or create an inbox for a receiver
   * Following ARC-0059 specification: arc59_getOrCreateInbox
   */
  async getOrCreateInbox(receiver: string): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.getOrCreateInbox,
        algosdk.decodeAddress(receiver).publicKey
      ],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    
    // Parse the response to extract the inbox address
    // This would need to be implemented based on the actual response format
    // For now, return empty string as placeholder
    return '';
  }
}
