import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';
import { paymentDB } from '@/lib/database/payments';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('🔔 Stripe webhook received:', {
    timestamp: new Date().toISOString(),
    signature: signature ? 'Present' : 'Missing',
    bodyLength: body.length
  });

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    console.log('✅ Webhook signature verified:', {
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // Record webhook event for audit trail
    await paymentDB.recordWebhookEvent(event.id, event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🛒 Processing checkout.session.completed event');
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        console.log('💳 Processing payment_intent.succeeded event');
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('❌ Processing payment_intent.payment_failed event');
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'checkout.session.expired':
        console.log('⏰ Processing checkout.session.expired event');
        await handleCheckoutSessionExpired(event.data.object);
        break;
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully:', {
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', {
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Processing completed checkout session:', session.id);
  
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

    // Validate required metadata
    if (!token_amount || !price_per_token || !payment_reference) {
      console.error('Missing required metadata in checkout session:', session.id);
      return;
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.log('Checkout session not paid:', session.id);
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
    console.error('Error handling checkout session completion:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Processing successful payment intent:', paymentIntent.id);
  
  try {
    // Extract metadata
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
      console.error('Missing required metadata in payment intent:', paymentIntent.id);
      return;
    }

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
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      customerEmail: paymentIntent.receipt_email,
    });

  } catch (error) {
    console.error('Error handling payment intent success:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Processing failed payment intent:', paymentIntent.id);
  
  try {
    // Log the failure for monitoring
    console.error('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    // Here you could implement:
    // - Send failure notification to user
    // - Update order status
    // - Trigger retry logic
    // - Log to monitoring system

  } catch (error) {
    console.error('Error handling payment intent failure:', error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: any) {
  console.log('Processing expired checkout session:', session.id);
  
  try {
    // Log the expiration for monitoring
    console.log('Checkout session expired:', {
      sessionId: session.id,
      expiresAt: session.expires_at,
      createdAt: session.created,
    });

    // Here you could implement:
    // - Clean up expired sessions
    // - Send reminder emails
    // - Update inventory if needed

  } catch (error) {
    console.error('Error handling checkout session expiration:', error);
    throw error;
  }
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
  console.log('🚀 Processing successful payment:', {
    paymentReference: data.paymentReference,
    tokenAmount: data.tokenAmount,
    userWalletAddress: data.userWalletAddress,
    amount: data.amount,
    currency: data.currency,
    timestamp: new Date().toISOString()
  });
  
  try {
    // 1. Check idempotency - verify payment hasn't been processed before
    console.log('🔍 Step 1: Checking payment idempotency...');
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    console.log('📊 Idempotency check result:', idempotencyCheck);
    
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'completed') {
      console.log('⚠️ Payment already processed:', data.paymentReference);
      return;
    }

    // 2. Create or update payment transaction record
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

    // 3. Validate user wallet address
    console.log('🔍 Step 3: Validating user wallet address...');
    if (!data.userWalletAddress) {
      console.error('❌ No user wallet address provided for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'No wallet address provided');
      return;
    }
    
    console.log('✅ User wallet address validated:', data.userWalletAddress);

    // 4. Check token inventory and reserve tokens
    console.log('🔍 Step 4: Checking token inventory...');
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount, data.network || 'algorand');
    console.log('📊 Inventory check result:', inventoryCheck);
    
    if (!inventoryCheck.available) {
      console.error('❌ Insufficient token inventory for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }

    // Reserve tokens for this transaction
    console.log('🔒 Reserving tokens for transaction...');
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);
    console.log('✅ Tokens reserved successfully');

    try {
      // 5. Transfer SIZ tokens from central wallet to user wallet
      console.log('🚀 Step 5: Initiating SIZ token transfer...');
      console.log('📋 Transfer details:', {
        to: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      // Use the new hybrid transfer approach: try direct first, fallback to ARC-0059
      const transferResult = await sizTokenTransferService.transferSizTokensHybrid({
        receiverAddress: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      console.log('📊 Transfer result:', transferResult);

      if (transferResult.success && transferResult.txId) {
        // 6. Update database with successful transfer
        console.log('✅ Step 6: Updating database with successful transfer...');
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'completed',
          transferResult.txId
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'paid', 'Tokens transferred successfully');
        
        // 7. Update user wallet balance
        console.log('💰 Step 7: Updating user wallet balance...');
        await paymentDB.updateUserWalletBalance(
          data.userWalletAddress,
          data.tokenAmount,
          'credit'
        );

        console.log('🎉 SIZ token transfer completed successfully:', {
          paymentReference: data.paymentReference,
          txId: transferResult.txId,
          tokenAmount: data.tokenAmount,
          userWalletAddress: data.userWalletAddress,
          timestamp: new Date().toISOString()
        });

        // 8. Record successful token transfer
        console.log('📝 Step 8: Recording token transfer...');
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: data.userWalletAddress,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: data.tokenAmount,
          transaction_id: transferResult.txId,
          status: 'completed',
        });
        
        console.log('✅ Token transfer recorded successfully');

      } else {
        // Transfer failed
        console.error('❌ SIZ token transfer failed:', transferResult.error);
        
        // Check if this is an opt-in issue
        if (transferResult.requiresOptIn) {
          console.log('⚠️ Transfer failed due to opt-in requirement:', {
            paymentReference: data.paymentReference,
            userWalletAddress: data.userWalletAddress,
            optInInstructions: transferResult.optInInstructions,
          });
          
          // Update status to indicate opt-in is required
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'pending',
            undefined,
            'User wallet not opted into SIZ token'
          );
          await paymentDB.updatePaymentStatus(
            paymentTransaction.id, 
            'processing', 
            'Payment successful but wallet not opted into SIZ token. User must opt-in to receive tokens.'
          );
          
          console.log('📝 Payment status updated to pending_opt_in');
          
        } else {
          // Other transfer failure
          console.error('❌ Other transfer failure, updating status...');
          await paymentDB.updateTokenTransferStatus(
            paymentTransaction.id,
            'failed',
            undefined,
            transferResult.error
          );
          await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Token transfer failed: ${transferResult.error}`);
          
          // Release reserved tokens
          console.log('🔓 Releasing reserved tokens...');
          await paymentDB.releaseReservedTokens(paymentTransaction.id);
          console.log('✅ Reserved tokens released');
        }
      }

    } catch (transferError) {
      console.error('❌ Error during token transfer:', {
        error: transferError instanceof Error ? transferError.message : String(transferError),
        stack: transferError instanceof Error ? transferError.stack : undefined,
        paymentId: paymentTransaction.id,
        timestamp: new Date().toISOString()
      });
      
      // Update database with failure
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'Unknown transfer error'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Token transfer error occurred');
      
      // Release reserved tokens
      console.log('🔓 Releasing reserved tokens due to transfer error...');
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
      console.log('✅ Reserved tokens released');
      
      throw transferError;
    }

  } catch (error) {
    console.error('❌ Error processing payment:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      paymentReference: data.paymentReference,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Handle GET requests (for webhook testing)
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint is active' });
}
