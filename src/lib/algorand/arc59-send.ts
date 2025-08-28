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
    algorand.account.setSignerFromAccount({ addr: sender as unknown as algosdk.Address, signer: senderSigner });
    
    // Register the freeze manager signer for asset unfreeze operations
    const freezeManagerMnemonic = process.env.UNFREEZE_ACCOUNT_MNEMONIC;
    if (freezeManagerMnemonic) {
      const freezeManagerAccount = algosdk.mnemonicToSecretKey(freezeManagerMnemonic);
      const freezeManagerSigner = algosdk.makeBasicAccountTransactionSigner(freezeManagerAccount);
      algorand.account.setSignerFromAccount({ 
        addr: process.env.UNFREEZE_ACCOUNT_ADDRESS! as unknown as algosdk.Address, 
        signer: freezeManagerSigner 
      });
      console.log(`   🔑 Registered freeze manager signer: ${process.env.UNFREEZE_ACCOUNT_ADDRESS}`);
      
      // Debug: Check freeze manager's current asset status
      try {
        const freezeManagerInfo = await algorand.account.getInformation(process.env.UNFREEZE_ACCOUNT_ADDRESS!);
        const hasSizAsset = freezeManagerInfo.assets?.some((asset: any) => BigInt(asset.assetId) === assetId);
        console.log(`   🔍 Freeze manager asset status check:`);
        console.log(`      Address: ${process.env.UNFREEZE_ACCOUNT_ADDRESS}`);
        console.log(`      Has SIZ asset (${assetId}): ${hasSizAsset}`);
        if (freezeManagerInfo.assets) {
          console.log(`      Total assets: ${freezeManagerInfo.assets.length}`);
          freezeManagerInfo.assets.forEach((asset: any) => {
            console.log(`      Asset ${asset.assetId}: ${asset.amount} (frozen: ${asset.isFrozen})`);
          });
          
          // Additional debug: Check if SIZ asset exists with exact comparison
          const sizAsset = freezeManagerInfo.assets?.find((asset: any) => BigInt(asset.assetId) === assetId);
          if (sizAsset) {
            console.log(`   ✅ Found SIZ asset in freeze manager:`);
            console.log(`      Asset ID: ${sizAsset.assetId}`);
            console.log(`      Balance: ${sizAsset.amount}`);
            console.log(`      Frozen: ${sizAsset.isFrozen}`);
          } else {
            console.log(`   ❌ SIZ asset NOT found in freeze manager assets array`);
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Could not check freeze manager asset status: ${error}`);
      }
    }

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
        txId: directTransfer.txIds[0],
      };
    }

    // Check recipient's current asset status (even if not opted in)
    console.log('   🔍 Checking recipient asset status...');
    try {
      const receiverInfo = await algorand.account.getInformation(receiver);
      const hasSizAsset = receiverInfo.assets?.some((asset: any) => BigInt(asset.assetId) === assetId);
      if (hasSizAsset) {
        const sizAsset = receiverInfo.assets?.find((asset: any) => BigInt(asset.assetId) === assetId);
        console.log(`   ⚠️ Recipient already has SIZ asset:`);
        console.log(`      Asset ID: ${sizAsset?.assetId}`);
        console.log(`      Balance: ${sizAsset?.amount}`);
        console.log(`      Frozen: ${sizAsset?.isFrozen}`);
        
        if (sizAsset?.isFrozen) {
          console.log(`   🚨 Recipient's SIZ asset is FROZEN - this will cause ARC-0059 to fail`);
          console.log(`   💡 Since recipient already has SIZ asset, using direct transfer instead of ARC-0059`);
          
          // Use direct transfer since recipient is already opted in
          const directTransfer = await algorand.send.assetTransfer({ 
            sender, 
            receiver, 
            assetId, 
            amount: amount 
          });
          
          console.log(`   ✅ Direct transfer successful! Transaction ID: ${directTransfer.txIds[0]}`);
          return {
            success: true,
            txId: directTransfer.txIds[0],
            inboxAddress: receiver, // Direct transfer, no inbox needed
          };
        } else {
          console.log(`   ✅ Recipient's SIZ asset is not frozen - using direct transfer instead of ARC-0059`);
          const directTransfer = await algorand.send.assetTransfer({ 
            sender, 
            receiver, 
            assetId, 
            amount: amount 
          });
          
          console.log(`   ✅ Direct transfer successful! Transaction ID: ${directTransfer.txIds[0]}`);
          return {
            success: true,
            txId: directTransfer.txIds[0],
            inboxAddress: receiver, // Direct transfer, no inbox needed
          };
        }
      } else {
        console.log(`   ✅ Recipient does not have SIZ asset - proceeding with ARC-0059`);
      }
    } catch (error) {
      console.log(`   ⚠️ Could not check recipient asset status: ${error}`);
      console.log(`   💡 Proceeding with ARC-0059 flow as fallback`);
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

    // Add asset opt-in for freeze manager if needed (freeze manager must hold the asset to perform freeze/unfreeze)
    console.log('   🔐 Adding asset opt-in for freeze manager...');
    
    // Check if freeze manager is already opted in
    let freezeManagerOptedIn = false;
    try {
      const freezeManagerInfo = await algorand.account.getInformation(process.env.UNFREEZE_ACCOUNT_ADDRESS!);
      freezeManagerOptedIn = freezeManagerInfo.assets?.some((asset: any) => BigInt(asset.assetId) === assetId) || false;
      console.log(`   🔍 Freeze manager opt-in status: ${freezeManagerOptedIn ? 'Already opted in' : 'Not opted in'}`);
    } catch (error) {
      console.log(`   ⚠️ Could not check freeze manager opt-in status: ${error}`);
    }
    
    if (!freezeManagerOptedIn) {
      console.log('   🔐 Creating asset opt-in transaction for freeze manager...');
      const freezeManagerOptInTxn = await algorand.createTransaction.assetOptIn({
        sender: process.env.UNFREEZE_ACCOUNT_ADDRESS!,
        assetId: assetId,
      });
      composer.addTransaction(freezeManagerOptInTxn);
      console.log('   ✅ Added freeze manager opt-in transaction to group');
    } else {
      console.log('   ✅ Freeze manager already opted in to SIZ asset');
    }

    // Add asset unfreeze for the recipient (to prevent "asset frozen in recipient" error)
    // NOTE: This transaction is not needed for ARC-0059 flows where the recipient isn't opted in
    // The recipient will receive tokens in their inbox and can claim them later by opting in
    console.log('   🔓 Skipping asset unfreeze - recipient not opted in to SIZ asset');
    // const unfreezeTxn = await algorand.createTransaction.assetFreeze({
    //   sender: process.env.UNFREEZE_ACCOUNT_ADDRESS!, // Use freeze manager address
    //   assetId: assetId,
    //   account: receiver,
    //   frozen: false, // Unfreeze the recipient
    // });
    // composer.addTransaction(unfreezeTxn);

    // Get inbox address using direct method call (not simulation)
    const boxes = [algosdk.decodeAddress(receiver).publicKey];
    console.log(`   📦 Using receiver's public key for box reference: ${Buffer.from(boxes[0]).toString('hex')}`);
    
    // Try to get inbox address using direct call
    let inboxAddress = receiver; // Default to receiver if no inbox exists
    try {
      const inboxSim = await appClient
        .newGroup()
        .arc59GetInbox({ args: { receiver }, boxReferences: boxes })
        .simulate({ allowUnnamedResources: true });
      if (inboxSim.returns[0] && inboxSim.returns[0] !== 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ') {
        inboxAddress = inboxSim.returns[0]!;
        console.log(`   📦 Inbox address: ${inboxAddress}`);
      } else {
        console.log('   📦 Inbox not returned in simulate, will be created during send');
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
    args: { axfer, receiver, additionalReceiverFunds: receiverAlgoNeededForClaim },
    boxReferences: boxes,
    accountReferences: inboxAddress ? [receiver, inboxAddress] : [receiver],
    assetReferences: [assetId],
    staticFee: algokit.microAlgos(1000 + 1000 * Number(totalItxns)),
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
        assetId,
      });
      composer.addTransaction(optInTxn);
    }

    // Add ARC-0059 claim transaction
    console.log('   🎯 Adding ARC-0059 claim transaction...');
    composer.arc59Claim({
      args: { asa: assetId },
      staticFee: algokit.microAlgos(2000)
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
    const inboxAddress = inboxResult.returns[0] ?? null;
    
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