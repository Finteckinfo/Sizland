#!/usr/bin/env tsx

/**
 * Complete webhook debugging script
 * Tests the entire flow from Stripe webhook to token transfer
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';
import { paymentDB } from '../src/lib/database/payments';

// Load environment variables
dotenv.config();

async function debugWebhookComplete() {
  console.log('🔍 Complete Webhook Debugging\n');

  // Check environment variables
  const requiredVars = [
    'SIZ_TOKEN_ASSET_ID',
    'CENTRAL_WALLET_MNEMONIC',
    'CENTRAL_WALLET_ADDRESS',
    'DATABASE_URL',
    'STRIPE_WEBHOOK_SECRET'
  ];

  console.log('🔍 Environment Variables Check:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName.includes('SECRET') || varName.includes('MNEMONIC') ? '[HIDDEN]' : value}`);
    } else {
      console.log(`   ❌ ${varName}: NOT SET`);
      return;
    }
  }

  // Test 1: Database connectivity and table structure
  console.log('\n📋 Test 1: Database Connectivity & Tables');
  try {
    // Check if webhook_events table exists and has correct structure
    const tableCheck = await paymentDB.pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'webhook_events' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Webhook Events Table Structure:');
    tableCheck.rows.forEach((col: any) => {
      console.log(`     ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check table row count
    const rowCount = await paymentDB.pool.query('SELECT COUNT(*) FROM webhook_events');
    console.log(`   Current webhook events: ${rowCount.rows[0].count}`);
    
  } catch (error) {
    console.error('   ❌ Database check failed:', error);
    return;
  }

  // Test 2: Central wallet status
  console.log('\n📋 Test 2: Central Wallet Status');
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

  // Test 3: Simulate webhook event recording
  console.log('\n📋 Test 3: Webhook Event Recording');
  try {
    const testWebhookEvent = await paymentDB.recordWebhookEvent(
      'evt_test_' + Date.now(),
      'checkout.session.completed'
    );
    console.log('   ✅ Test webhook event recorded:', testWebhookEvent.id);

    // Clean up test event
    await paymentDB.pool.query('DELETE FROM webhook_events WHERE id = $1', [testWebhookEvent.id]);
    console.log('   ✅ Test webhook event cleaned up');
  } catch (error) {
    console.error('   ❌ Webhook event recording failed:', error);
    return;
  }

  // Test 4: Simulate complete payment flow
  console.log('\n📋 Test 4: Complete Payment Flow Simulation');
  try {
    const testWalletAddress = process.env.TEST_RECEIVER_ADDRESS || 'TEST_ADDRESS_NOT_SET';
    
    if (testWalletAddress === 'TEST_ADDRESS_NOT_SET') {
      console.log('   ⚠️  TEST_RECEIVER_ADDRESS not set - using dummy address');
      // Create a test payment transaction
      const testPayment = await paymentDB.createPaymentTransaction({
        payment_reference: `test-webhook-${Date.now()}`,
        stripe_payment_intent_id: `test-pi-${Date.now()}`,
        subtotal: 10.00,
        processing_fee: 0.50,
        total_amount: 10.50,
        currency: 'USD',
        token_amount: 100,
        price_per_token: 0.10,
        user_wallet_address: 'TEST_WALLET_ADDRESS',
        user_email: 'test@example.com',
        payment_status: 'pending',
        token_transfer_status: 'pending',
      });

      console.log('   ✅ Test payment transaction created:', testPayment.id);

      // Clean up test payment
      await paymentDB.deleteTestPaymentTransaction(testPayment.id);
      console.log('   ✅ Test payment transaction cleaned up');
    } else {
      console.log(`   Testing with wallet: ${testWalletAddress}`);
      
      // Check opt-in status
      const optInStatus = await sizTokenTransferService.checkReceiverOptIn(testWalletAddress);
      console.log('   Opt-in Status:', {
        isOptedIn: optInStatus.isOptedIn,
        canOptIn: optInStatus.canOptIn,
        alogBalance: optInStatus.alogBalance,
        minBalanceRequired: optInStatus.minBalanceRequired
      });

      // Attempt token transfer
      const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
        receiverAddress: testWalletAddress,
        amount: 50,
        paymentId: 'test-webhook-payment'
      });

      console.log('   Transfer Result:', {
        success: transferResult.success,
        requiresOptIn: transferResult.requiresOptIn,
        requiresUserAction: transferResult.requiresUserAction,
        actionRequired: transferResult.actionRequired,
        txId: transferResult.txId
      });
    }
  } catch (error) {
    console.error('   ❌ Payment flow simulation failed:', error);
  }

  // Test 5: Check webhook endpoint accessibility
  console.log('\n📋 Test 5: Webhook Endpoint Check');
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/stripe-webhook`;
    
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log(`   Base URL: ${baseUrl}`);
    console.log('   ⚠️  Manually verify this endpoint is accessible from Stripe');
    console.log('   ⚠️  Check if your server is publicly accessible');
    console.log('   ⚠️  Verify Stripe webhook configuration in dashboard');
  } catch (error) {
    console.error('   ❌ Webhook endpoint check failed:', error);
  }

  console.log('\n🎯 Webhook Debug Summary:');
  console.log('   ✅ Database tables and structure verified');
  console.log('   ✅ Central wallet status confirmed');
  console.log('   ✅ Webhook event recording working');
  console.log('   ✅ Payment flow simulation completed');
  console.log('   ⚠️  Manual webhook endpoint verification required');
  
  console.log('\n🚨 Next Steps to Fix Webhook Issues:');
  console.log('   1. Verify Stripe webhook URL in dashboard points to: /api/stripe-webhook');
  console.log('   2. Ensure webhook secret matches STRIPE_WEBHOOK_SECRET');
  console.log('   3. Check if your server is publicly accessible from Stripe');
  console.log('   4. Monitor server logs for webhook delivery attempts');
  console.log('   5. Test with Stripe CLI webhook forwarding');
  
  console.log('\n🔧 If webhooks still fail, consider:');
  console.log('   - Using Stripe CLI for local testing');
  console.log('   - Implementing webhook retry logic');
  console.log('   - Adding webhook delivery monitoring');
  console.log('   - Using Stripe webhook dashboard for debugging');
}

// Run the debug script
debugWebhookComplete().catch(console.error);
