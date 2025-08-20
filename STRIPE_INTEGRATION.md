# 🚀 SIZ Token Stripe Integration

This document provides comprehensive information about the Stripe integration for purchasing SIZ tokens in the Sizland application.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Stripe integration enables users to purchase SIZ tokens using credit cards, debit cards, and bank transfers. The system provides:

- **Secure Payment Processing**: Powered by Stripe's industry-leading security
- **Real-time Pricing**: Dynamic token pricing based on quantity
- **Professional Checkout**: Seamless user experience with Stripe Checkout
- **Webhook Processing**: Automated payment confirmation and token transfer
- **Database Tracking**: Complete audit trail of all transactions
- **Idempotency**: Prevents duplicate payments and processing

## 🏗️ Architecture

### Components

1. **Token Purchase Form** (`src/components/ui/token-purchase-form.tsx`)
   - User interface for selecting token amount and email
   - Real-time pricing calculation
   - Stripe checkout integration

2. **Server Actions** (`src/app/actions/stripe.ts`)
   - Secure checkout session creation
   - Payment intent management
   - Server-side validation

3. **Webhook Handler** (`src/app/api/stripe-webhook/route.ts`)
   - Processes Stripe webhook events
   - Handles payment confirmations
   - Triggers token transfer process

4. **Configuration** (`src/lib/stripe/config.ts`)
   - Stripe client setup
   - Pricing configuration
   - Utility functions

5. **Database Integration** (`src/lib/database/payments.ts`)
   - Payment transaction tracking
   - Token inventory management
   - User balance updates

### Data Flow

```
User Input → Validation → Stripe Checkout → Payment Processing → Webhook → Token Transfer → Database Update
```

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js pg @types/pg --legacy-peer-deps
```

### 2. Environment Configuration (Cloud Database Ready)

Create a `.env.local` file with the following variables (for cloud databases, use `DATABASE_URL`):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Database Configuration (Cloud DB)
# Prefer a single DATABASE_URL from your cloud provider (Supabase/Neon/Railway/Render/Heroku)
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
# If your provider enforces SSL (most do), leave DB_SSL empty. Set DB_SSL=disable only if you know SSL is not required
DB_SSL=

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Algorand Configuration
ALGORAND_NETWORK=testnet
ALGORAND_MAINNET_ALGOD_URL=https://mainnet-api.algonode.cloud
ALGORAND_TESTNET_ALGOD_URL=https://testnet-api.algonode.cloud
ALGORAND_MAINNET_INDEXER_URL=https://mainnet-idx.algonode.cloud
ALGORAND_TESTNET_INDEXER_URL=https://testnet-idx.algonode.cloud

# SIZ Token Configuration
SIZ_TOKEN_ASSET_ID_MAINNET=your_mainnet_asset_id
SIZ_TOKEN_ASSET_ID_TESTNET=your_testnet_asset_id
CENTRAL_WALLET_ADDRESS=your_central_wallet_address
CENTRAL_WALLET_PRIVATE_KEY=your_central_wallet_private_key
```

### 3. Stripe Dashboard Setup

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: Navigate to Developers → API Keys
3. **Configure Webhooks**: Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. **Get Webhook Secret**: Copy the signing secret from webhook details

### 4. Database Setup (Cloud or Local)

1. If using a cloud provider (Supabase/Neon/Railway/Render/Heroku):
   - Create a new PostgreSQL database
   - Copy the `DATABASE_URL` from your provider
   - Ensure SSL is enabled on the instance (default)
