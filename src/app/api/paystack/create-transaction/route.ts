import { NextRequest, NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack/server';
import { calculateTokenPrice, validateTokenAmount, generatePaymentReference, convertUSDToCurrency } from '@/lib/paystack/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenAmount, userEmail, userWalletAddress, successUrl, cancelUrl, currency = 'USD' } = body as {
      tokenAmount: number;
      userEmail?: string;
      userWalletAddress?: string;
      successUrl?: string;
      cancelUrl?: string;
      currency?: string;
    };

    const validation = validateTokenAmount(tokenAmount);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error || 'Invalid token amount' }, { status: 400 });
    }

    const pricing = calculateTokenPrice(tokenAmount);
    const paymentReference = generatePaymentReference();

    // Convert USD to target currency and get amount in smallest unit
    let amountInSmallestUnit: number;
    switch (currency.toUpperCase()) {
      case 'NGN':
        amountInSmallestUnit = convertUSDToCurrency(pricing.total, 'NGN') * 100; // Convert to kobo
        break;
      case 'KES':
        amountInSmallestUnit = convertUSDToCurrency(pricing.total, 'KES') * 100; // Convert to cents
        break;
      case 'USD':
        amountInSmallestUnit = Math.round(pricing.total * 100); // Convert to cents
        break;
      default:
        amountInSmallestUnit = Math.round(pricing.total * 100); // Default to cents
        break;
    }

    const transactionResult = await paystack.initializeTransaction({
      email: userEmail || '',
      amount: amountInSmallestUnit,
      currency: currency,
      reference: paymentReference,
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
        currency: currency,
      },
      callback_url: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/wallet?success=true&reference=${paymentReference}`,
    });

    if (!transactionResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: transactionResult.error || 'Failed to create transaction' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      authorizationUrl: transactionResult.data.data.authorization_url,
      reference: paymentReference,
      amount: amountInSmallestUnit,
      currency: currency,
    });
  } catch (error) {
    console.error('Error creating Paystack transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create transaction' 
    }, { status: 500 });
  }
}
