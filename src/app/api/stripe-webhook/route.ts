import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { paymentDB } from '@/lib/database/payments';
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';
import algosdk from 'algosdk';

// Force Node.js runtime (stripe-node uses Node crypto). Do NOT use edge.
export const runtime = 'nodejs';
// Ensure no caching and no static optimization
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pin to your chosen API version (update if needed)
  apiVersion: '2025-07-30.basil',
});

// Idempotency guard using existing payment database
async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const existingEvent = await paymentDB.getWebhookEventByStripeId(eventId);
    return existingEvent?.processed || false;
  } catch (error) {
    console.error('Error checking webhook idempotency:', error);
    return false;
  }
}

async function markProcessed(eventId: string): Promise<void> {
  try {
    await paymentDB.recordWebhookEvent(eventId, 'processed');
  } catch (error) {
    console.error('Error marking webhook as processed:', error);
  }
}

// Business logic hooks - integrated with existing payment system
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 [WEBHOOK] Processing checkout.session.completed:', session.id);
  
  try {
    const {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    } = session.metadata || {};

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('❌ [WEBHOOK] Missing required metadata in checkout session:', session.id);
      return;
    }

    // Validate wallet address
    if (!user_wallet_address || !algosdk.isValidAddress(user_wallet_address)) {
      console.error('❌ [WEBHOOK] Invalid Algorand wallet address:', user_wallet_address);
      return;
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.log('⚠️ [WEBHOOK] Checkout session not paid:', session.id);
      return;
    }

    // Process the successful payment using existing logic
    await processSuccessfulPayment({
      sessionId: session.id,
      paymentIntentId: session.payment_intent as string,
      tokenAmount: parseInt(token_amount),
      pricePerToken: parseFloat(price_per_token),
      paymentReference: payment_reference,
      userWalletAddress: user_wallet_address,
      productType: product_type || 'siz_token',
      network: network || 'algorand',
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'usd',
      customerEmail: session.customer_details?.email || undefined,
    });

    console.log('✅ [WEBHOOK] Checkout session processed successfully:', session.id);
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling checkout completion:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  console.log('💳 [WEBHOOK] Processing payment_intent.succeeded:', pi.id);
  
  try {
    const {
      token_amount,
      price_per_token,
      payment_reference,
      user_wallet_address,
      product_type,
      network
    } = pi.metadata || {};

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('❌ [WEBHOOK] Missing required metadata in payment intent:', pi.id);
      return;
    }

    // Check if this payment was already processed by checkout.session.completed
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(payment_reference);
    if (idempotencyCheck.found) {
      console.log('⚠️ [WEBHOOK] Payment already processed, skipping payment_intent.succeeded');
      return;
    }

    // Process the successful payment using existing logic
    await processSuccessfulPayment({
      sessionId: null,
      paymentIntentId: pi.id,
      tokenAmount: parseInt(token_amount),
      pricePerToken: parseFloat(price_per_token),
      paymentReference: payment_reference,
      userWalletAddress: user_wallet_address || '',
      productType: product_type || 'siz_token',
      network: network || 'algorand',
      amount: pi.amount / 100,
      currency: pi.currency,
      customerEmail: pi.receipt_email || undefined,
    });

    console.log('✅ [WEBHOOK] Payment intent processed successfully:', pi.id);
  } catch (error) {
    console.error('❌ [WEBHOOK] Error handling payment intent success:', error);
    throw error;
  }
}

