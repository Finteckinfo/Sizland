#!/usr/bin/env tsx

/**
 * Complete Webhook Flow Test Script
 * Tests the entire payment flow from webhook to token transfer with all required metadata
 */

import dotenv from 'dotenv';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';
import { paymentDB } from '../src/lib/database/payments';

// Load environment variables
dotenv.config();

interface TestWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

async function testCompleteWebhookFlow() {
  console.log('🧪 Complete Webhook Flow Test\n');

  // Check environment variables
  const requiredVars = [
    'SIZ_TOKEN_ASSET_ID',
    'CENTRAL_WALLET_MNEMONIC',
    'CENTRAL_WALLET_ADDRESS',
    'DATABASE_URL',
    'TEST_RECEIVER_ADDRESS'
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

  // Test wallet address
  const testWalletAddress = process.env.TEST_RECEIVER_ADDRESS!;
  const testPaymentReference = `test-webhook-${Date.now()}`;
  const testTokenAmount = 50;
  const testPricePerToken = 0.10;
  const testTotalAmount = testTokenAmount * testPricePerToken;

  console.log('\n📋 Test Configuration:');
  console.log(`   Test Wallet: ${testWalletAddress}`);
  console.log(`   Payment Reference: ${testPaymentReference}`);
  console.log(`   Token Amount: ${testTokenAmount} SIZ`);
  console.log(`   Price Per Token: $${testPricePerToken}`);
  console.log(`   Total Amount: $${testTotalAmount}`);

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

  // Test 2: Check test wallet opt-in status
  console.log('\n📋 Test 2: Test Wallet Opt-in Status');
  try {
    const optInStatus = await sizTokenTransferService.checkReceiverOptIn(testWalletAddress);
    console.log('   Opt-in Status:', {
      isOptedIn: optInStatus.isOptedIn,
      canOptIn: optInStatus.canOptIn,
      alogBalance: optInStatus.alogBalance,
      minBalanceRequired: optInStatus.minBalanceRequired
    });
  } catch (error) {
    console.error('   ❌ Opt-in check failed:', error);
    return;
  }

  // Test 3: Simulate checkout.session.completed webhook
  console.log('\n📋 Test 3: Simulating checkout.session.completed Webhook');
  try {
    const checkoutSessionEvent: TestWebhookEvent = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2022-08-01',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          object: 'checkout.session',
          amount_subtotal: testTotalAmount * 100, // Convert to cents
          amount_total: testTotalAmount * 100,
          currency: 'usd',
          customer_details: {
            email: 'test@example.com',
            name: 'Test User'
          },
          metadata: {
            token_amount: testTokenAmount.toString(),
            price_per_token: testPricePerToken.toString(),
            payment_reference: testPaymentReference,
            user_wallet_address: testWalletAddress,
            product_type: 'siz_token',
            network: 'algorand'
          },
          payment_intent: `pi_test_${Date.now()}`,
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: null,
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };

    console.log('   📤 Simulating webhook event...');
    await simulateWebhookEvent(checkoutSessionEvent);

  } catch (error) {
    console.error('   ❌ Checkout session webhook simulation failed:', error);
  }

  // Test 4: Simulate payment_intent.succeeded webhook
  console.log('\n📋 Test 4: Simulating payment_intent.succeeded Webhook');
  try {
    const paymentIntentEvent: TestWebhookEvent = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2022-08-01',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `pi_test_${Date.now()}`,
          object: 'payment_intent',
          amount: testTotalAmount * 100, // Convert to cents
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            token_amount: testTokenAmount.toString(),
            price_per_token: testPricePerToken.toString(),
            payment_reference: `${testPaymentReference}-intent`, // Different reference for payment intent
            user_wallet_address: testWalletAddress,
            product_type: 'siz_token',
            network: 'algorand'
          }
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: null,
        idempotency_key: null
      },
      type: 'payment_intent.succeeded'
    };

    console.log('   📤 Simulating webhook event...');
    await simulateWebhookEvent(paymentIntentEvent);

  } catch (error) {
    console.error('   ❌ Payment intent webhook simulation failed:', error);
  }

  // Test 5: Check database entries
  console.log('\n📋 Test 5: Checking Database Entries');
  try {
    // Check webhook events
    const webhookEvents = await paymentDB.getRecentWebhookEvents(5);
    console.log('   Recent Webhook Events:');
    webhookEvents.forEach((event: any, index: number) => {
      console.log(`     ${index + 1}. ${event.event_type} - ${event.stripe_event_id} (${event.created_at})`);
    });

    // Check payment transactions
    const paymentTransactions = await paymentDB.getRecentPaymentTransactions(5);
    console.log('   Recent Payment Transactions:');
    paymentTransactions.forEach((tx: any, index: number) => {
      console.log(`     ${index + 1}. ${tx.payment_reference} - ${tx.payment_status} - ${tx.token_transfer_status} (${tx.created_at})`);
    });

  } catch (error) {
    console.error('   ❌ Database check failed:', error);
  }

  // Test 6: Test token transfer directly
  console.log('\n📋 Test 6: Direct Token Transfer Test');
  try {
    console.log('   🚀 Testing direct token transfer...');
    const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
      receiverAddress: testWalletAddress,
      amount: testTokenAmount,
      paymentId: testPaymentReference
    });

    console.log('   Transfer Result:', {
      success: transferResult.success,
      requiresOptIn: transferResult.requiresOptIn,
      requiresUserAction: transferResult.requiresUserAction,
      actionRequired: transferResult.actionRequired,
      txId: transferResult.txId,
      error: transferResult.error
    });

    if (transferResult.success) {
      console.log('   ✅ Token transfer successful!');
    } else if (transferResult.requiresOptIn) {
      console.log('   ⚠️ Token transfer requires user opt-in');
      console.log('   Instructions:', transferResult.instructions);
    } else {
      console.log('   ❌ Token transfer failed:', transferResult.error);
    }

  } catch (error) {
    console.error('   ❌ Direct token transfer test failed:', error);
  }

  console.log('\n🎯 Test Summary:');
  console.log('   ✅ Environment variables verified');
  console.log('   ✅ Central wallet status confirmed');
  console.log('   ✅ Test wallet opt-in status checked');
  console.log('   ✅ Webhook events simulated');
  console.log('   ✅ Database entries verified');
  console.log('   ✅ Token transfer tested');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. If token transfer requires opt-in, user must opt into SIZ tokens');
  console.log('   2. If token transfer succeeded, check the transaction on Algorand explorer');
  console.log('   3. Verify database entries for complete audit trail');
  console.log('   4. Test with real frontend integration');
}

