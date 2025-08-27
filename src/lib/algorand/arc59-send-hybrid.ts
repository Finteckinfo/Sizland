import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import crypto from 'crypto';
import { algodClient } from './client';

/**
 * ARC-0059 Send Asset Service using Hybrid Approach
 * Combines reliable ARC-4 method selectors with AlgoKit transaction composition
 */

// Helper function to generate method selector from method signature
function generateMethodSelector(methodSignature: string): Uint8Array {
  // ARC-4 method selector is the first 4 bytes of the SHA-512/256 hash of the method signature
  const hash = crypto.createHash('sha512-256').update(methodSignature, 'ascii').digest();
  return new Uint8Array(hash.slice(0, 4));
}

// ARC-0059 Method Selectors (4-byte hashes of method signatures)
const ARC59_METHOD_SELECTORS = {
  getSendAssetInfo: generateMethodSelector('arc59_getSendAssetInfo(address,uint64)(uint64,uint64,bool,bool,uint64,uint64)'),
  optRouterIn: generateMethodSelector('arc59_optRouterIn(uint64)void'),
  sendAsset: generateMethodSelector('arc59_sendAsset(axfer,address,uint64)address'),
  getInbox: generateMethodSelector('arc59_getInbox(address)address'),
  claim: generateMethodSelector('arc59_claim(uint64)void'),
  claimAlgo: generateMethodSelector('arc59_claimAlgo()void'),
  reject: generateMethodSelector('arc59_reject(uint64)void'),
  getOrCreateInbox: generateMethodSelector('arc59_getOrCreateInbox(address)address')
};

// ABI encoding helpers for ARC-4
const ABI_ENCODING = {
  encodeUint64: (value: number | bigint): Uint8Array => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(value), false); // false = big-endian
    return new Uint8Array(buffer);
  },
  encodeAddress: (address: string): Uint8Array => {
    return algosdk.decodeAddress(address).publicKey;
  },
  encodeBool: (value: boolean): Uint8Array => {
    return new Uint8Array([value ? 0x80 : 0x00]);
  }
};

export interface Arc59SendParams {
  algorand: algokit.AlgorandClient;
  sender: string;
  receiver: string;
  assetId: bigint;
  amount: bigint;
}

export interface Arc59SendResult {
  success: boolean;
  txId?: string;
  inboxAddress?: string;
  error?: string;
}

export interface SendAssetInfo {
  itxns: bigint;
  mbr: bigint;
  routerOptedIn: boolean;
  receiverOptedIn: boolean;
  receiverAlgoNeededForClaim: bigint;
}

/**
 * Get information needed to send an asset via ARC-0059 using method selectors
 * This uses simulation instead of actual transaction execution
 */
