# 🚀 SIZ Token Paystack Integration

This document provides comprehensive information about the Paystack integration for purchasing SIZ tokens in the Sizland application.

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

The Paystack integration enables users to purchase SIZ tokens using various payment methods including cards, bank transfers, USSD, QR codes, and mobile money. The system provides:

- **Secure Payment Processing**: Powered by Paystack's industry-leading security
- **Real-time Pricing**: Dynamic token pricing based on quantity
- **Professional Checkout**: Seamless user experience with Paystack Checkout
- **Webhook Processing**: Automated payment confirmation and token transfer
- **Database Tracking**: Complete audit trail of all transactions
- **Idempotency**: Prevents duplicate payments and processing

## 🏗️ Architecture

### Components

1. **Token Purchase Form** (`src/components/ui/token-purchase-form.tsx`)
   - User interface for selecting token amount and email
   - Real-time pricing calculation
   - Paystack payment integration
   - Wallet readiness validation before purchase

2. **Wallet Readiness Check** (`src/components/ui/wallet-readiness-check.tsx`)
   - Verifies wallet can receive SIZ tokens
   - Checks opt-in status and ALGO balance
   - Provides clear setup instructions

3. **Opt-In Instructions** (`src/components/ui/opt-in-instructions.tsx`)
   - Step-by-step guide for wallet configuration
   - Wallet-specific instructions (Pera, MyAlgo, etc.)
   - Asset verification and copy functionality

4. **Server Actions** (`src/app/actions/paystack.ts`)
   - Secure transaction creation
   - Payment verification
   - Server-side validation

5. **Webhook Handler** (`src/app/api/paystack-webhook/route.ts`)
   - Processes Paystack webhook events
   - Handles payment confirmations
   - Triggers token transfer process

6. **Configuration** (`src/lib/paystack/config.ts`)
   - Paystack client setup
   - Pricing configuration
   - Utility functions

7. **Database Integration** (`src/lib/database/payments.ts`)
   - Payment transaction tracking
   - Token inventory management
   - User balance updates

### Data Flow

```
User Input → Validation → Paystack Payment → Webhook → Token Transfer → Database Update
```

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install axios --legacy-peer-deps
```

### 2. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
PAYSTACK_BASE_URL=https://api.paystack.co

# Database Configuration (Cloud DB)
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
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

### 3. Paystack Dashboard Setup

1. **Create Paystack Account**: Sign up at [paystack.com](https://paystack.com)
2. **Get API Keys**: Navigate to Settings → API Keys & Webhooks
3. **Configure Webhooks**: Go to Settings → Webhooks
   - Add endpoint: `https://yourdomain.com/api/paystack-webhook`
   - Select events: `charge.success`
4. **Get Webhook Secret**: Copy the secret from webhook details

### 4. Database Setup

Run the existing schema against your database:

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

## 🔧 Configuration

### Pricing Configuration

The token pricing is configured in `src/lib/paystack/config.ts`:

```typescript
export const SIZ_TOKEN_PRICING = {
  BASE_PRICE_PER_TOKEN: 0.25,        // $0.25 USD per SIZ token
  PRICE_INCREMENT: 0.00,             // No price increase - flat rate
  TOKEN_INCREMENT: 1,                 // No increment needed for flat pricing
  MIN_PURCHASE: 1,                   // Minimum 1 SIZ token
  MAX_PURCHASE: 10000,               // Maximum 10,000 SIZ tokens per transaction
  PROCESSING_FEE_PERCENTAGE: 0.015,  // 1.5% Paystack processing fee
  PROCESSING_FEE_FIXED: 0.00,        // No fixed fee for Paystack
};
```

### Currency Support

Paystack supports multiple currencies. The system is configured to use NGN by default but can be extended to support other currencies:

- **NGN (Nigerian Naira)**: Primary currency
- **USD (US Dollar)**: Supported for international users
- **GHS (Ghanaian Cedi)**: Supported for Ghana users
- **ZAR (South African Rand)**: Supported for South Africa users