// Payment processing logic - integrated with existing system
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
  console.log('🚀 [WEBHOOK] Processing successful payment:', data.paymentReference);
  console.log('   📊 Payment Details:', {
    tokenAmount: data.tokenAmount,
    pricePerToken: data.pricePerToken,
    userWallet: data.userWalletAddress,
    amount: data.amount,
    currency: data.currency
  });
  
  try {
    // Check idempotency
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'completed') {
      console.log('⚠️ [WEBHOOK] Payment already processed:', data.paymentReference);
      return;
    }

    // Create payment transaction record
    console.log('📝 [WEBHOOK] Creating payment transaction record...');
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
    console.log('✅ [WEBHOOK] Payment transaction created with ID:', paymentTransaction.id);

    // Check token inventory and reserve tokens
    console.log('🔍 [WEBHOOK] Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount, data.network);
    if (!inventoryCheck.available) {
      console.error('❌ [WEBHOOK] Insufficient token inventory for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }
    console.log('✅ [WEBHOOK] Token inventory available:', inventoryCheck);

    // Reserve tokens for this transaction
    console.log('🔒 [WEBHOOK] Reserving tokens...');
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);
    console.log('✅ [WEBHOOK] Tokens reserved successfully');

    // Transfer SIZ tokens using existing service
    console.log('🚀 [WEBHOOK] Starting token transfer for payment:', data.paymentReference);
    console.log('   📍 Transfer Details:', {
      receiver: data.userWalletAddress,
      amount: data.tokenAmount,
      paymentId: paymentTransaction.id,
      assetId: process.env.SIZ_TOKEN_ASSET_ID
    });
    
    const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
      receiverAddress: data.userWalletAddress,
      amount: data.tokenAmount,
      paymentId: paymentTransaction.id,
    });
    
    console.log('📊 [WEBHOOK] Transfer result received:', {
      success: transferResult.success,
      txId: transferResult.txId,
      transferMethod: transferResult.transferMethod,
      requiresUserAction: transferResult.requiresUserAction,
      actionRequired: transferResult.actionRequired,
      error: transferResult.error,
      fullResult: JSON.stringify(transferResult, null, 2)
    });

    if (transferResult.success && transferResult.txId) {
      // Determine transfer status based on method
      let transferStatus: string;
      let paymentStatus: string;
      
      console.log('🔍 [WEBHOOK] Processing successful transfer result...');
      console.log('   Transfer Method:', transferResult.transferMethod);
      console.log('   Transaction ID:', transferResult.txId);
      
      if (transferResult.transferMethod === 'direct_transfer') {
        transferStatus = 'direct_transferred';
        paymentStatus = 'completed';
        console.log('✅ [WEBHOOK] Direct transfer completed');
      } else {
        transferStatus = 'in_inbox';
        paymentStatus = 'paid';
        console.log('📬 [WEBHOOK] Tokens sent to inbox (ARC-0059)');
      }

      // Update database with successful transfer
      console.log('💾 [WEBHOOK] Updating database with transfer status:', transferStatus);
      await paymentDB.updateTokenTransferStatus(paymentTransaction.id, transferStatus, transferResult.txId);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, paymentStatus, 'Payment processed successfully');

      // Update user wallet balance
      console.log('💰 [WEBHOOK] Updating user wallet balance...');
      await paymentDB.updateUserWalletBalance(data.userWalletAddress, data.tokenAmount, 'credit');

      // Record token transfer
      console.log('📋 [WEBHOOK] Recording token transfer...');
      await paymentDB.recordTokenTransfer({
        payment_transaction_id: paymentTransaction.id,
        from_address: process.env.CENTRAL_WALLET_ADDRESS!,
        to_address: data.userWalletAddress,
        asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
        amount: data.tokenAmount,
        transaction_id: transferResult.txId,
        status: transferStatus,
      });

      console.log('✅ [WEBHOOK] Payment processing completed successfully:', data.paymentReference);
      console.log('   Final Status:', { paymentStatus, transferStatus, txId: transferResult.txId });
    } else {
      // Handle transfer failure
      console.error('❌ [WEBHOOK] Token transfer failed:', {
        paymentReference: data.paymentReference,
        error: transferResult.error,
        success: transferResult.success,
        txId: transferResult.txId,
        fullResult: JSON.stringify(transferResult, null, 2)
      });
      
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferResult.error
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Token transfer failed: ${transferResult.error}`);
      
      // Release reserved tokens
      console.log('🔓 [WEBHOOK] Releasing reserved tokens due to transfer failure...');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing payment:', error);
    console.error('   Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference: data.paymentReference
    });
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  // IMPORTANT: use raw body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('❌ [WEBHOOK] Signature verification failed:', err.message);
    return new NextResponse(
      `Webhook signature verification failed. ${err.message ?? ''}`,
      { status: 400 }
    );
  }

  console.log('🔔 [WEBHOOK] Received event:', event.type, event.id);

  // Idempotency guard for Stripe retries
  if (await alreadyProcessed(event.id)) {
    console.log('⚠️ [WEBHOOK] Event already processed, skipping:', event.id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(pi);
        break;
      }
      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.type}`);
        break;
    }

    await markProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('❌ [WEBHOOK] Handler error:', err.message);
    // Return 500 so Stripe will retry per its exponential backoff
    return NextResponse.json({ error: 'Handler error', detail: err?.message }, { status: 500 });
  }
}

// Block non-POST methods
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
