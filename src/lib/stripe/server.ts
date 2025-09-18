import 'server-only';
import Stripe from 'stripe';

// Check for Stripe secret key with better error messaging
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not set in environment variables');
  console.warn('📝 Please create a .env.local file with your Stripe configuration');
  console.warn('💡 See STRIPE_INTEGRATION.md for setup instructions');
  
  // For development, use a placeholder to prevent build errors
  // In production, this should be properly configured
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔧 Using placeholder key for development build');
  } else {
    throw new Error('STRIPE_SECRET_KEY is required in production environment');
  }
}

// Use placeholder for development if key is missing, otherwise use the actual key
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_development_build';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});
