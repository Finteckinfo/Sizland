import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { calculateTokenPrice, validateTokenAmount, generatePaymentReference } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAmount, userEmail, userWalletAddress, successUrl, cancelUrl } = body as {
      tokenAmount: number;
      userEmail?: string;
      userWalletAddress?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const validation = validateTokenAmount(tokenAmount);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error || 'Invalid token amount' }, { status: 400 });
    }

    const pricing = calculateTokenPrice(tokenAmount);
    const paymentReference = generatePaymentReference();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenAmount} SIZ Tokens`,
              description: `Purchase ${tokenAmount} SIZ tokens at $${pricing.pricePerToken.toFixed(4)} per token`,
              images: ['https://siz.land/logo1.png'],
              metadata: {
                token_amount: tokenAmount.toString(),
                price_per_token: pricing.pricePerToken.toString(),
                payment_reference: paymentReference,
              },
            },
            unit_amount: Math.round(pricing.total * 100),
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
        receipt_email: userEmail,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ success: false, error: 'Failed to create checkout session' }, { status: 500 });
  }
}
