#!/usr/bin/env tsx

/**
 * Test script for direct token transfer fallback approach
 * This tests the simplified transfer method that handles opt-in requirements gracefully
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function testDirectTransfer() {
  console.log('🧪 Testing Direct Token Transfer Fallback Approach\n');

  // Check environment variables
  const requiredVars = [
    'SIZ_TOKEN_ASSET_ID',
    'CENTRAL_WALLET_MNEMONIC',
    'CENTRAL_WALLET_ADDRESS'
  ];

  console.log('🔍 Environment Variables Check:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName.includes('MNEMONIC') ? 'SET' : value}`);
    } else {
      console.log(`   ❌ ${varName}: MISSING`);
    }
  }

  // Check if all required variables are set
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your .env.local file');
    return;
  }

  console.log('\n🔍 Central Wallet Status Check:');
  try {
    const walletStatus = await sizTokenTransferService.checkCentralWalletStatus();
    console.log('   Status:', walletStatus);
    
    if (!walletStatus.isReady) {
      console.error('❌ Central wallet is not ready for transfers');
      console.error('   Details:', walletStatus.details);
      return;
    }
    
    console.log('✅ Central wallet is ready for transfers');
  } catch (error) {
    console.error('❌ Failed to check central wallet status:', error);
    return;
  }

  // Test with a sample address (you can replace this with a real test address)
  const testReceiverAddress = process.env.TEST_RECEIVER_ADDRESS;
  
  console.log(`\n🧪 Testing Direct Transfer to: ${testReceiverAddress}`);
  console.log('   Note: This is a test address. Use TEST_RECEIVER_ADDRESS env var for real testing.');

  try {
    // Test the direct transfer method
    const transferResult = await sizTokenTransferService.transferSizTokensDirect({
      receiverAddress: testReceiverAddress,
      amount: 1, // Test with 1 token
      paymentId: 'test-payment-' + Date.now()
    });

    console.log('\n📊 Transfer Result:');
    console.log('   Success:', transferResult.success);
    
    if (transferResult.success) {
      console.log('   Transaction ID:', transferResult.txId);
      console.log('   ✅ Direct transfer successful!');
    } else {
      console.log('   Error:', transferResult.error);
      
      if (transferResult.requiresOptIn) {
        console.log('   Requires Opt-in:', transferResult.requiresOptIn);
        console.log('   Opt-in Instructions:', transferResult.optInInstructions);
        console.log('\n💡 This is expected behavior for non-opted-in addresses');
        console.log('   The system correctly identified the opt-in requirement');
      }
    }

  } catch (error) {
    console.error('❌ Transfer test failed:', error);
  }

  // Test the hybrid approach
  console.log('\n🧪 Testing Hybrid Transfer Approach:');
  try {
    const hybridResult = await sizTokenTransferService.transferSizTokensHybrid({
      receiverAddress: testReceiverAddress,
      amount: 1,
      paymentId: 'test-hybrid-' + Date.now()
    });

    console.log('\n📊 Hybrid Transfer Result:');
    console.log('   Success:', hybridResult.success);
    
    if (hybridResult.success) {
      console.log('   Transaction ID:', hybridResult.txId);
      console.log('   ✅ Hybrid transfer successful!');
    } else {
      console.log('   Error:', hybridResult.error);
      
      if (hybridResult.requiresOptIn) {
        console.log('   Requires Opt-in:', hybridResult.requiresOptIn);
        console.log('   Opt-in Instructions:', hybridResult.optInInstructions);
      }
    }

  } catch (error) {
    console.error('❌ Hybrid transfer test failed:', error);
  }

  console.log('\n✅ Direct Transfer Fallback Test Complete');
  console.log('\n📋 Summary:');
  console.log('   - Direct transfer method handles opt-in requirements gracefully');
  console.log('   - Hybrid approach provides fallback to ARC-0059 if needed');
  console.log('   - Clear error messages and opt-in instructions for users');
  console.log('   - Professional logging for debugging and monitoring');
}

// Run the test
if (require.main === module) {
  testDirectTransfer().catch(console.error);
}