### Network Configuration

Configure Algorand networks in your environment:

```env
ALGORAND_NETWORK=testnet  # or mainnet
```

## 📱 Usage

### Creating a Payment

```typescript
import { createTransaction } from '@/app/actions/paystack';

const result = await createTransaction({
  tokenAmount: 100,
  userEmail: 'user@example.com',
  userWalletAddress: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890123456789012345678901234567890',
  currency: 'NGN',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel',
});

if (result.success) {
  // Redirect user to result.authorizationUrl
  window.location.href = result.authorizationUrl;
}
```

### Verifying a Payment

```typescript
import { verifyTransaction } from '@/app/actions/paystack';

const result = await verifyTransaction('transaction_reference');
if (result.success) {
  console.log('Payment verified:', result.data);
}
```

## 🗄️ Database Schema

The integration uses the existing payment database schema with the following key tables:

- `payment_transactions`: Stores payment records
- `token_transfers`: Tracks token transfer history
- `webhook_events`: Manages webhook idempotency
- `user_wallet_balances`: Tracks user token balances

## 🔒 Security Features

### Webhook Security

1. **Signature Verification**: All webhooks are verified using HMAC SHA512
2. **IP Whitelisting**: Paystack webhooks come from specific IP addresses
3. **Idempotency**: Prevents duplicate processing of webhook events

### Payment Security

1. **HTTPS Only**: All payment communications use HTTPS
2. **Token Validation**: Wallet addresses are validated before processing
3. **Amount Validation**: Token amounts are validated against business rules

## 🧪 Testing

### Running Tests

```bash
# Run the integration test script
npx tsx scripts/test-paystack-integration.ts
```

### Test Coverage

The test suite covers:
- Configuration validation
- Pricing calculations
- Transaction creation
- Transaction verification
- Webhook signature verification
- Customer creation

### Manual Testing

1. **Test Transaction**: Use Paystack test cards
2. **Webhook Testing**: Use ngrok for local webhook testing
3. **Currency Testing**: Test with different currencies

## 🚀 Deployment

### Production Checklist

- [ ] Set production Paystack keys
- [ ] Configure production webhook URL
- [ ] Set up IP whitelisting
- [ ] Test webhook processing
- [ ] Verify token transfer flow
- [ ] Monitor payment processing

### Environment Variables

Ensure all required environment variables are set in production:

```env
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=your_production_webhook_secret
```

## 🔧 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL is publicly accessible
   - Verify webhook secret is correct
   - Check IP whitelisting

2. **Transaction Creation Fails**
   - Verify API keys are correct
   - Check currency support
   - Validate amount format (kobo for NGN)

3. **Token Transfer Fails**
   - Check Algorand network configuration
   - Verify central wallet has sufficient balance
   - Check SIZ token asset ID

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=paystack:*
```

### Support

For Paystack-specific issues, refer to:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)

## 🔄 Migration from Stripe

If migrating from Stripe:

1. Update environment variables
2. Replace Stripe imports with Paystack imports
3. Update UI components
4. Test webhook processing
5. Verify token transfer flow

## 📊 Monitoring

### Key Metrics

- Payment success rate
- Webhook processing time
- Token transfer success rate
- Average transaction value

### Logging

All payment events are logged with structured data for monitoring and debugging.

## 🔐 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use HTTPS** for all webhook endpoints
3. **Validate webhook signatures** before processing
4. **Implement rate limiting** on API endpoints
5. **Monitor for suspicious activity**

## 📈 Performance

### Optimization Tips

1. **Cache pricing calculations** for better performance
2. **Use connection pooling** for database operations
3. **Implement retry logic** for failed webhook processing
4. **Monitor API rate limits**

## 🆘 Support

For technical support:
- Check the troubleshooting section
- Review Paystack documentation
- Contact the development team

---

**Note**: This integration replaces the previous Stripe integration while maintaining the same user experience and data flow.