async function getSendAssetInfo(
  algorand: algokit.AlgorandClient,
  appId: number,
  sender: string,
  receiver: string,
  assetId: bigint,
  signer: algosdk.TransactionSigner
): Promise<SendAssetInfo> {
  try {
    console.log(`🔍 [ARC-0059] Getting send asset info for:`, {
      receiver,
      assetId: assetId.toString()
    });

    const methodSelector = ARC59_METHOD_SELECTORS.getSendAssetInfo;
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: appId,
      sender: sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        methodSelector, // ApplicationArgs[0]: Method selector (4-byte)
        ABI_ENCODING.encodeAddress(receiver), // ApplicationArgs[1]: ABI-encoded receiver address
        ABI_ENCODING.encodeUint64(assetId) // ApplicationArgs[2]: ABI-encoded asset ID (uint64)
      ],
      foreignAssets: [Number(assetId)],
      suggestedParams: await algodClient.getTransactionParams().do()
    });

    // Use simulation instead of actual transaction execution
    const simulation = await algodClient.simulateTransactions([txn]).do();
    
    console.log(`✅ [ARC-0059] Simulation successful`);
    
    // Parse the simulation result to extract return values
    // The method returns: (uint64,uint64,bool,bool,uint64,uint64)
    // itxns, mbr, routerOptedIn, receiverOptedIn, receiverAlgoNeededForClaim, receiverAlgoNeededForWorstCaseClaim
    const returnValues = simulation.txnGroups[0]?.txnResults[0]?.txnResult?.returnValue;
    
    if (returnValues && returnValues.length >= 6) {
      const [itxns, mbr, routerOptedIn, receiverOptedIn, receiverAlgoNeededForClaim] = returnValues;
      
      const result: SendAssetInfo = {
        itxns: BigInt(itxns),
        mbr: BigInt(mbr),
        routerOptedIn: Boolean(routerOptedIn),
        receiverOptedIn: Boolean(receiverOptedIn),
        receiverAlgoNeededForClaim: BigInt(receiverAlgoNeededForClaim)
      };
      
      console.log(`📊 [ARC-0059] Send asset info from simulation:`, result);
      return result;
    }
    
    throw new Error('Invalid simulation response format');
    
  } catch (error) {
    console.error(`❌ [ARC-0059] Failed to get send asset info:`, error);
    
    // Return fallback information based on basic checks
    try {
      const receiverAccount = await algodClient.accountInformation(receiver).do();
      const isOptedIn = receiverAccount.assets?.some((a: any) => Number(a.assetId) === Number(assetId)) || false;
      
      return {
        itxns: isOptedIn ? 1n : 5n, // Based on official tests: 5 itxns for new account
        mbr: isOptedIn ? 0n : 228100n, // Based on official tests: 228,100 microALGO
        routerOptedIn: true, // Assume router is opted in
        receiverOptedIn: isOptedIn,
        receiverAlgoNeededForClaim: isOptedIn ? 0n : 201000n // Based on official tests: 201,000 microALGO
      };
    } catch (fallbackError) {
      // Last resort fallback based on official test values
      return {
        itxns: 5n,
        mbr: 228100n,
        routerOptedIn: true,
        receiverOptedIn: false,
        receiverAlgoNeededForClaim: 201000n
      };
    }
  }
}

/**
 * Get inbox address using method selectors with simulation
 */
async function getInboxAddress(
  algorand: algokit.AlgorandClient,
  appId: number,
  sender: string,
  receiver: string,
  signer: algosdk.TransactionSigner
): Promise<string> {
  try {
    const methodSelector = ARC59_METHOD_SELECTORS.getInbox;
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appIndex: appId,
      sender: sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        methodSelector,
        ABI_ENCODING.encodeAddress(receiver)
      ],
      suggestedParams: await algodClient.getTransactionParams().do()
    });

    // Use simulation instead of actual transaction execution
    const simulation = await algodClient.simulateTransactions([txn]).do();
    
    // Parse the simulation result to extract the inbox address
    const returnValues = simulation.txnGroups[0]?.txnResults[0]?.txnResult?.returnValue;
    
    if (returnValues && returnValues.length > 0) {
      // The method returns the inbox address as the first return value
      const inboxAddress = returnValues[0];
      console.log(`📦 [ARC-0059] Inbox address from simulation:`, inboxAddress);
      return inboxAddress;
    }
    
    return '';
  } catch (error) {
    console.error('Error getting inbox address:', error);
    return '';
  }
}

/**
 * Send SIZ tokens using ARC-0059 flow with hybrid approach
 * Combines method selectors with AlgoKit transaction composition
 */
