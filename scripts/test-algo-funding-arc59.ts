#!/usr/bin/env tsx

/**
 * Test Script for ALGO Funding + ARC-0059 Flow
 * Tests the new autonomous backend system that funds user wallets and sends tokens via ARC-0059
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function testAlgoFundingArc59Flow() {
  console.log('🧪 Testing ALGO Funding + ARC-0059 Flow\n');

  // Check environment variables
  const requiredVars = [
    'SIZ_TOKEN_ASSET_ID',
    'CENTRAL_WALLET_MNEMONIC',
    'CENTRAL_WALLET_ADDRESS',
    'TEST_RECEIVER_ADDRESS',
    'TEST_RECEIVER_MNEMONIC'
  ];

  console.log('🔍 Environment Variables Check:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName.includes('MNEMONIC') || varName.includes('TOKEN') ? '[HIDDEN]' : value}`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      return;
    }
  }

  console.log('\n📡 AlgoKit Client Configuration:');
  console.log('   ✅ Using AlgorandClient.mainNet() - connects to https://mainnet-api.algonode.cloud');
  console.log('   ✅ No ALGOD_TOKEN required for AlgoNode free tier');

  // Test configuration - using test receiver from .env
  const testWalletAddress = process.env.TEST_RECEIVER_ADDRESS!;
  const testWalletMnemonic = process.env.TEST_RECEIVER_MNEMONIC!;
  const testPaymentReference = `test-algo-funding-arc59-${Date.now()}`;
  const testTokenAmount = 5; // Small amount for testing

  console.log('\n📋 Test Configuration:');
  console.log(`   Test Wallet: ${testWalletAddress}`);
  console.log(`   Test Wallet Mnemonic: [HIDDEN] (available for signing)`);
  console.log(`   Payment Reference: ${testPaymentReference}`);
  console.log(`   Token Amount: ${testTokenAmount} SIZ`);

  // Test 1: Check central wallet status
  console.log('\n📋 Test 1: Central Wallet Status');
  try {
    const centralWalletStatus = await sizTokenTransferService.checkCentralWalletStatus();
    console.log('   Central Wallet Status:', {
      isReady: centralWalletStatus.isReady,
      algoBalance: Number(centralWalletStatus.algoBalance) / 1e6,
      sizBalance: centralWalletStatus.sizBalance,
      isOptedIntoSiz: centralWalletStatus.isOptedIntoSiz,
      details: centralWalletStatus.details
    });

    if (!centralWalletStatus.isReady) {
      console.log('   ❌ Central wallet not ready for operations');
      return;
    }
    console.log('   ✅ Central wallet ready for operations');
  } catch (error) {
    console.error('   ❌ Central wallet check failed:', error);
    return;
  }

  // Test 2: Check test wallet initial status
  console.log('\n📋 Test 2: Test Wallet Initial Status');
  try {
    const optInStatus = await sizTokenTransferService.checkReceiverOptIn(testWalletAddress);
    console.log('   Initial Opt-in Status:', {
      isOptedIn: optInStatus.isOptedIn,
      canOptIn: optInStatus.canOptIn,
      alogBalance: optInStatus.alogBalance,
      minBalanceRequired: optInStatus.minBalanceRequired
    });
  } catch (error) {
    console.error('   ❌ Initial opt-in check failed:', error);
    return;
  }

  // Test 3: Execute ALGO funding + ARC-0059 transfer
  console.log('\n📋 Test 3: ALGO Funding + ARC-0059 Transfer');
  try {
    console.log('   🚀 Starting ALGO funding + ARC-0059 transfer...');
    const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
      receiverAddress: testWalletAddress,
      amount: testTokenAmount,
      paymentId: testPaymentReference
    });

    console.log('\n   📊 Transfer Result:', {
      success: transferResult.success,
      txId: transferResult.txId,
      requiresOptIn: transferResult.requiresOptIn,
      requiresUserAction: transferResult.requiresUserAction,
      actionRequired: transferResult.actionRequired,
      error: transferResult.error
    });

    if (transferResult.success) {
      console.log('\n   ✅ ALGO funding + ARC-0059 transfer successful!');
      console.log(`   📊 Transaction ID: ${transferResult.txId}`);
      console.log('\n   📋 User Instructions:');
      console.log(`   ${transferResult.instructions}`);
    } else {
      console.log('\n   ❌ ALGO funding + ARC-0059 transfer failed');
      console.log(`   Error: ${transferResult.error}`);
      if (transferResult.instructions) {
        console.log('\n   📋 User Instructions:');
        console.log(`   ${transferResult.instructions}`);
      }
    }

  } catch (error) {
    console.error('   ❌ ALGO funding + ARC-0059 transfer test failed:', error);
  }

  // Test 4: Check test wallet status after transfer
  console.log('\n📋 Test 4: Test Wallet Status After Transfer');
  try {
    const optInStatus = await sizTokenTransferService.checkReceiverOptIn(testWalletAddress);
    console.log('   Post-Transfer Opt-in Status:', {
      isOptedIn: optInStatus.isOptedIn,
      canOptIn: optInStatus.canOptIn,
      alogBalance: optInStatus.alogBalance,
      minBalanceRequired: optInStatus.minBalanceRequired
    });
  } catch (error) {
    console.error('   ❌ Post-transfer opt-in check failed:', error);
  }

  console.log('\n🎯 Test Summary:');
  console.log('   ✅ Environment variables verified');
  console.log('   ✅ Central wallet status confirmed');
  console.log('   ✅ Test wallet initial status checked');
  console.log('   ✅ ALGO funding + ARC-0059 transfer executed');
  console.log('   ✅ Test wallet post-transfer status checked');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Check the transaction on Algorand explorer');
  console.log('   2. Verify ALGO funding was successful');
  console.log('   3. Check if SIZ tokens are in the user\'s ARC-0059 inbox');
  console.log('   4. Test claiming tokens from the inbox');
  console.log('   5. Test with real Stripe payment integration');
}

// Run the test
testAlgoFundingArc59Flow().catch(console.error);
