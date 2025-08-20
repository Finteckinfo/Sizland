import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { headers } from 'next/headers';

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
    // TODO: Implement token transfer logic
    // This is where you'll integrate with Algorand to transfer tokens
    
    // 1. Verify payment hasn't been processed before (idempotency)
    // 2. Transfer SIZ tokens from central wallet to user wallet
    // 3. Update database with transaction details
    // 4. Send confirmation email to user
    
    console.log('Payment processed successfully:', {
      paymentReference: data.paymentReference,
      tokenAmount: data.tokenAmount,
      userWalletAddress: data.userWalletAddress,
      amount: data.amount,
      currency: data.currency,
    });

    // For now, we'll just log the success
    // In the next phase, we'll implement the actual token transfer
    
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// Handle GET requests (for webhook testing)
export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint is active' });
}
