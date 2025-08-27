import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { Arc59Client } from './arc59/client';

/**
 * ARC-0059 Send Asset Service using AlgoKit Typed Client
 * Handles sending SIZ tokens via ARC-0059 inbox system
 */

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

/**
 * Send SIZ tokens using ARC-0059 flow
 * This uses the proper ARC-0059 protocol to send tokens to recipients who aren't opted in
 * The flow includes: router opt-in check, inbox creation, MBR funding, and asset delivery
 */
export async function sendSizViaArc59(params: Arc59SendParams): Promise<Arc59SendResult> {
  const { algorand, sender, receiver, assetId, amount } = params;

  try {
    console.log(`🚀 Starting ARC-0059 transfer for ${amount} SIZ tokens to ${receiver}`);
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

    // Register the signer with AlgorandClient BEFORE creating the typed client
    algorand.account.setSignerFromAccount({ addr: sender, signer: senderSigner });

    // Get ARC-0059 typed client for mainnet app ID 2449590623
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId),
      defaultSender: sender
    });
    
    const arc59RouterAddress = appClient.appAddress;

    console.log(`   ARC-0059 Router: ${arc59RouterAddress}`);

    // Step 1: Query send requirements
    console.log('   📋 Step 1: Querying ARC-0059 send requirements...');
    const sendAssetInfoResult = await appClient.send.arc59GetSendAssetInfo({
      args: {
        receiver,
        asset: assetId
      }
    });
    const {
      itxns,
      mbr,
      routerOptedIn,
      receiverOptedIn,
      receiverAlgoNeededForClaim,
    } = sendAssetInfoResult.return!;

    console.log('   📊 Send Requirements:', {
      innerTransactions: itxns.toString(),
      mbrRequired: mbr.toString(),
      routerOptedIn,
      receiverOptedIn,
      receiverAlgoNeeded: receiverAlgoNeededForClaim.toString()
    });

    // Step 2: Handle direct transfer if receiver is already opted in
    if (receiverOptedIn) {
      console.log('   ✅ Receiver already opted in - using direct transfer...');
      const directTransfer = await algorand.send.assetTransfer({ 
        sender, 
        receiver, 
        assetId, 
        amount: amount 
      });
      
      console.log('   ✅ Direct transfer successful!');
      return {
        success: true,
        txId: directTransfer.transactionId,
      };
    }

    // Step 3: Build ARC-0059 send transaction
    console.log('   🔧 Step 2: Building ARC-0059 send transaction...');
    const composer = appClient.newGroup();

    // Add MBR payment if needed
    if (mbr || receiverAlgoNeededForClaim) {
      console.log(`   💰 Adding MBR payment: ${mbr + receiverAlgoNeededForClaim} microALGO`);
      const mbrPayment = await algorand.createTransaction.payment({
        sender,
        receiver: arc59RouterAddress,
        amount: algokit.microAlgos(Number(mbr + receiverAlgoNeededForClaim)),
      });
      composer.addTransaction(mbrPayment);
    }

    // Add router opt-in if needed
    if (!routerOptedIn) {
      console.log('   🔐 Adding router opt-in transaction...');
      composer.arc59OptRouterIn({ args: { asa: assetId } });
    }

    // Get inbox address using direct method call (not simulation)
    const boxes = [algosdk.decodeAddress(receiver).publicKey];
    console.log(`   📦 Using receiver's public key for box reference: ${Buffer.from(boxes[0]).toString('hex')}`);
    
    // Try to get inbox address using direct call
    let inboxAddress = receiver; // Default to receiver if no inbox exists
    try {
      const inboxResult = await appClient.arc59GetInbox({
        args: { receiver }
      });
      if (inboxResult.return && inboxResult.return !== 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ') {
        inboxAddress = inboxResult.return;
        console.log(`   📦 Found existing inbox: ${inboxAddress}`);
      } else {
        console.log(`   📦 No existing inbox found, will be created during send`);
      }
    } catch (error) {
      console.log(`   📦 Could not get inbox address, will be created during send: ${error}`);
    }

    // Create asset transfer to router
    const axfer = await algorand.createTransaction.assetTransfer({
      sender,
      receiver: arc59RouterAddress,
      assetId,
      amount: amount,
    });

    // Add ARC-0059 send asset transaction
    const totalItxns = itxns + (receiverAlgoNeededForClaim === 0n ? 0n : 1n);
    console.log(`   🚀 Adding ARC-0059 send asset transaction (${totalItxns} inner txns)...`);
    
  // Disable resource population to ensure that our manually defined resources are correct
  algokit.Config.configure({ populateAppCallResources: false });

  composer.arc59SendAsset({
    args: {
      axfer,
      receiver,
      additionalReceiverFunds: receiverAlgoNeededForClaim
    },
    sendParams: { fee: algokit.microAlgos(1000 + 1000 * Number(totalItxns)) }, // Official pattern: base fee + inner txns
    boxReferences: boxes,
    accounts: [receiver], // Include receiver account reference
    assets: [Number(assetId)], // Include asset reference
  });

  // Execute the transaction
  console.log('   ⚡ Executing ARC-0059 send transaction...');
  
  const result = await composer.send();

  // Re-enable resource population
  algokit.Config.configure({ populateAppCallResources: true });

    console.log('   ✅ ARC-0059 send successful!');
    console.log(`   Transaction IDs: ${result.txIds.join(', ')}`);

    return {
      success: true,
      txId: result.txIds[0],
      inboxAddress: inboxAddress,
    };

  } catch (error) {
    console.error('   ❌ ARC-0059 send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transfer error'
    };
  }
}

