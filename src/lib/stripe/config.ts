// Note: Do NOT import Stripe SDK here.
// This module is shared by client and server for pricing utilities only.
// Server-only Stripe initialization lives in `src/lib/stripe/server.ts`.
// SIZ Token Pricing Configuration
export const SIZ_TOKEN_PRICING = {
  BASE_PRICE_PER_TOKEN: 0.25, // $0.25 USD per SIZ token
  PRICE_INCREMENT: 0.00, // No price increase - flat rate
  TOKEN_INCREMENT: 1, // No increment needed for flat pricing
  MIN_PURCHASE: 1, // Minimum 1 SIZ token
  MAX_PURCHASE: 10000, // Maximum 10,000 SIZ tokens per transaction
  PROCESSING_FEE_PERCENTAGE: 0.029, // 2.9% Stripe processing fee
  PROCESSING_FEE_FIXED: 0.30, // $0.30 fixed fee
} as const;

// Stripe Product Configuration
export const STRIPE_PRODUCT_CONFIG = {
  PRODUCT_NAME: 'SIZ Token',
  PRODUCT_DESCRIPTION: 'SIZ Token - Learn. Earn. Invest. Grow.',
  CURRENCY: 'usd',
  PAYMENT_METHOD_TYPES: ['card'] as const,
  MODE: 'payment' as const,
} as const;

// Calculate token price based on quantity
export function calculateTokenPrice(tokenAmount: number): {
  pricePerToken: number;
  subtotal: number;
  processingFee: number;
  total: number;
} {
  if (tokenAmount < SIZ_TOKEN_PRICING.MIN_PURCHASE || tokenAmount > SIZ_TOKEN_PRICING.MAX_PURCHASE) {
    throw new Error(`Token amount must be between ${SIZ_TOKEN_PRICING.MIN_PURCHASE} and ${SIZ_TOKEN_PRICING.MAX_PURCHASE}`);
  }

  // Calculate price per token with increment
  const priceIncrements = Math.floor(tokenAmount / SIZ_TOKEN_PRICING.TOKEN_INCREMENT);
  const pricePerToken = SIZ_TOKEN_PRICING.BASE_PRICE_PER_TOKEN + (priceIncrements * SIZ_TOKEN_PRICING.PRICE_INCREMENT);
  
  const subtotal = tokenAmount * pricePerToken;
  const processingFee = (subtotal * SIZ_TOKEN_PRICING.PROCESSING_FEE_PERCENTAGE) + SIZ_TOKEN_PRICING.PROCESSING_FEE_FIXED;
  const total = subtotal + processingFee;

  return {
    pricePerToken: Number(pricePerToken.toFixed(4)),
    subtotal: Number(subtotal.toFixed(2)),
    processingFee: Number(processingFee.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// Validate token amount
export function validateTokenAmount(amount: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { isValid: false, error: 'Token amount must be a positive integer' };
  }
  
  if (amount < SIZ_TOKEN_PRICING.MIN_PURCHASE) {
    return { isValid: false, error: `Minimum purchase is ${SIZ_TOKEN_PRICING.MIN_PURCHASE} SIZ token` };
  }
  
  if (amount > SIZ_TOKEN_PRICING.MAX_PURCHASE) {
    return { isValid: false, error: `Maximum purchase is ${SIZ_TOKEN_PRICING.MAX_PURCHASE} SIZ tokens` };
  }
  
  return { isValid: true };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Generate unique payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `siz_${timestamp}_${random}`.toUpperCase();
}
