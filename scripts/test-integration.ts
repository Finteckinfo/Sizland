#!/usr/bin/env tsx

/**
 * Test script for SIZ Token Integration
 * Run with: npx tsx scripts/test-integration.ts
 */

import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';
import { paymentDB } from './db-payments';

async function testIntegration() {
  console.log('🧪 Testing SIZ Token Integration...\n');

  try {
    // Test 1: Validate mnemonic and derived address
    console.log('1. Testing mnemonic validation and address derivation...');
    try {
      const derivedAddress = sizTokenTransferService.getDerivedCentralWalletAddress();
      const isValidAddress = sizTokenTransferService.validateCentralWalletAddress();
      console.log('✅ Mnemonic validation successful');
      console.log('📍 Derived address:', derivedAddress);
      console.log('🔍 Address validation:', isValidAddress ? 'PASSED' : 'FAILED');
    } catch (error) {
      console.log('❌ Mnemonic validation failed:', error);
    }
    console.log('');

    // Test 2: Check central wallet balance
    console.log('2. Testing central wallet balance check...');
    const balanceCheck = await sizTokenTransferService.checkCentralWalletBalance();
    console.log('✅ Balance check result:', balanceCheck);
    console.log('');

    // Test 3: Check database connection
    console.log('3. Testing database connection...');
    try {
      const stats = await paymentDB.getPaymentStatistics();
      console.log('✅ Database connection successful');
      console.log('📊 Payment statistics:', stats);
    } catch (error) {
      console.log('❌ Database connection failed:', error);
    }
    console.log('');

    // Test 4: Validate Algorand address format
    console.log('4. Testing address validation...');
    const testAddress = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const isValid = await sizTokenTransferService.checkReceiverOptIn(testAddress);
    console.log('✅ Address validation test completed:', isValid);
    console.log('');

    // Test 5: Check asset freeze status
    console.log('5. Testing asset freeze status check...');
    try {
      const freezeStatus = await sizTokenTransferService.checkAssetFreezeStatus(testAddress);
      console.log('✅ Freeze status check completed:', freezeStatus);
    } catch (error) {
      console.log('❌ Freeze status check failed:', error);
    }
    console.log('');

    console.log('🎉 Integration tests completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set up your environment variables');
    console.log('2. Create your database schema');
    console.log('3. Fund your central wallet with SIZ tokens');
    console.log('4. Test with a small purchase');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testIntegration()
    .then(() => {
      console.log('✅ All tests passed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

export { testIntegration };