/**
 * Autonomously claim SIZ tokens from ARC-0059 inbox for the receiver
 * This function uses the receiver's mnemonic to claim tokens without user interaction
 */
export async function claimSizFromInbox(params: {
  algorand: algokit.AlgorandClient;
  receiver: string;
  assetId: bigint;
}): Promise<{ success: boolean; txId?: string; error?: string }> {
  const { algorand, receiver, assetId } = params;

  try {
    console.log(`🎯 Starting autonomous claim for ${assetId} SIZ tokens from inbox`);
    console.log(`   Receiver: ${receiver}`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Get receiver mnemonic for autonomous claiming
    const receiverMnemonic = process.env.TEST_RECEIVER_MNEMONIC;
    if (!receiverMnemonic) {
      throw new Error('TEST_RECEIVER_MNEMONIC not found in environment variables');
    }

    // Create receiver account and signer
    const receiverAccount = algosdk.mnemonicToSecretKey(receiverMnemonic);
    const receiverSigner = algosdk.makeBasicAccountTransactionSigner(receiverAccount);

    // Get ARC-0059 typed client for mainnet app ID 2449590623
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId),
      defaultSender: receiver
    });

    console.log('   🔧 Building claim transaction...');
    const composer = appClient.newGroup();

    // Optional: Check if receiver needs to opt-in first
    const receiverInfo = await algorand.account.getInformation(receiver);
    const isOptedIn = receiverInfo.assets?.some((asset: any) => asset.assetId === Number(assetId));

    if (!isOptedIn) {
      console.log('   🔐 Adding asset opt-in transaction...');
      const optInTxn = await algorand.createTransaction.assetOptIn({
        sender: receiver,
        assetId: Number(assetId),
      });
      composer.addTransaction({ txn: optInTxn, signer: receiverSigner });
    }

    // Add ARC-0059 claim transaction
    console.log('   🎯 Adding ARC-0059 claim transaction...');
    composer.arc59Claim({
      args: { asa: assetId },
      sendParams: { fee: algokit.microAlgos(2000) } // 2 transactions worth of fees
    });

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
    console.error('   ❌ Claim failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown claim error'
    };
  }
}

/**
 * Get inbox address for a receiver using ARC-0059
 */
export async function getInboxAddress(params: {
  algorand: algokit.AlgorandClient;
  receiver: string;
}): Promise<string | null> {
  const { algorand, receiver } = params;

  try {
    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Get ARC-0059 typed client for mainnet app ID 2449590623
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId)
    });

    // Get inbox address using ARC-0059
    const inboxResult = await appClient.newGroup().arc59GetInbox({
      args: { receiver }
    }).simulate();
    const inboxAddress = inboxResult.returns[0];
    
    console.log(`📦 Inbox address for ${receiver}: ${inboxAddress}`);
    return inboxAddress;

  } catch (error) {
    console.error('Error getting inbox address:', error);
    return null;
  }
}

/**
 * Check if receiver has tokens in their inbox
 * Placeholder implementation
 */
export async function checkInboxBalance(params: {
  algorand: algokit.AlgorandClient;
  receiver: string;
  assetId: bigint;
}): Promise<number> {
  const { algorand, receiver, assetId } = params;

  try {
    // Placeholder implementation
    console.log('📝 checkInboxBalance: ARC-0059 implementation pending');
    return 0;
  } catch (error) {
    console.error('Error checking inbox balance:', error);
    return 0;
  }
}