2. If using local PostgreSQL:
   - Install from [postgresql.org](https://postgresql.org)
   - Create DB: `CREATE DATABASE sizland;`
3. Run the schema against your DB connection

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

## 🔧 Configuration

### Pricing Configuration

The token pricing is configured in `src/lib/stripe/config.ts`:

```typescript
export const SIZ_TOKEN_PRICING = {
  BASE_PRICE_PER_TOKEN: 0.25,        // $0.25 USD per SIZ token
  PRICE_INCREMENT: 0.00,             // No price increase - flat rate
  TOKEN_INCREMENT: 1,                 // No increment needed for flat pricing
  MIN_PURCHASE: 1,                   // Minimum 1 SIZ token
  MAX_PURCHASE: 10000,               // Maximum 10,000 SIZ tokens
  PROCESSING_FEE_PERCENTAGE: 0.029,  // 2.9% Stripe processing fee
  PROCESSING_FEE_FIXED: 0.30,        // $0.30 fixed fee
};
```

### Network Configuration

Configure Algorand networks in your environment:

```env
ALGORAND_NETWORK=testnet  # or mainnet
ALGORAND_TESTNET_ALGOD_URL=https://testnet-api.algonode.cloud
ALGORAND_MAINNET_ALGOD_URL=https://mainnet-api.algonode.cloud
```

## 🚀 Usage

### Basic Token Purchase

1. **User connects wallet** using the existing wallet integration
2. **User enters email** and selects token amount
3. **System calculates pricing** based on quantity
4. **User clicks "Buy"** to initiate Stripe checkout
5. **Stripe redirects** to secure payment page
6. **Payment processed** and webhook received
7. **Tokens transferred** to user's Algorand wallet

### Integration in Components

```tsx
import { TokenPurchaseForm } from '@/components/ui/token-purchase-form';

// Use in your component
<TokenPurchaseForm className="custom-styles" />
```

### Server Actions

```typescript
import { createCheckoutSession } from '@/app/actions/stripe';

const result = await createCheckoutSession({
  tokenAmount: 100,
  userEmail: 'user@example.com',
  userWalletAddress: 'ALGO_ADDRESS',
});
```

## 🗄️ Database Schema

### Core Tables

- **`payment_transactions`**: Tracks all payment attempts and statuses
- **`webhook_events`**: Audit trail of Stripe webhook events
- **`token_inventory`**: Central wallet token supply management
- **`user_wallet_balances`**: User token balance tracking
- **`token_transfers`**: History of all token transfers

### Key Relationships

- Each payment transaction can have multiple webhook events
- Token transfers are linked to payment transactions
- User balances are updated based on successful transfers

## 🔒 Security Features

### Payment Security

- **Stripe Security**: Industry-standard encryption and fraud protection
- **Webhook Verification**: Cryptographic signature validation
- **Idempotency**: Prevents duplicate payment processing
- **Input Validation**: Server-side validation of all inputs

### Data Protection

- **Encrypted Storage**: Sensitive data encrypted at rest
- **Access Control**: Database access restricted to application
- **Audit Logging**: Complete transaction history tracking
- **Error Handling**: Secure error messages without data leakage

## 🧪 Testing

### Local Testing

1. **Stripe Test Mode**: Use test API keys for development
2. **Test Cards**: Use Stripe's test card numbers
3. **Webhook Testing**: Use Stripe CLI for local webhook testing

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🚀 Deployment

### Production Checklist

- [ ] Update environment variables with production values
- [ ] Configure production database
- [ ] Set up Stripe webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Monitor webhook delivery
- [ ] Set up error monitoring

### Environment Variables

```env
# Production
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs for errors

2. **Payment Processing Failed**
   - Verify Stripe API keys
   - Check payment method configuration
   - Review error logs

3. **Token Transfer Issues**
   - Verify Algorand network configuration
   - Check central wallet balance
   - Review transaction logs

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=stripe:*
NODE_ENV=development
```

### Support

For technical support:
- Check Stripe documentation: [stripe.com/docs](https://stripe.com/docs)
- Review application logs
- Contact development team

## 🔮 Future Enhancements

### Planned Features

- **Subscription Payments**: Recurring token purchases
- **Bulk Discounts**: Volume-based pricing tiers
- **Multi-Currency**: Support for EUR, GBP, etc.
- **Advanced Analytics**: Payment and transfer analytics
- **Mobile Optimization**: Enhanced mobile checkout experience

### Integration Opportunities

- **Email Notifications**: Purchase confirmations and receipts
- **SMS Alerts**: Payment status notifications
- **Analytics Dashboard**: Real-time payment metrics
- **Admin Panel**: Payment management interface

---

## 📞 Support

For questions or issues with the Stripe integration:

1. Check this documentation first
2. Review the code comments and types
3. Check Stripe's official documentation
4. Contact the development team

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Next.js 15+, Stripe API 2024-12-18.acacia
