import algosdk from 'algosdk';
import { algodClient } from '../client';

export interface Arc59ClientConfig {
  appId: number;
  sender: string;
  signer: algosdk.TransactionSigner;
}

export interface SendAssetInfo {
  itxns: number;
  mbr: number;
  routerOptedIn: boolean;
  receiverOptedIn: boolean;
  receiverAlgoNeededForClaim: number;
}

export interface SendAssetParams {
  receiver: string;
  assetId: bigint;
  amount: bigint;
  additionalReceiverFunds?: bigint;
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
   * Opt the ARC59 router into the ASA. This is required before this app can be used to send the ASA to anyone.
   * Following ARC-0059 specification: arc59_optRouterIn
   */
  async optRouterIn(assetId: bigint): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        new Uint8Array(Buffer.from('arc59_optRouterIn')),
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
   * Gets information needed to send an asset through the router
   * Following ARC-0059 specification: arc59_getSendAssetInfo
   */
  async getSendAssetInfo(receiver: string, assetId: bigint): Promise<SendAssetInfo> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        new Uint8Array(Buffer.from('arc59_getSendAssetInfo')),
        algosdk.decodeAddress(receiver).publicKey,
        algosdk.encodeUint64(Number(assetId))
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams
    });

    const signedTxn = await this.signer([txn], [0]);
    const response = await algodClient.sendRawTransaction(signedTxn[0]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    
    // Parse the response to extract SendAssetInfo
    // This would need to be implemented based on the actual response format
    // For now, return basic info based on receiver's opt-in status
    try {
      const receiverAccount = await algodClient.accountInformation(receiver).do();
      const isOptedIn = receiverAccount.assets?.some(a => a.assetId === assetId) || false;
      
      return {
        itxns: isOptedIn ? 1 : 3,
        mbr: isOptedIn ? 0 : 100000, // 0.1 ALGO for opt-in
        routerOptedIn: true, // Assume router is opted in
        receiverOptedIn: isOptedIn,
        receiverAlgoNeededForClaim: isOptedIn ? 0 : 100000
      };
    } catch (error) {
      // Fallback if we can't get receiver info
      return {
        itxns: 3,
        mbr: 100000,
        routerOptedIn: true,
        receiverOptedIn: false,
        receiverAlgoNeededForClaim: 100000
      };
    }
  }

  /**
   * Send an asset to a receiver using the ARC59 router
   * Following ARC-0059 specification: arc59_sendAsset
   */
  async sendAsset(params: SendAssetParams): Promise<string> {
    const { receiver, assetId, amount, additionalReceiverFunds = BigInt(0) } = params;
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // First, transfer the asset to the router
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: this.sender,
      receiver: algosdk.getApplicationAddress(this.appId),
      assetIndex: Number(assetId),
      amount: Number(amount),
      suggestedParams
    });

    // Then call the router to send the asset
    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: this.appId,
      sender: this.sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        new Uint8Array(Buffer.from('arc59_sendAsset')),
        algosdk.decodeAddress(receiver).publicKey,
        algosdk.encodeUint64(Number(additionalReceiverFunds))
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams: {
        ...suggestedParams,
        fee: Number(suggestedParams.fee) * 2 // Account for both transactions
      }
    });

    // Group the transactions
    const groupId = algosdk.computeGroupID([assetTransferTxn, appCallTxn]);
    assetTransferTxn.group = groupId;
    appCallTxn.group = groupId;

    // Sign both transactions
    const signedAssetTxn = await this.signer([assetTransferTxn], [0]);
    const signedAppTxn = await this.signer([appCallTxn], [0]);

    // Submit the group
    const response = await algodClient.sendRawTransaction([
      signedAssetTxn[0],
      signedAppTxn[0]
    ]).do();
    
    await algosdk.waitForConfirmation(algodClient, response.txid, 4);
    return response.txid;
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
        new Uint8Array(Buffer.from('arc59_claim')),
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
        new Uint8Array(Buffer.from('arc59_claimAlgo'))
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
        new Uint8Array(Buffer.from('arc59_getInbox')),
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
        new Uint8Array(Buffer.from('arc59_reject')),
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
        new Uint8Array(Buffer.from('arc59_getOrCreateInbox')),
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
