#!/usr/bin/env tsx

/**
 * Test script for direct token transfer
 * This tests the direct transfer functionality that handles opt-in requirements gracefully
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function testDirectTransfer() {
  console.log('🧪 Testing Direct Token Transfer\n');

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
      console.log(`   ✅ ${varName}: ${varName.includes('MNEMONIC') ? '[HIDDEN]' : value}`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      return;
    }
  }

  // Check if test user address is provided
  if (!process.env.TEST_USER_ADDRESS) {
    console.log('\n⚠️  TEST_USER_ADDRESS not set - this is required for testing');
    console.log('   Add TEST_USER_ADDRESS to your .env file to test the transfer');
    return;
  }

  console.log('\n🔑 Test User Address:', process.env.TEST_USER_ADDRESS);

  // Test the direct transfer method
  try {
    const result = await sizTokenTransferService.transferSizTokensDirect({
      receiverAddress: process.env.TEST_USER_ADDRESS,
      amount: 1000, // Test with 1000 SIZ tokens
      paymentId: 'test-payment-' + Date.now(),
    });

    console.log('\n📊 Test Result:', result);

    if (result.success) {
      console.log('\n✅ Direct transfer test completed successfully!');
    } else {
      console.log('\n❌ Direct transfer test failed:', result.error);
      if (result.requiresOptIn) {
        console.log('   Opt-in required:', result.optInInstructions);
      }
    }

  } catch (error) {
    console.error('\n💥 Test execution error:', error);
  }
}

// Run the test
testDirectTransfer().catch(console.error);
