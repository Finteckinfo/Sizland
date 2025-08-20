# SIZ Token Integration - Complete Guide

This document covers the complete integration of SIZ token purchases through Stripe checkout and automatic Algorand token transfers.

## Overview

The integration consists of:
1. **Stripe Checkout Flow** - Customer purchases SIZ tokens
2. **Webhook Processing** - Stripe notifies of successful payments
3. **Automatic Token Transfer** - SIZ tokens transferred from central wallet to customer
4. **Database Tracking** - Complete audit trail of all transactions

## Architecture

```
Customer → Stripe Checkout → Webhook → Token Transfer → Algorand Network
                ↓              ↓           ↓
            Payment Form   Payment DB   Transfer DB
```

## Environment Variables

### Required Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database Configuration
DATABASE_URL=postgres://...
DB_SSL=

# Algorand Network Configuration
ALGORAND_NETWORK_URL=https://testnet-api.algonode.cloud
ALGORAND_NETWORK_TOKEN=
SIZ_TOKEN_ASSET_ID=123456789
CENTRAL_WALLET_ADDRESS=ABCDEFGHIJKLMNOPQRSTUVWXYZ...
CENTRAL_WALLET_MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25"

# Application Configuration
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### Mnemonic Format

The `CENTRAL_WALLET_MNEMONIC` should be a 25-word mnemonic phrase. The system will automatically derive the private key from this mnemonic for transaction signing.

**Important:** Never expose the mnemonic to client-side code. It should only be accessed in server-side functions.

**Format:** 25 lowercase words separated by spaces
```
CENTRAL_WALLET_MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25"
```

**Example:**
```bash
CENTRAL_WALLET_MNEMONIC="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art"
```

## Database Schema

The integration uses these key tables:

- `payment_transactions` - Stripe payment records
- `token_transfers` - Algorand transfer records
- `user_wallet_balances` - Customer token balances
- `token_inventory` - Available token supply

## Flow Breakdown

### 1. Customer Purchase

1. Customer connects Algorand wallet
2. Selects token amount
3. Enters email
4. Clicks "Buy SIZ Tokens"
5. Redirected to Stripe Checkout

### 2. Stripe Processing

1. Stripe processes payment
2. Sends webhook to `/api/stripe-webhook`
3. Webhook verifies signature
4. Processes payment completion

### 3. Token Transfer

1. **Validation Checks:**
   - Payment not already processed (idempotency)
   - Sufficient token inventory
   - Valid customer wallet address
   - Customer has opted into SIZ token
   - No freeze restrictions

2. **Transfer Execution:**
   - Reserve tokens in inventory
   - Create Algorand asset transfer transaction
   - Sign with central wallet private key
   - Submit to Algorand network
   - Wait for confirmation (4 rounds)

3. **Database Updates:**
   - Mark transfer as completed
   - Update payment status
   - Record transaction ID
   - Update customer balance

### 4. Error Handling

- **Insufficient Balance:** Log error, mark payment failed
- **Transfer Failures:** Release reserved tokens, retry logic
- **Network Issues:** Automatic retries with exponential backoff
- **Invalid Addresses:** Validation before transfer attempt

## API Endpoints

### Create Checkout Session
```
POST /api/stripe/create-checkout-session
```

**Request Body:**
```json
{
  "tokenAmount": 1000,
  "userEmail": "customer@example.com",
  "userWalletAddress": "ABCDEFGHIJKLMNOPQRSTUVWXYZ...",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_..."
}
```

### Webhook Endpoint
```
POST /api/stripe-webhook
```

Handles Stripe events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.expired`

## Token Transfer Service

The `SizTokenTransferService` handles all Algorand operations:

```typescript
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';

// Check central wallet balance
const balance = await sizTokenTransferService.checkCentralWalletBalance();

// Check if receiver has opted in
const optInStatus = await sizTokenTransferService.checkReceiverOptIn(address);

// Check freeze status
const freezeStatus = await sizTokenTransferService.checkAssetFreezeStatus(address);

// Transfer tokens
const result = await sizTokenTransferService.transferSizTokens({
  receiverAddress: 'customer_address',
  amount: 1000,
  paymentId: 'payment_id'
});
```

## Security Features

### Mnemonic Security
- Mnemonic phrase stored in environment variables
- Never exposed to client-side code
- Automatically converted to private key for transaction signing
- Derived address validation ensures mnemonic matches configured wallet

### Idempotency
- Payment reference prevents duplicate processing
- Database constraints ensure data integrity
- Webhook signature verification

### Validation
- Algorand address format validation
- Token balance verification
- Opt-in status checking
- Freeze status verification

## Monitoring & Logging

### Key Metrics to Monitor
- Payment success/failure rates
- Token transfer success rates
- Average transfer confirmation time
- Failed transfer reasons

### Log Examples
```typescript
// Successful transfer
console.log('SIZ token transfer completed:', {
  paymentReference: 'ref_123',
  txId: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ...',
  tokenAmount: 1000,
  userWalletAddress: 'customer_address'
});

// Failed transfer
console.error('SIZ token transfer failed:', {
  error: 'Insufficient balance',
  paymentReference: 'ref_123'
});
```

## Testing

### Testnet Setup
1. Use Algorand testnet
2. Create test SIZ token
3. Fund test central wallet
4. Use Stripe test keys

### Test Scenarios
- Successful purchase and transfer
- Insufficient balance
- Customer not opted in
- Network failures
- Duplicate payment attempts

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Stripe webhook endpoint configured
- [ ] Central wallet funded with SIZ tokens
- [ ] Test transactions completed
- [ ] Monitoring and logging configured
- [ ] Error handling tested
- [ ] Security review completed

## Troubleshooting

### Common Issues

**"Neither apiKey nor config.authenticator provided"**
- Ensure `ALGORAND_NETWORK_TOKEN` is set
- Check `ALGORAND_NETWORK_URL` format

**"Failed to convert mnemonic to secret key"**
- Ensure `CENTRAL_WALLET_MNEMONIC` is set with exactly 25 words
- Verify mnemonic format: lowercase words separated by spaces
- Check that the mnemonic is valid and not corrupted

**"Insufficient balance"**
- Fund central wallet with SIZ tokens
- Check token asset ID configuration

**"Receiver not opted in"**
- Customer must opt into SIZ token first
- Consider implementing opt-in assistance

**"Asset frozen"**
- Check freeze manager configuration
- Unfreeze tokens if necessary

### Debug Commands

```bash
# Check central wallet balance
curl -X GET "https://testnet-api.algonode.cloud/v2/accounts/{CENTRAL_WALLET_ADDRESS}"

# Check asset information
curl -X GET "https://testnet-api.algonode.cloud/v2/assets/{SIZ_TOKEN_ASSET_ID}"

# Check database connection
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM payment_transactions;"
```

## Support

For technical support:
1. Check logs for error details
2. Verify environment configuration
3. Test with minimal transaction amounts
4. Review Algorand network status

## Future Enhancements

- **Batch Transfers:** Process multiple transfers in single transaction
- **Retry Logic:** Automatic retry for failed transfers
- **Notification System:** Email/SMS confirmations
- **Analytics Dashboard:** Transfer statistics and monitoring
- **Multi-Asset Support:** Support for other tokens
- **Gas Optimization:** Dynamic fee calculation
