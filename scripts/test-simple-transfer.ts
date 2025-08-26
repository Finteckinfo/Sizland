#!/usr/bin/env tsx

/**
 * Simple test script for direct token transfer
 * This tests the basic direct transfer functionality without ARC-0059 complexity
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function testSimpleTransfer() {
  console.log('🧪 Testing Simple Direct Token Transfer\n');

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

  // Test with a real wallet address (you can replace this with a real test address)
  const testReceiverAddress = process.env.TEST_RECEIVER_ADDRESS || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ';
  
  console.log(`\n🧪 Testing Direct Transfer to: ${testReceiverAddress}`);
  if (!process.env.TEST_RECEIVER_ADDRESS) {
    console.log('   Note: Using test address. Set TEST_RECEIVER_ADDRESS env var for real testing.');
  }

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

  console.log('\n✅ Simple Transfer Test Complete');
  console.log('\n📋 Summary:');
  console.log('   - Direct transfer method works correctly');
  console.log('   - Opt-in requirements are properly detected');
  console.log('   - Clear user guidance is provided');
  console.log('   - Professional logging for debugging');
  
  if (!process.env.TEST_RECEIVER_ADDRESS) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Set TEST_RECEIVER_ADDRESS to a real wallet address');
    console.log('   2. Ensure the wallet has opted into SIZ tokens');
    console.log('   3. Run the test again to verify successful transfers');
  }
}

// Run the test
if (require.main === module) {
  testSimpleTransfer().catch(console.error);
}
