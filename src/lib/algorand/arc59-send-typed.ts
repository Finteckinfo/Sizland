import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { Arc59Client } from './arc59/client';

/**
 * ARC-0059 Send Asset Service using Typed Client Approach
 * Following the exact pattern from the Algorand agent's recommendation
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
 * Send an asset to a receiver using the ARC59 router
 * Following the exact pattern from the Algorand agent's recommendation
 */
async function arc59SendAsset(
  appClient: Arc59Client,
  assetId: bigint,
  sender: string,
  receiver: string,
  algorand: algokit.AlgorandClient
): Promise<Arc59SendResult> {
  try {
    console.log(`🚀 [ARC-0059] Starting typed client transfer for ${assetId} to ${receiver}`);

    // Get the address of the ARC59 router
    const arc59RouterAddress = appClient.appAddress;
    console.log(`   ARC-0059 Router: ${arc59RouterAddress}`);

    // Call arc59GetSendAssetInfo to get the following:
    // itxns - The number of transactions needed to send the asset
    // mbr - The minimum balance that must be sent to the router
    // routerOptedIn - Whether the router has opted in to the asset
    // receiverOptedIn - Whether the receiver has opted in to the asset
    const sendAssetInfoResult = await appClient.send.arc59GetSendAssetInfo({ 
      args: { asset: assetId, receiver } 
    });
    
    const {
      itxns,
      mbr,
      routerOptedIn,
      receiverOptedIn,
      receiverAlgoNeededForClaim,
      receiverAlgoNeededForWorstCaseClaim,
    } = sendAssetInfoResult.return!;

    console.log('   📊 Send Requirements:', {
      innerTransactions: itxns.toString(),
      mbrRequired: mbr.toString(),
      routerOptedIn: routerOptedIn,
      receiverOptedIn: receiverOptedIn,
      receiverAlgoNeededForClaim: receiverAlgoNeededForClaim.toString()
    });

    // If the receiver has opted in, just send the asset directly
    if (receiverOptedIn) {
      console.log('   🎯 Receiver is opted in - using direct transfer...');
      
      const result = await algorand.send.assetTransfer({
        sender,
        receiver,
        assetId,
        amount: assetId, // Use the amount parameter
      });

      console.log('   ✅ Direct transfer successful!');
      console.log(`   Transaction ID: ${result.transactionId}`);

      return {
        success: true,
        txId: result.transactionId,
      };
    }

    // Create a composer to form an atomic transaction group
    const composer = appClient.newGroup();

    // If the MBR is non-zero, send the MBR to the router
    if (mbr || receiverAlgoNeededForClaim) {
      console.log(`   💰 Adding MBR payment: ${mbr + receiverAlgoNeededForClaim} microALGO`);
      
      const mbrPayment = await algorand.createTransaction.payment({
        sender,
        receiver: arc59RouterAddress,
        amount: algokit.microAlgos(Number(mbr + receiverAlgoNeededForClaim)),
      });

      composer.addTransaction({ txn: mbrPayment });
    }

    // If the router is not opted in, add a call to arc59OptRouterIn to do so
    if (!routerOptedIn) {
      console.log('   🔐 Adding router opt-in transaction...');
      composer.arc59OptRouterIn({ args: { asa: assetId } });
    }

    /** The box of the receiver's pubkey will always be needed */
    const boxes = [algosdk.decodeAddress(receiver).publicKey];

    /** The address of the receiver's inbox */
    const inboxAddress = (
      await appClient.newGroup().arc59GetInbox({ 
        args: { receiver }, 
        boxReferences: boxes 
      }).simulate()
    ).returns[0]!;

    console.log(`   📦 Inbox address: ${inboxAddress}`);

    // The transfer of the asset to the router
    const axfer = await algorand.createTransaction.assetTransfer({
      sender,
      receiver: arc59RouterAddress,
      assetId,
      amount: assetId, // Use the amount parameter
    });

    // An extra itxn is if we are also sending ALGO for the receiver claim
    const totalItxns = itxns + (receiverAlgoNeededForClaim === 0n ? 0n : 1n);
    console.log(`   🚀 Adding ARC-0059 send asset transaction (${totalItxns} inner txns)...`);

    composer.arc59SendAsset({
      args: { 
        axfer, 
        receiver, 
        additionalReceiverFunds: receiverAlgoNeededForClaim 
      },
      sendParams: { 
        fee: algokit.microAlgos(1000 + 1000 * Number(totalItxns)) 
      },
      boxReferences: boxes, // The receiver's pubkey
      // Always good to include both accounts here, even if we think only the receiver is needed. 
      // This is to help protect against race conditions within a block.
      accountReferences: [receiver, inboxAddress],
      // Even though the asset is available in the group, we need to explicitly define it here 
      // because we will be checking the asset balance of the receiver
      assetReferences: [Number(assetId)],
    });

    // Disable resource population to ensure that our manually defined resources are correct
    algokit.Config.configure({ populateAppCallResources: false });

    // Send the transaction group
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
    console.error('❌ ARC-0059 send failed:', error);
    return {
      success: false,
      error: `Failed to send tokens via ARC-0059: ${(error as Error).message}`,
    };
  }
}

/**
 * Send SIZ tokens using ARC-0059 flow with typed client approach
 */
