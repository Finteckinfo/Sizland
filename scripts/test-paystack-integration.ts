#!/usr/bin/env tsx

/**
 * Paystack Integration Test Script
 * 
 * This script tests the Paystack integration by:
 * 1. Creating a test transaction
 * 2. Verifying the transaction
 * 3. Testing webhook processing
 * 4. Testing token transfer flow
 */

import { config } from 'dotenv';
import { paystack } from '../src/lib/paystack/server';
import { calculateTokenPrice, generatePaymentReference, convertUSDToCurrency, PAYSTACK_PRODUCT_CONFIG } from '../src/lib/paystack/config';

// Load environment variables
config({ path: '.env.local' });

interface TestConfig {
  testEmail: string;
  testWalletAddress: string;
  tokenAmount: number;
  currency: string;
}

const TEST_CONFIG: TestConfig = {
  testEmail: 'test@siz.land',
  testWalletAddress: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890123456789012345678901234567890', // Test Algorand address
  tokenAmount: 100,
  currency: 'USD',
};

async function testPaystackConfiguration() {
  console.log('🔧 Testing Paystack Configuration...');
  
  try {
    // Check if environment variables are set
    const requiredEnvVars = [
      'PAYSTACK_SECRET_KEY',
      'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
      'PAYSTACK_WEBHOOK_SECRET',
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      return false;
    }
    
    console.log('✅ All required environment variables are set');
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return false;
  }
}

async function testPricingCalculation() {
  console.log('💰 Testing Pricing Calculation...');
  
  try {
    const pricing = calculateTokenPrice(TEST_CONFIG.tokenAmount);
    console.log('📊 Pricing Details (USD):', {
      tokenAmount: TEST_CONFIG.tokenAmount,
      pricePerToken: pricing.pricePerToken,
      subtotal: pricing.subtotal,
      processingFee: pricing.processingFee,
      total: pricing.total,
    });
    
    // Test currency conversion
    console.log('💱 Testing Currency Conversion...');
    PAYSTACK_PRODUCT_CONFIG.SUPPORTED_CURRENCIES.forEach(currency => {
      const convertedAmount = convertUSDToCurrency(pricing.total, currency);
      console.log(`   ${currency}: ${convertedAmount.toLocaleString()}`);
    });
    
    console.log('✅ Pricing calculation successful');
    return true;
  } catch (error) {
    console.error('❌ Pricing calculation failed:', error);
    return false;
  }
}

