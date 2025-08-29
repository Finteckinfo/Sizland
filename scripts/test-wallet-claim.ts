#!/usr/bin/env tsx

/**
 * Test script for wallet-based ARC-0059 claim functionality
 * This tests the new claimSizFromInboxWithWallet function that uses connected wallet signers
 */

import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import dotenv from 'dotenv';
import { claimSizFromInboxWithWallet } from '../src/lib/algorand/arc59-send';

// Load environment variables
dotenv.config();

async function testWalletBasedClaim() {
  console.log('🧪 Testing Wallet-Based ARC-0059 Claim Functionality\n');

  try {
    // Test configuration
    const testReceiverAddress = process.env.TEST_RECEIVER_ADDRESS;
    const testReceiverMnemonic = process.env.TEST_RECEIVER_MNEMONIC;
    const assetId = process.env.SIZ_TOKEN_ASSET_ID;

    if (!testReceiverAddress || !testReceiverMnemonic || !assetId) {
      throw new Error('Missing required environment variables: TEST_RECEIVER_ADDRESS, TEST_RECEIVER_MNEMONIC, or SIZ_TOKEN_ASSET_ID');
    }

    console.log('📋 Test Configuration:');
    console.log(`   Test Wallet: ${testReceiverAddress}`);
    console.log(`   Asset ID: ${assetId}`);
    console.log(`   Payment Reference: test-wallet-claim-${Date.now()}`);

    // Initialize AlgoKit client
    const algorand = algokit.AlgorandClient.mainNet();

    // Create a test wallet signer from the mnemonic (simulating connected wallet)
    const testAccount = algosdk.mnemonicToSecretKey(testReceiverMnemonic);
    const testWalletSigner = algosdk.makeBasicAccountTransactionSigner(testAccount);

    console.log('\n🔑 Test Wallet Signer Created:');
    console.log(`   Address: ${testAccount.addr}`);
    console.log(`   Signer Type: ${testWalletSigner.constructor.name}`);

    // Test the wallet-based claim function
    console.log('\n🎯 Testing wallet-based claim functionality...');
    
    const claimResult = await claimSizFromInboxWithWallet({
      algorand,
      receiver: testReceiverAddress,
      assetId: BigInt(assetId),
      walletSigner: testWalletSigner
    });

    if (claimResult.success) {
      console.log('\n✅ Wallet-based claim successful!');
      console.log(`   Transaction ID: ${claimResult.txId}`);
      console.log('\n🎉 Test completed successfully!');
      console.log('   The wallet-based claim functionality is working correctly.');
    } else {
      console.log('\n❌ Wallet-based claim failed:');
      console.log(`   Error: ${claimResult.error}`);
      console.log('\n⚠️ Test failed - check the error details above.');
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testWalletBasedClaim()
    .then(() => {
      console.log('\n🏁 Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
}