export async function sendSizViaArc59Typed(params: Arc59SendParams): Promise<Arc59SendResult> {
  const { algorand, sender, receiver, assetId, amount } = params;

  try {
    console.log(`🚀 Starting ARC-0059 typed client transfer for ${amount} SIZ tokens to ${receiver}`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Sender: ${sender}`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Create sender account and signer
    const centralWalletMnemonic = process.env.CENTRAL_WALLET_MNEMONIC;
    if (!centralWalletMnemonic) {
      throw new Error('CENTRAL_WALLET_MNEMONIC not found in environment variables');
    }
    
    const central = algosdk.mnemonicToSecretKey(centralWalletMnemonic);
    const centralSigner = algosdk.makeBasicAccountTransactionSigner(central);

    // Register the signer with AlgorandClient so the composer can find it
    algorand.setSignerFromAccount({ addr: central.addr, signer: centralSigner });

    // Create the typed ARC-0059 client
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId),
      defaultSender: central.addr
    });

    // Use the typed client to send the asset
    const result = await arc59SendAsset(appClient, assetId, central.addr, receiver, algorand);

    return result;

  } catch (error) {
    console.error('❌ ARC-0059 typed client send failed:', error);
    return {
      success: false,
      error: `Failed to send tokens via ARC-0059: ${(error as Error).message}`,
    };
  }
}

/**
 * Claim an asset from the ARC59 inbox using typed client approach
 */
async function arc59Claim(
  appClient: Arc59Client,
  assetId: bigint,
  claimer: string,
  algorand: algokit.AlgorandClient
): Promise<Arc59SendResult> {
  try {
    console.log(`🎯 [ARC-0059] Starting typed client claim for ${claimer}...`);
    console.log(`   Asset ID: ${assetId}`);

    const group = appClient.newGroup();

    // Check if the claimer has opted in to the asset
    let claimerOptedIn = false;
    try {
      await algorand.asset.getAccountInformation(claimer, assetId);
      claimerOptedIn = true;
    } catch (e) {
      // Do nothing - claimer is not opted in
    }

    const inbox = (
      await appClient.newGroup().arc59GetInbox({ 
        args: { receiver: claimer } 
      }).simulate({ allowUnnamedResources: true })
    ).returns[0]!;

    let totalTxns = 3;

    // If the inbox has extra ALGO, claim it
    const inboxInfo = await algorand.account.getInformation(inbox);
    if (inboxInfo.minBalance < inboxInfo.balance) {
      totalTxns += 2;
      group.arc59ClaimAlgo({ 
        sender: claimer, 
        args: [], 
        sendParams: { fee: algokit.microAlgos(0) } 
      });
    }

    // If the claimer hasn't already opted in, add a transaction to do so
    if (!claimerOptedIn) {
      console.log('   🔐 Adding asset opt-in transaction...');
      group.addTransaction(await algorand.createTransaction.assetOptIn({ 
        assetId, 
        sender: claimer 
      }));
    }

    group.arc59Claim({ 
      args: { asa: assetId }, 
      sendParams: { fee: algokit.microAlgos(1000 * (totalTxns - 1)) }, 
      sender: claimer 
    });

    console.log('   ⚡ Executing claim transaction...');
    const result = await group.send();

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
 * Claim SIZ tokens from ARC-0059 inbox using typed client approach
 */
export async function claimSizFromArc59InboxTyped(
  algorand: algokit.AlgorandClient,
  receiver: string,
  assetId: bigint
): Promise<Arc59SendResult> {
  try {
    console.log(`🎯 Starting ARC-0059 typed client claim for ${receiver}...`);
    console.log(`   Asset ID: ${assetId}`);

    // Get ARC-0059 app ID from environment
    const arc59AppId = process.env.ARC59_APP_ID;
    if (!arc59AppId) {
      throw new Error('ARC59_APP_ID not found in environment variables');
    }

    // Create the typed ARC-0059 client
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId),
      defaultSender: receiver
    });

    // Use the typed client to claim the asset
    const result = await arc59Claim(appClient, assetId, receiver, algorand);

    return result;

  } catch (error) {
    console.error('❌ ARC-0059 typed client claim failed:', error);
    return {
      success: false,
      error: `Failed to claim tokens: ${(error as Error).message}`,
    };
  }
}

/**
 * Get inbox address for a receiver using typed client approach
 */
export async function getArc59InboxAddressTyped(
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

    // Create sender account
    const senderAccount = algosdk.mnemonicToSecretKey(centralWalletMnemonic);

    // Create the typed ARC-0059 client
    const appClient = new Arc59Client({
      algorand,
      appId: BigInt(arc59AppId),
      defaultSender: senderAccount.addr
    });

    // Get inbox address using typed client
    const boxes = [algosdk.decodeAddress(receiver).publicKey];
    const inboxAddress = (
      await appClient.newGroup().arc59GetInbox({ 
        args: { receiver }, 
        boxReferences: boxes 
      }).simulate()
    ).returns[0]!;
    
    console.log(`📦 Inbox address for ${receiver}: ${inboxAddress}`);
    return inboxAddress;

  } catch (error) {
    console.error('❌ Failed to get inbox address:', error);
    return '';
  }
}