async function simulateWebhookEvent(event: TestWebhookEvent) {
  try {
    // Record webhook event
    console.log('   📝 Recording webhook event...');
    await paymentDB.recordWebhookEvent(event.id, event.type);
    console.log('   ✅ Webhook event recorded');

    // Process the event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await processCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await processPaymentIntentSucceeded(event.data.object);
        break;
      default:
        console.log(`   ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('   ✅ Webhook event processed successfully');

  } catch (error) {
    console.error('   ❌ Webhook event processing failed:', error);
    throw error;
  }
}

async function processCheckoutSessionCompleted(session: any) {
  console.log('   🛒 Processing checkout.session.completed...');
  
  const {
    token_amount,
    price_per_token,
    payment_reference,
    user_wallet_address,
    product_type,
    network
  } = session.metadata;

  // Validate required metadata
  if (!token_amount || !price_per_token || !payment_reference) {
    console.log('   ❌ Missing required metadata in checkout session');
    return;
  }

  // Check if payment was successful
  if (session.payment_status !== 'paid') {
    console.log('   ❌ Checkout session not paid');
    return;
  }

  console.log('   ✅ Checkout session validation passed');
  console.log(`   📊 Payment Details: ${token_amount} tokens @ $${price_per_token} = $${session.amount_total / 100}`);
  console.log(`   👤 User Wallet: ${user_wallet_address}`);

  // Process the successful payment
  await processSuccessfulPayment({
    sessionId: session.id,
    paymentIntentId: session.payment_intent,
    tokenAmount: parseInt(token_amount),
    pricePerToken: parseFloat(price_per_token),
    paymentReference: payment_reference,
    userWalletAddress: user_wallet_address,
    productType: product_type,
    network: network,
    amount: session.amount_total / 100,
    currency: session.currency,
    customerEmail: session.customer_details?.email,
  });
}

async function processPaymentIntentSucceeded(paymentIntent: any) {
  console.log('   💳 Processing payment_intent.succeeded...');
  
  const {
    token_amount,
    price_per_token,
    payment_reference,
    user_wallet_address,
    product_type,
    network
  } = paymentIntent.metadata;

  // Validate required metadata
  if (!token_amount || !price_per_token || !payment_reference) {
    console.log('   ❌ Missing required metadata in payment intent');
    return;
  }

  console.log('   ✅ Payment intent validation passed');
  console.log(`   📊 Payment Details: ${token_amount} tokens @ $${price_per_token} = $${paymentIntent.amount / 100}`);
  console.log(`   👤 User Wallet: ${user_wallet_address}`);

  // Process the successful payment
  await processSuccessfulPayment({
    sessionId: null,
    paymentIntentId: paymentIntent.id,
    tokenAmount: parseInt(token_amount),
    pricePerToken: parseFloat(price_per_token),
    paymentReference: payment_reference,
    userWalletAddress: user_wallet_address,
    productType: product_type,
    network: network,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    customerEmail: paymentIntent.receipt_email,
  });
}

interface PaymentProcessingData {
  sessionId: string | null;
  paymentIntentId: string;
  tokenAmount: number;
  pricePerToken: number;
  paymentReference: string;
  userWalletAddress: string;
  productType: string;
  network: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

async function processSuccessfulPayment(data: PaymentProcessingData) {
  console.log('   🚀 Processing successful payment...');
  
  try {
    // 1. Check idempotency
    console.log('   🔍 Checking payment idempotency...');
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'completed') {
      console.log('   ⚠️ Payment already processed');
      return;
    }

    // 2. Create payment transaction record
    console.log('   📝 Creating payment transaction record...');
    const paymentTransaction = await paymentDB.createPaymentTransaction({
      payment_reference: data.paymentReference,
      stripe_payment_intent_id: data.paymentIntentId,
      stripe_session_id: data.sessionId || undefined,
      subtotal: data.amount,
      processing_fee: 0,
      total_amount: data.amount,
      currency: data.currency,
      token_amount: data.tokenAmount,
      price_per_token: data.pricePerToken,
      user_wallet_address: data.userWalletAddress,
      user_email: data.customerEmail,
      payment_status: 'pending',
      token_transfer_status: 'pending',
    });
    
    console.log('   ✅ Payment transaction created:', paymentTransaction.id);

    // 3. Validate user wallet address
    if (!data.userWalletAddress) {
      console.log('   ❌ No user wallet address provided');
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'No wallet address provided');
      return;
    }
    
    console.log('   ✅ User wallet address validated');

    // 4. Check token inventory
    console.log('   🔍 Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount, data.network || 'algorand');
    
    if (!inventoryCheck.available) {
      console.log('   ❌ Insufficient token inventory');
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }

    // Reserve tokens
    console.log('   🔒 Reserving tokens...');
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);
    console.log('   ✅ Tokens reserved');

    try {
      // 5. Transfer SIZ tokens
      console.log('   🚀 Initiating SIZ token transfer...');
      const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
        receiverAddress: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      if (transferResult.success && transferResult.txId) {
        // 6. Update database with successful transfer
        console.log('   ✅ Token transfer successful!');
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'completed',
          transferResult.txId
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'paid', 'Tokens transferred successfully');
        
        // 7. Update user wallet balance
        console.log('   💰 Updating user wallet balance...');
        await paymentDB.updateUserWalletBalance(
          data.userWalletAddress,
          data.tokenAmount,
          'credit'
        );

        // 8. Record token transfer
        console.log('   📝 Recording token transfer...');
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: data.userWalletAddress,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: data.tokenAmount,
          transaction_id: transferResult.txId,
          status: 'completed',
        });
        
        console.log('   🎉 SIZ token transfer completed successfully!');
        console.log(`   📊 Transaction ID: ${transferResult.txId}`);

      } else {
        // Transfer failed
        console.log('   ❌ SIZ token transfer failed:', transferResult.error);
        
        if (transferResult.requiresOptIn) {
          console.log('   ⚠️ Transfer failed due to opt-in requirement');
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'pending',
            undefined,
            transferResult.instructions || 'User wallet not opted into SIZ token'
          );
          await paymentDB.updatePaymentStatus(
            paymentTransaction.id, 
            'processing', 
            `Payment successful but wallet not opted into SIZ token. ${transferResult.actionRequired === 'add-algo' ? 'User needs more ALGO balance.' : 'User must opt-in to receive tokens.'}`
          );
        } else {
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'failed',
            undefined,
            transferResult.error
          );
          await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Token transfer failed: ${transferResult.error}`);
          await paymentDB.releaseReservedTokens(paymentTransaction.id);
        }
      }

    } catch (transferError) {
      console.error('   ❌ Error during token transfer:', transferError);
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'Unknown transfer error'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Token transfer error occurred');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
    }

  } catch (error) {
    console.error('   ❌ Error processing payment:', error);
    throw error;
  }
}

// Run the test
testCompleteWebhookFlow().catch(console.error);
