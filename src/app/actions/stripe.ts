'use server';

import { calculateTokenPrice, validateTokenAmount, generatePaymentReference } from '@/lib/stripe/config';
import { stripe } from '@/lib/stripe/server';

export interface CreateCheckoutSessionData {
  tokenAmount: number;
  userEmail?: string;
  userWalletAddress?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
  try {
    const { tokenAmount, userEmail, userWalletAddress, successUrl, cancelUrl } = data;

    // Validate token amount
    const validation = validateTokenAmount(tokenAmount);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid token amount',
      };
    }

    // Calculate pricing
    const pricing = calculateTokenPrice(tokenAmount);
    const paymentReference = generatePaymentReference();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenAmount} SIZ Tokens`,
              description: `Purchase ${tokenAmount} SIZ tokens at $${pricing.pricePerToken.toFixed(4)} per token`,
              images: ['https://siz.land/logo1.png'], // Your logo URL
              metadata: {
                token_amount: tokenAmount.toString(),
                price_per_token: pricing.pricePerToken.toString(),
                payment_reference: paymentReference,
              },
            },
            unit_amount: Math.round(pricing.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wallet?canceled=true`,
      customer_email: userEmail,
      metadata: {
        token_amount: tokenAmount.toString(),
        price_per_token: pricing.pricePerToken.toString(),
        subtotal: pricing.subtotal.toString(),
        processing_fee: pricing.processingFee.toString(),
        total: pricing.total.toString(),
        payment_reference: paymentReference,
        user_wallet_address: userWalletAddress || '',
        product_type: 'siz_token',
        network: 'algorand',
      },
      payment_intent_data: {
        metadata: {
          token_amount: tokenAmount.toString(),
          price_per_token: pricing.pricePerToken.toString(),
          payment_reference: paymentReference,
          user_wallet_address: userWalletAddress || '',
          product_type: 'siz_token',
          network: 'algorand',
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    return {
      success: true,
      sessionId: session.id,
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create checkout session',
    };
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      success: true,
      session,
    };
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return {
      success: false,
      error: 'Failed to retrieve checkout session',
    };
  }
}

export async function createPaymentIntent(data: CreateCheckoutSessionData) {
  try {
    const { tokenAmount, userEmail, userWalletAddress } = data;

    // Validate token amount
    const validation = validateTokenAmount(tokenAmount);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid token amount',
      };
    }

    // Calculate pricing
    const pricing = calculateTokenPrice(tokenAmount);
    const paymentReference = generatePaymentReference();

    // Create payment intent for custom checkout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.total * 100), // Convert to cents
      currency: 'usd',
      // Attach an email to the payment intent for receipts
      receipt_email: userEmail,
      metadata: {
        token_amount: tokenAmount.toString(),
        price_per_token: pricing.pricePerToken.toString(),
        subtotal: pricing.subtotal.toString(),
        processing_fee: pricing.processingFee.toString(),
        total: pricing.total.toString(),
        payment_reference: paymentReference,
        user_wallet_address: userWalletAddress || '',
        product_type: 'siz_token',
        network: 'algorand',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create payment intent',
    };
  }
}