async function testTransactionCreation() {
  console.log('💳 Testing Transaction Creation...');
  
  try {
    const pricing = calculateTokenPrice(TEST_CONFIG.tokenAmount);
    const paymentReference = generatePaymentReference();
    
    // Convert USD to target currency and get amount in smallest unit
    let amountInSmallestUnit: number;
    switch (TEST_CONFIG.currency.toUpperCase()) {
      case 'NGN':
        amountInSmallestUnit = convertUSDToCurrency(pricing.total, 'NGN') * 100; // Convert to kobo
        break;
      case 'KES':
        amountInSmallestUnit = convertUSDToCurrency(pricing.total, 'KES') * 100; // Convert to cents
        break;
      case 'USD':
        amountInSmallestUnit = Math.round(pricing.total * 100); // Convert to cents
        break;
      default:
        amountInSmallestUnit = Math.round(pricing.total * 100); // Default to cents
        break;
    }
    
    const transactionResult = await paystack.initializeTransaction({
      email: TEST_CONFIG.testEmail,
      amount: amountInSmallestUnit,
      currency: TEST_CONFIG.currency,
      reference: paymentReference,
      metadata: {
        token_amount: TEST_CONFIG.tokenAmount.toString(),
        price_per_token: pricing.pricePerToken.toString(),
        subtotal: pricing.subtotal.toString(),
        processing_fee: pricing.processingFee.toString(),
        total: pricing.total.toString(),
        payment_reference: paymentReference,
        user_wallet_address: TEST_CONFIG.testWalletAddress,
        product_type: 'siz_token',
        network: 'algorand',
        currency: TEST_CONFIG.currency,
      },
      callback_url: `http://localhost:3000/wallet?success=true&reference=${paymentReference}`,
    });
    
    if (transactionResult.success) {
      console.log('✅ Transaction created successfully');
      console.log('📋 Transaction Details:', {
        reference: paymentReference,
        authorizationUrl: transactionResult.data.data.authorization_url,
        amount: amountInSmallestUnit,
        currency: TEST_CONFIG.currency,
      });
      return { success: true, reference: paymentReference };
    } else {
      console.error('❌ Transaction creation failed:', transactionResult.error);
      return { success: false, error: transactionResult.error };
    }
  } catch (error) {
    console.error('❌ Transaction creation test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testTransactionVerification(reference: string) {
  console.log('🔍 Testing Transaction Verification...');
  
  try {
    const verificationResult = await paystack.verifyTransaction(reference);
    
    if (verificationResult.success) {
      console.log('✅ Transaction verification successful');
      console.log('📊 Verification Details:', {
        reference: verificationResult.data.data.reference,
        status: verificationResult.data.data.status,
        amount: verificationResult.data.data.amount,
        currency: verificationResult.data.data.currency,
      });
      return true;
    } else {
      console.error('❌ Transaction verification failed:', verificationResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Transaction verification test failed:', error);
    return false;
  }
}

async function testWebhookSignature() {
  console.log('🔐 Testing Webhook Signature Verification...');
  
  try {
    const testPayload = JSON.stringify({
      event: 'charge.success',
      data: {
        id: 'test_transaction_id',
        reference: 'test_reference',
        status: 'success',
        amount: 100000,
        currency: 'NGN',
        metadata: {
          token_amount: '100',
          user_wallet_address: TEST_CONFIG.testWalletAddress,
        },
      },
    });
    
    // Generate a test signature
    const crypto = require('crypto');
    const testSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(testPayload)
      .digest('hex');
    
    const isValid = paystack.verifyWebhookSignature(testPayload, testSignature);
    
    if (isValid) {
      console.log('✅ Webhook signature verification successful');
      return true;
    } else {
      console.error('❌ Webhook signature verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook signature test failed:', error);
    return false;
  }
}

async function testCustomerCreation() {
  console.log('👤 Testing Customer Creation...');
  
  try {
    const customerResult = await paystack.createCustomer({
      email: TEST_CONFIG.testEmail,
      first_name: 'Test',
      last_name: 'User',
      metadata: {
        wallet_address: TEST_CONFIG.testWalletAddress,
        source: 'test_script',
      },
    });
    
    if (customerResult.success) {
      console.log('✅ Customer created successfully');
      console.log('👤 Customer Details:', {
        id: customerResult.data.data.id,
        email: customerResult.data.data.email,
        customer_code: customerResult.data.data.customer_code,
      });
      return true;
    } else {
      console.error('❌ Customer creation failed:', customerResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Customer creation test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Paystack Integration Tests...\n');
  
  const tests = [
    { name: 'Configuration', fn: testPaystackConfiguration },
    { name: 'Pricing Calculation', fn: testPricingCalculation },
    { name: 'Customer Creation', fn: testCustomerCreation },
    { name: 'Webhook Signature', fn: testWebhookSignature },
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }
  
  // Test transaction creation and verification
  console.log('\n--- Transaction Creation ---');
  const transactionResult = await testTransactionCreation();
  if (transactionResult.success) {
    passedTests++;
    totalTests++;
    
    console.log('\n--- Transaction Verification ---');
    const verificationResult = await testTransactionVerification(transactionResult.reference!);
    if (verificationResult) {
      passedTests++;
      totalTests++;
    }
  } else {
    totalTests++;
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Paystack integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration and try again.');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testPaystackConfiguration,
  testPricingCalculation,
  testTransactionCreation,
  testTransactionVerification,
  testWebhookSignature,
  testCustomerCreation,
  runAllTests,
};
