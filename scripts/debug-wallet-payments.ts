import dotenv from 'dotenv';
import { paymentDB } from '../src/lib/database/payments';

// Load environment variables
dotenv.config();

async function debugWalletPayments(walletAddress: string) {
  console.log('🔍 [DEBUG] Checking wallet payments for:', walletAddress);
  console.log('📅 [DEBUG] Timestamp:', new Date().toISOString());
  
  try {
    // 1. Check ALL payments for this wallet (any status)
    console.log('\n📊 [DEBUG] Step 1: Checking ALL payments for wallet...');
    const allPayments = await paymentDB.getAllPaymentsByWallet(walletAddress);
    console.log(`✅ [DEBUG] Found ${allPayments.length} total payments for wallet`);
    
    if (allPayments.length > 0) {
      console.log('\n📋 [DEBUG] Payment details:');
      allPayments.forEach((payment, index) => {
        console.log(`  Payment ${index + 1}:`, {
          id: payment.id,
          paymentReference: payment.payment_reference,
          status: payment.payment_status,
          tokenTransferStatus: payment.token_transfer_status,
          tokenAmount: payment.token_amount,
          amount: payment.total_amount,
          currency: payment.currency,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at
        });
      });
    }

    // 2. Check webhook events
    console.log('\n📊 [DEBUG] Step 2: Checking webhook events...');
    const webhookEvents = await paymentDB.getRecentWebhookEvents(20);
    console.log(`✅ [DEBUG] Found ${webhookEvents.length} recent webhook events`);
    
    if (webhookEvents.length > 0) {
      console.log('\n📋 [DEBUG] Recent webhook events:');
      webhookEvents.slice(0, 5).forEach((event, index) => {
        console.log(`  Event ${index + 1}:`, {
          id: event.id,
          stripeEventId: event.stripe_event_id,
          eventType: event.event_type,
          processed: event.processed,
          createdAt: event.created_at
        });
      });
    }

    // 3. Check payment statistics
    console.log('\n📊 [DEBUG] Step 3: Checking payment statistics...');
    const stats = await paymentDB.getPaymentStatistics();
    console.log('✅ [DEBUG] Payment statistics:', stats);

    // 4. Check if this wallet has any balance
    console.log('\n📊 [DEBUG] Step 4: Checking wallet balance...');
    try {
      const balance = await paymentDB.getUserWalletBalance(walletAddress);
      console.log('✅ [DEBUG] Wallet balance:', balance);
    } catch (error) {
      console.log('⚠️ [DEBUG] No wallet balance record found (this is normal for new wallets)');
    }

    // 5. Check token inventory
    console.log('\n📊 [DEBUG] Step 5: Checking token inventory...');
    const inventory = await paymentDB.checkTokenInventory(1, 'algorand');
    console.log('✅ [DEBUG] Token inventory:', inventory);

    // 6. Check recent payment transactions
    console.log('\n📊 [DEBUG] Step 6: Checking recent payment transactions...');
    const recentPayments = await paymentDB.getRecentPaymentTransactions(10);
    console.log(`✅ [DEBUG] Found ${recentPayments.length} recent payment transactions`);
    
    if (recentPayments.length > 0) {
      console.log('\n📋 [DEBUG] Recent payment transactions:');
      recentPayments.slice(0, 3).forEach((payment, index) => {
        console.log(`  Payment ${index + 1}:`, {
          id: payment.id,
          paymentReference: payment.payment_reference,
          status: payment.payment_status,
          tokenTransferStatus: payment.token_transfer_status,
          tokenAmount: payment.token_amount,
          walletAddress: payment.user_wallet_address,
          createdAt: payment.created_at
        });
      });
    }

    console.log('\n🎯 [DEBUG] Analysis:');
    if (allPayments.length === 0) {
      console.log('❌ [DEBUG] NO PAYMENTS FOUND for this wallet');
      console.log('   Possible causes:');
      console.log('   1. Stripe webhook not working in production');
      console.log('   2. No successful payments made yet');
      console.log('   3. Database connection issues (but we see DB is working)');
      console.log('   4. Wrong wallet address being used');
    } else {
      console.log('✅ [DEBUG] Payments found but none are "pending"');
      console.log('   Check payment statuses above to see current state');
    }

  } catch (error) {
    console.error('❌ [DEBUG] Error during debug:', error);
  } finally {
    await paymentDB.close();
  }
}

// Get wallet address from command line or use default
const walletAddress = process.argv[2] || 'UHFP5ITGNCR662KU6D6WOIXGA3NVR5DXAYTNTB3UVHGH6EW463TW6TVQWE';

console.log('🚀 [DEBUG] Starting wallet payment debug...');
console.log('🔑 [DEBUG] Environment check:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET (hidden)' : 'MISSING');
console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET (hidden)' : 'MISSING');
console.log('   SIZ_TOKEN_ASSET_ID:', process.env.SIZ_TOKEN_ASSET_ID || 'MISSING');
console.log('   CENTRAL_WALLET_ADDRESS:', process.env.CENTRAL_WALLET_ADDRESS || 'MISSING');

debugWalletPayments(walletAddress)
  .then(() => {
    console.log('\n✅ [DEBUG] Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ [DEBUG] Debug failed:', error);
    process.exit(1);
  });
