import dotenv from 'dotenv';
import { paymentDB } from '../src/lib/database/payments';

// Load environment variables
dotenv.config();

async function debugProductionWebhook() {
  console.log('🔍 Debugging Production Webhook Issues...\n');

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
      console.log('   ARC59_APP_ID:', process.env.STRIPE_ARC59_APP_ID);
    } else {
      console.error('❌ Missing environment variables:', missingVars);
      return;
    }

    // Test 2: Database Connection and Current State
    console.log('\n📊 Test 2: Database Connection and Current State');
    console.log('=====================================');

    try {
      // Check current database state
      const webhookStats = await paymentDB.getWebhookEventStatistics();
      console.log('📊 Current webhook events:', webhookStats);

      const paymentStats = await paymentDB.getPaymentStatistics();
      console.log('📊 Current payment transactions:', paymentStats);

      const recentWebhooks = await paymentDB.getRecentWebhookEvents(5);
      console.log('📋 Recent webhook events:', recentWebhooks);

      const recentPayments = await paymentDB.getRecentPaymentTransactions(5);
      console.log('📋 Recent payment transactions:', recentPayments);

    } catch (error) {
      console.error('❌ Database check failed:', error);
      return;
    }

    // Test 3: Production Webhook Configuration Check
    console.log('\n📊 Test 3: Production Webhook Configuration Check');
    console.log('=====================================');

    console.log('🔧 CRITICAL CHECKS REQUIRED:');
    console.log('');
    console.log('1. 📍 Stripe Dashboard Webhook Settings:');
    console.log('   - Go to: https://dashboard.stripe.com/webhooks');
    console.log('   - Check if endpoint URL is: https://yourdomain.com/api/stripe-webhook');
    console.log('   - Verify events include: checkout.session.completed');
    console.log('   - Check status is "Active" (not "Failed" or "Pending")');
    console.log('');
    console.log('2. 🌐 Domain Accessibility:');
    console.log('   - Ensure your domain is publicly accessible');
    console.log('   - Check if there are any proxy/load balancer issues');
    console.log('   - Verify SSL certificate is valid');
    console.log('');
    console.log('3. 🔒 Environment Variables:');
    console.log('   - Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard');
    console.log('   - Check if DATABASE_URL is correct for production');
    console.log('   - Ensure all variables are loaded in production environment');
    console.log('');
    console.log('4. 📱 App Configuration:');
    console.log('   - Check if your app is running on the correct domain');
    console.log('   - Verify Next.js environment is production');
    console.log('   - Check server logs for webhook requests');

    // Test 4: Simulate Production Webhook
    console.log('\n📊 Test 4: Simulate Production Webhook Event');
    console.log('=====================================');

    try {
      // Create a test webhook event that mimics production
      const productionWebhookEvent = {
        id: `evt_production_test_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_production_test_${Date.now()}`,
            payment_intent: `pi_production_test_${Date.now()}`,
            payment_status: 'paid',
            amount_total: 2500, // $25.00 in cents
            currency: 'usd',
            customer_details: {
              email: 'production-test@example.com'
            },
            metadata: {
              token_amount: '100',
              price_per_token: '0.25',
              payment_reference: `production-test-${Date.now()}`,
              user_wallet_address: '2DAEOSKQGXJKIEWMDENGMEN7PW2LWRW2LDWVHPY4O4DO4CCGLKMFOA2JFI',
              product_type: 'siz_token',
              network: 'algorand'
            }
          }
        }
      };

      console.log('📝 Simulating production webhook event:', {
        eventId: productionWebhookEvent.id,
        eventType: productionWebhookEvent.type,
        sessionId: productionWebhookEvent.data.object.id
      });

      // Record the webhook event
      await paymentDB.recordWebhookEvent(productionWebhookEvent.id, productionWebhookEvent.type);
      console.log('✅ Production webhook event recorded successfully');

      // Process the webhook event (simulate without actual blockchain interaction)
      console.log('🔄 Simulating webhook processing...');
      
      // Update webhook as processed
      await paymentDB.pool.query(`
        UPDATE webhook_events 
        SET processed = TRUE, processed_at = NOW() 
        WHERE stripe_event_id = $1
      `, [productionWebhookEvent.id]);

      console.log('✅ Production webhook event processed successfully');

    } catch (error) {
      console.error('❌ Production webhook simulation failed:', error);
    }

    // Test 5: Final Status Check
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

    // Test 6: Production Troubleshooting Guide
    console.log('\n📊 Test 6: Production Troubleshooting Guide');
    console.log('=====================================');

    console.log('🚨 IF WEBHOOKS STILL NOT WORKING IN PRODUCTION:');
    console.log('');
    console.log('1. 🔍 Check Stripe Webhook Logs:');
    console.log('   - Go to Stripe Dashboard > Webhooks > [Your Endpoint]');
    console.log('   - Check "Recent deliveries" tab');
    console.log('   - Look for failed attempts and error messages');
    console.log('');
    console.log('2. 🌐 Test Endpoint Accessibility:');
    console.log('   - Try: curl -X POST https://yourdomain.com/api/stripe-webhook');
    console.log('   - Check if your domain resolves correctly');
    console.log('   - Verify no firewall/security blocking');
    console.log('');
    console.log('3. 🔧 Check Server Logs:');
    console.log('   - Look for incoming webhook requests');
    console.log('   - Check for any error messages');
    console.log('   - Verify database connection in production');
    console.log('');
    console.log('4. 📱 Verify App Deployment:');
    console.log('   - Ensure latest code is deployed');
    console.log('   - Check if environment variables are loaded');
    console.log('   - Verify database connection string');
    console.log('');
    console.log('5. 🔒 Security Considerations:');
    console.log('   - Check if STRIPE_WEBHOOK_SECRET is correct');
    console.log('   - Verify webhook signature validation');
    console.log('   - Ensure no CORS or security blocking');

    console.log('\n🎉 Production Webhook Debug Completed!');

  } catch (error) {
    console.error('❌ Production webhook debug failed:', error);
  }
}

// Run debug if this script is executed directly
if (require.main === module) {
  debugProductionWebhook()
    .then(() => {
      console.log('\n✅ Production webhook debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Production webhook debug failed:', error);
      process.exit(1);
    });
}

export { debugProductionWebhook };
