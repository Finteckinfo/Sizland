import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';
import { paymentDB } from '@/scripts/db-payments';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
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
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
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
  console.log('Processing successful payment:', data.paymentReference);
  
  try {
    // 1. Check idempotency - verify payment hasn't been processed before
    const idempotencyCheck = await paymentDB.checkPaymentIdempotency(data.paymentReference);
    if (idempotencyCheck.found && idempotencyCheck.current_status === 'completed') {
      console.log('Payment already processed:', data.paymentReference);
      return;
    }

    // 2. Create or update payment transaction record
    const paymentTransaction = await paymentDB.createPaymentTransaction({
      payment_reference: data.paymentReference,
      stripe_payment_intent_id: data.paymentIntentId,
      stripe_session_id: data.sessionId,
      amount: data.amount,
      currency: data.currency,
      token_amount: data.tokenAmount,
      price_per_token: data.pricePerToken,
      user_wallet_address: data.userWalletAddress,
      customer_email: data.customerEmail,
      payment_status: 'pending_token_transfer',
      token_transfer_status: 'pending',
    });

    // 3. Validate user wallet address
    if (!data.userWalletAddress) {
      console.error('No user wallet address provided for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'No wallet address provided');
      return;
    }

    // 4. Check token inventory and reserve tokens
    const inventoryCheck = await paymentDB.checkTokenInventory(data.tokenAmount);
    if (!inventoryCheck.available) {
      console.error('Insufficient token inventory for payment:', data.paymentReference);
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Insufficient token inventory');
      return;
    }

    // Reserve tokens for this transaction
    await paymentDB.reserveTokens(data.tokenAmount, paymentTransaction.id);

    try {
      // 5. Transfer SIZ tokens from central wallet to user wallet
      console.log('Initiating SIZ token transfer:', {
        to: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      const transferResult = await sizTokenTransferService.transferSizTokens({
        receiverAddress: data.userWalletAddress,
        amount: data.tokenAmount,
        paymentId: paymentTransaction.id,
      });

      if (transferResult.success && transferResult.txId) {
        // 6. Update database with successful transfer
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'completed',
          transferResult.txId
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'completed', 'Tokens transferred successfully');
        
        // 7. Update user wallet balance
        await paymentDB.updateUserWalletBalance(
          data.userWalletAddress,
          data.tokenAmount,
          'credit'
        );

        console.log('SIZ token transfer completed successfully:', {
          paymentReference: data.paymentReference,
          txId: transferResult.txId,
          tokenAmount: data.tokenAmount,
          userWalletAddress: data.userWalletAddress,
        });

        // 8. Record successful token transfer
        await paymentDB.recordTokenTransfer({
          payment_transaction_id: paymentTransaction.id,
          from_address: process.env.CENTRAL_WALLET_ADDRESS!,
          to_address: data.userWalletAddress,
          asset_id: process.env.SIZ_TOKEN_ASSET_ID!,
          amount: data.tokenAmount,
          transaction_id: transferResult.txId,
          status: 'completed',
        });

      } else {
        // Transfer failed
        console.error('SIZ token transfer failed:', transferResult.error);
        await paymentDB.updateTokenTransferStatus(
          paymentTransaction.id,
          'failed',
          undefined,
          transferResult.error
        );
        await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', `Token transfer failed: ${transferResult.error}`);
        
        // Release reserved tokens
        await paymentDB.releaseReservedTokens(paymentTransaction.id);
      }

    } catch (transferError) {
      console.error('Error during token transfer:', transferError);
      
      // Update database with failure
      await paymentDB.updateTokenTransferStatus(
        paymentTransaction.id,
        'failed',
        undefined,
        transferError instanceof Error ? transferError.message : 'Unknown transfer error'
      );
      await paymentDB.updatePaymentStatus(paymentTransaction.id, 'failed', 'Token transfer error occurred');
      
      // Release reserved tokens
      await paymentDB.releaseReservedTokens(paymentTransaction.id);
      
      throw transferError;
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// Handle GET requests (for webhook testing)
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint is active' });
}
