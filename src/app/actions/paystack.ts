'use server';

import { calculateTokenPrice, validateTokenAmount, generatePaymentReference, convertUSDToCurrency } from '@/lib/paystack/config';
import { paystack } from '@/lib/paystack/server';

export interface CreateTransactionData {
  tokenAmount: number;
  userEmail?: string;
  userWalletAddress?: string;
  successUrl?: string;
  cancelUrl?: string;
  currency?: string;
}

export interface TransactionResponse {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}

export async function createTransaction(data: CreateTransactionData): Promise<TransactionResponse> {
  try {
    const { tokenAmount, userEmail, userWalletAddress, successUrl, cancelUrl, currency = 'USD' } = data;

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

    // Create Paystack transaction
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
      return {
        success: false,
        error: transactionResult.error || 'Failed to create transaction',
      };
    }

    return {
      success: true,
      authorizationUrl: transactionResult.data.data.authorization_url,
      reference: paymentReference,
    };

  } catch (error) {
    console.error('Error creating Paystack transaction:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Failed to create transaction',
    };
  }
}

export async function verifyTransaction(reference: string) {
  try {
    const result = await paystack.verifyTransaction(reference);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to verify transaction',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    return {
      success: false,
      error: 'Failed to verify transaction',
    };
  }
}

export async function getTransaction(transactionId: string) {
  try {
    const result = await paystack.getTransaction(transactionId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to get transaction',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error getting Paystack transaction:', error);
    return {
      success: false,
      error: 'Failed to get transaction',
    };
  }
}

export async function createCustomer(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const result = await paystack.createCustomer(data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to create customer',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error creating Paystack customer:', error);
    return {
      success: false,
      error: 'Failed to create customer',
    };
  }
}