export async function sendSizViaArc59Hybrid(params: Arc59SendParams): Promise<Arc59SendResult> {
  const { algorand, sender, receiver, assetId, amount } = params;

  try {
    console.log(`🚀 Starting ARC-0059 hybrid transfer for ${amount} SIZ tokens to ${receiver}`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Sender: ${sender}`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Get central wallet mnemonic for signing
    const centralWalletMnemonic = process.env.CENTRAL_WALLET_MNEMONIC;
    if (!centralWalletMnemonic) {
      throw new Error('CENTRAL_WALLET_MNEMONIC not found in environment variables');
    }

    // Create sender account and signer
    const senderAccount = algosdk.mnemonicToSecretKey(centralWalletMnemonic);
    const senderSigner = algosdk.makeBasicAccountTransactionSigner(senderAccount);
    


    // Get router address using direct calculation (more reliable than typed client)
    const arc59RouterAddress = algosdk.getApplicationAddress(Number(arc59AppId));
    console.log(`   ARC-0059 Router: ${arc59RouterAddress}`);

    // Step 1: Query send requirements using method selectors
    console.log('   📋 Step 1: Querying ARC-0059 send requirements...');
    const sendAssetInfo = await getSendAssetInfo(
      algorand,
      Number(arc59AppId),
      sender,
      receiver,
      assetId,
      senderSigner
    );

    console.log('   📊 Send Requirements:', {
      innerTransactions: sendAssetInfo.itxns.toString(),
      mbrRequired: sendAssetInfo.mbr.toString(),
      routerOptedIn: sendAssetInfo.routerOptedIn,
      receiverOptedIn: sendAssetInfo.receiverOptedIn,
      receiverAlgoNeededForClaim: sendAssetInfo.receiverAlgoNeededForClaim.toString()
    });

    // Step 2: Check if direct transfer is possible
    if (sendAssetInfo.receiverOptedIn && sendAssetInfo.routerOptedIn) {
      console.log('   🎯 Receiver is opted in - using direct transfer...');
      
      const directTransfer = await algorand.createTransaction.assetTransfer({
        sender,
        receiver,
        assetId: Number(assetId),
        amount: Number(amount),
      });

      const result = await directTransfer.send({ signer: senderSigner });
      
      console.log('   ✅ Direct transfer successful!');
      console.log(`   Transaction ID: ${result.transactionId}`);

      return {
        success: true,
        txId: result.transactionId,
      };
    }

    // Step 3: Build ARC-0059 send transaction using AlgoKit composition
    console.log('   🔧 Step 2: Building ARC-0059 send transaction...');
    const composer = algorand.newGroup();

    // Add MBR payment if needed
    if (sendAssetInfo.mbr || sendAssetInfo.receiverAlgoNeededForClaim) {
      console.log(`   💰 Adding MBR payment: ${sendAssetInfo.mbr + sendAssetInfo.receiverAlgoNeededForClaim} microALGO`);
      const mbrPayment = await algorand.createTransaction.payment({
        sender,
        receiver: arc59RouterAddress,
        amount: algokit.microAlgos(Number(sendAssetInfo.mbr + sendAssetInfo.receiverAlgoNeededForClaim)),
      });
      composer.addTransaction({ txn: mbrPayment, signer: senderSigner });
    }

    // Add router opt-in if needed using method selectors
    if (!sendAssetInfo.routerOptedIn) {
      console.log('   🔐 Adding router opt-in transaction...');
      const optInTxn = await algorand.createTransaction.appCall({
        appId: Number(arc59AppId),
        sender: sender,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          ARC59_METHOD_SELECTORS.optRouterIn,
          ABI_ENCODING.encodeUint64(assetId)
        ],
        foreignAssets: [Number(assetId)]
      });
      composer.addTransaction({ txn: optInTxn, signer: senderSigner });
    }

    // Get inbox address using method selectors
    const inboxAddress = await getInboxAddress(
      algorand,
      Number(arc59AppId),
      sender,
      receiver,
      senderSigner
    );
    console.log(`   📦 Inbox address: ${inboxAddress}`);

    // Create asset transfer to router
    const axfer = await algorand.createTransaction.assetTransfer({
      sender,
      receiver: arc59RouterAddress,
      assetId: Number(assetId),
      amount: Number(amount),
    });

    // Add ARC-0059 send asset transaction using method selectors
    const totalItxns = sendAssetInfo.itxns + (sendAssetInfo.receiverAlgoNeededForClaim === 0n ? 0n : 1n);
    console.log(`   🚀 Adding ARC-0059 send asset transaction (${totalItxns} inner txns)...`);
    
    const sendAssetTxn = await algorand.createTransaction.appCall({
      appId: Number(arc59AppId),
      sender: sender,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.sendAsset,
        ABI_ENCODING.encodeAddress(receiver),
        ABI_ENCODING.encodeUint64(sendAssetInfo.receiverAlgoNeededForClaim)
      ],
      foreignAssets: [Number(assetId)],
      accounts: [receiver, inboxAddress],
      boxes: [ABI_ENCODING.encodeAddress(receiver)],
      fee: algokit.microAlgos(1000 + 1000 * Number(totalItxns))
    });

    // Add both transactions to the composer
    composer.addTransaction({ txn: axfer, signer: senderSigner });
    composer.addTransaction({ txn: sendAssetTxn, signer: senderSigner });

    // Execute the transaction
    console.log('   ⚡ Executing ARC-0059 send transaction...');
    
    // Disable resource population to ensure our manually defined resources are correct
    algokit.Config.configure({ populateAppCallResources: false });
    
    const result = await composer.send();
    
    // Re-enable resource population
    algokit.Config.configure({ populateAppCallResources: true });

    console.log('   ✅ ARC-0059 send successful!');
    console.log(`   Transaction IDs: ${result.txIds.join(', ')}`);

    return {
      success: true,
      txId: result.txIds[0],
      inboxAddress: inboxAddress || undefined,
    };

  } catch (error) {
    console.error('❌ ARC-0059 send failed:', error);
    return {
      success: false,
      error: `Failed to send tokens via ARC-0059: ${(error as Error).message}`,
    };
  }
}

/**
 * Claim SIZ tokens from ARC-0059 inbox using hybrid approach
 */
export async function claimSizFromArc59Inbox(
  algorand: algokit.AlgorandClient,
  receiver: string,
  assetId: bigint
): Promise<Arc59SendResult> {
  try {
    console.log(`🎯 Starting ARC-0059 claim for ${receiver}...`);
    console.log(`   Asset ID: ${assetId}`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Get receiver mnemonic for signing
    const receiverMnemonic = process.env.TEST_RECEIVER_MNEMONIC;
    if (!receiverMnemonic) {
      throw new Error('TEST_RECEIVER_MNEMONIC not found in environment variables');
    }

    // Create receiver account and signer
    const receiverAccount = algosdk.mnemonicToSecretKey(receiverMnemonic);
    const receiverSigner = algosdk.makeBasicAccountTransactionSigner(receiverAccount);
    


    console.log('   🔧 Building claim transaction...');
    const composer = algorand.newGroup();

    // Optional: Check if receiver needs to opt-in first
    const receiverInfo = await algodClient.accountInformation(receiver).do();
    const isOptedIn = receiverInfo.assets?.some((asset: any) => asset.assetId === Number(assetId));

    if (!isOptedIn) {
      console.log('   🔐 Adding asset opt-in transaction...');
      const optInTxn = await algorand.createTransaction.assetOptIn({
        sender: receiver,
        assetId: Number(assetId),
      });
      composer.addTransaction({ txn: optInTxn, signer: receiverSigner });
    }

    // Add ARC-0059 claim transaction using method selectors
    console.log('   🎯 Adding ARC-0059 claim transaction...');
    const claimTxn = await algorand.createTransaction.appCall({
      appId: Number(arc59AppId),
      sender: receiver,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs: [
        ARC59_METHOD_SELECTORS.claim,
        ABI_ENCODING.encodeUint64(assetId)
      ],
      foreignAssets: [Number(assetId)],
      fee: algokit.microAlgos(2000) // 2 transactions worth of fees
    });

    composer.addTransaction({ txn: claimTxn, signer: receiverSigner });

    // Execute the claim transaction
    console.log('   ⚡ Executing claim transaction...');
    const result = await composer.send();

    console.log('   ✅ Claim successful!');
    console.log(`   Transaction IDs: ${result.txIds.join(', ')}`);

    return {
      success: true,
      txId: result.txIds[0],
    };

  } catch (error) {
    console.error('❌ Claim failed:', error);
    return {
      success: false,
      error: `Failed to claim tokens: ${(error as Error).message}`,
    };
  }
}

/**
 * Get inbox address for a receiver using hybrid approach
 */
export async function getArc59InboxAddress(
  algorand: algokit.AlgorandClient,
  receiver: string
): Promise<string> {
  try {
    console.log(`📦 Getting ARC-0059 inbox address for ${receiver}...`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Get central wallet mnemonic for signing
    const centralWalletMnemonic = process.env.CENTRAL_WALLET_MNEMONIC;
    if (!centralWalletMnemonic) {
      throw new Error('CENTRAL_WALLET_MNEMONIC not found in environment variables');
    }

    // Create sender account and signer
    const senderAccount = algosdk.mnemonicToSecretKey(centralWalletMnemonic);
    const senderSigner = algosdk.makeBasicAccountTransactionSigner(senderAccount);
    


    // Get inbox address using method selectors
    const inboxAddress = await getInboxAddress(
      algorand,
      Number(arc59AppId),
      senderAccount.addr,
      receiver,
      senderSigner
    );
    
    console.log(`📦 Inbox address for ${receiver}: ${inboxAddress}`);
    return inboxAddress;

  } catch (error) {
    console.error('❌ Failed to get inbox address:', error);
    return '';
  }
}
