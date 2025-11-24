import 'server-only';
import Stripe from 'stripe';

// Use placeholder if key is missing to allow build to proceed
// The actual check will happen at runtime when API is called
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build_process';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not set in environment variables');
  console.warn('📝 This is fine for build, but API calls will fail at runtime');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});
