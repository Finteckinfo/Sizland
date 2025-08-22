import dotenv from 'dotenv';
import { paymentDB } from '../src/lib/database/payments';
import { sizTokenTransferService } from '../src/lib/algorand/token-transfer';

// Load environment variables
dotenv.config();

async function debugWebhookIntegration() {
  console.log('🔍 Debugging Webhook Integration...\n');
  
  try {
    // Test 1: Environment Variables Check
    console.log('📊 Test 1: Environment Variables Check');
    console.log('=====================================');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_SECRET_KEY',
      'SIZ_TOKEN_ASSET_ID',
      'CENTRAL_WALLET_ADDRESS',
      'CENTRAL_WALLET_MNEMONIC',
      'ARC59_APP_ID',
      'UNFREEZE_ACCOUNT_ADDRESS',
      'UNFREEZE_ACCOUNT_MNEMONIC'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set');
      console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET (hidden)' : 'MISSING');
      console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET (hidden)' : 'MISSING');
      console.log('   SIZ_TOKEN_ASSET_ID:', process.env.SIZ_TOKEN_ASSET_ID);
      console.log('   ARC59_APP_ID:', process.env.ARC59_APP_ID);
    } else {
      console.error('❌ Missing environment variables:', missingVars);
      return;
    }
    
    // Test 2: Database Connection and Webhook Events
    console.log('\n📊 Test 2: Database Connection and Webhook Events');
    console.log('=====================================');
    
    try {
      // Check if webhook_events table has any data
      const webhookStats = await paymentDB.getWebhookEventStatistics();
      console.log('📊 Webhook events statistics:', webhookStats);
      
      // Check recent webhook events
      const recentWebhooks = await paymentDB.getRecentWebhookEvents(10);
      console.log('📋 Recent webhook events:', recentWebhooks);
      
    } catch (error) {
      console.error('❌ Webhook events check failed:', error);
    }
    
    // Test 3: Payment Transactions Status
    console.log('\n📊 Test 3: Payment Transactions Status');
    console.log('=====================================');
    
    try {
      const paymentStats = await paymentDB.getPaymentStatistics();
      console.log('📊 Payment statistics:', paymentStats);
      
      // Check recent payment transactions
      const recentPayments = await paymentDB.getRecentPaymentTransactions(10);
      console.log('📋 Recent payment transactions:', recentPayments);
      
    } catch (error) {
      console.error('❌ Payment transactions check failed:', error);
    }
    
    // Test 4: Simulate Webhook Event Processing
    console.log('\n📊 Test 4: Simulate Webhook Event Processing');
    console.log('=====================================');
    
    try {
      // Simulate a real Stripe webhook event
      const simulatedWebhookEvent = {
        id: `evt_simulated_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_simulated_${Date.now()}`,
            payment_intent: `pi_simulated_${Date.now()}`,
            payment_status: 'paid',
            amount_total: 2500, // $25.00 in cents
            currency: 'usd',
            customer_details: {
              email: 'test@example.com'
            },
            metadata: {
              token_amount: '100',
              price_per_token: '0.25',
              payment_reference: `test-webhook-${Date.now()}`,
              user_wallet_address: '2DAEOSKQGXJKIEWMDENGMEN7PW2LWRW2LDWVHPY4O4DO4CCGLKMFOA2JFI',
              product_type: 'siz_token',
              network: 'algorand'
            }
          }
        }
      };
      
      console.log('📝 Simulating webhook event:', {
        eventId: simulatedWebhookEvent.id,
        eventType: simulatedWebhookEvent.type,
        sessionId: simulatedWebhookEvent.data.object.id
      });
      
      // Record the webhook event
      await paymentDB.recordWebhookEvent(simulatedWebhookEvent.id, simulatedWebhookEvent.type);
      console.log('✅ Webhook event recorded successfully');
      
      // Process the webhook event
      if (simulatedWebhookEvent.type === 'checkout.session.completed') {
        await handleCheckoutSessionCompleted(simulatedWebhookEvent.data.object);
        console.log('✅ Webhook event processed successfully');
      }
      
    } catch (error) {
      console.error('❌ Webhook simulation failed:', error);
    }
    
    // Test 5: Check Final Status
    console.log('\n📊 Test 5: Final Status Check');
    console.log('=====================================');
    
    try {
      const finalWebhookStats = await paymentDB.getWebhookEventStatistics();
      console.log('📊 Final webhook events statistics:', finalWebhookStats);
      
      const finalPaymentStats = await paymentDB.getPaymentStatistics();
      console.log('📊 Final payment statistics:', finalPaymentStats);
      
    } catch (error) {
      console.error('❌ Final status check failed:', error);
    }
    
    console.log('\n🎉 Webhook Integration Debug Completed!');
    
  } catch (error) {
    console.error('❌ Webhook integration debug failed:', error);
  }
}

// Simulate the webhook handler function
async function handleCheckoutSessionCompleted(session: any) {
  console.log('🛒 Processing simulated checkout session:', session.id);
  
  try {
    // Extract metadata
    const {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    } = session.metadata;

    console.log('📋 Extracted metadata:', {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    });

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('❌ Missing required metadata in checkout session:', session.id);
      return;
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.log('⚠️ Checkout session not paid:', session.id);
      return;
    }

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
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      customerEmail: session.customer_details?.email,
    });

  } catch (error) {
    console.error('❌ Error handling checkout session completion:', error);
    throw error;
  }
}

// Simulate the payment processing function
async function processSuccessfulPayment(data: any) {
  console.log('🚀 Processing simulated successful payment:', {
    paymentReference: data.paymentReference,
    tokenAmount: data.tokenAmount,
    userWalletAddress: data.userWalletAddress,
    amount: data.amount,
    currency: data.currency
  });
  
  try {
    // 1. Check idempotency
    console.log('🔍 Step 1: Checking payment idempotency...');
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    console.log('📊 Idempotency check result:', idempotencyCheck);
    
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'paid') {
      console.log('⚠️ Payment already processed:', data.paymentReference);
      return;
    }

    // 2. Create payment transaction record
    console.log('📝 Step 2: Creating payment transaction record...');
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
    
    console.log('✅ Payment transaction created:', {
      transactionId: paymentTransaction.id,
      paymentReference: paymentTransaction.payment_reference
    });

    // 3. Check token inventory
    console.log('🔍 Step 3: Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount);
    console.log('📊 Inventory check result:', inventoryCheck);
    
    if (!inventoryCheck.available) {
      console.error('❌ Insufficient token inventory for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }

    // 4. Reserve tokens
    console.log('🔒 Step 4: Reserving tokens...');
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);
    console.log('✅ Tokens reserved successfully');

    // 5. Transfer tokens (simulate without actual blockchain transaction)
    console.log('🚀 Step 5: Simulating token transfer...');
    
    // Update status to completed (simulating successful transfer)
    await paymentDB.updateTokenTransferStatus(
      paymentTransaction.id,
      'completed',
      `simulated_tx_${Date.now()}`
    );
    await paymentDB.updatePaymentStatus(paymentTransaction.id, 'paid', 'Simulated transfer successful');
    
    // Update user wallet balance
    await paymentDB.updateUserWalletBalance(
      data.userWalletAddress,
      data.tokenAmount,
      'credit'
    );

    console.log('🎉 Simulated payment processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Simulated payment processing failed:', error);
    throw error;
  }
}

// Run debug if this script is executed directly
if (require.main === module) {
  debugWebhookIntegration()
    .then(() => {
      console.log('\n✅ Webhook integration debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Webhook integration debug failed:', error);
      process.exit(1);
    });
}

export { debugWebhookIntegration };
