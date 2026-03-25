# Wallet Generation Feature

## Overview

The Sizland application now includes a client-side wallet generation feature that allows users to create new Algorand wallets without needing external wallet providers like Pera or Defly.

## Features

### 🔐 Client-Side Generation
- **Secure**: Uses `algosdk.generateAccount()` for cryptographically secure wallet generation
- **No External Dependencies**: Generates wallets locally without API calls
- **Instant**: Wallet creation happens immediately in the browser

### 📧 Email Delivery
- **Automatic**: Sends wallet credentials to user's email address
- **Complete**: Includes wallet address, private key, and 25-word recovery phrase
- **Professional**: Beautiful HTML email template with security instructions

### 🔗 Auto-Connection
- **Seamless**: Automatically connects the generated wallet after creation
- **Persistent**: Stores wallet data in localStorage for session persistence
- **Ready to Use**: Wallet is immediately available for transactions

## User Flow

1. **User enters email address** in the wallet generator form
2. **Wallet is generated** using client-side algosdk
3. **Credentials are sent** to the provided email address
4. **Wallet is automatically connected** and ready to use
5. **User can immediately** view balances and start transacting

## Technical Implementation

### Files Created/Modified

- `src/lib/algorand/walletGenerator.ts` - Core wallet generation utilities
- `src/components/ui/walletGenerator.tsx` - UI component for wallet generation
- `src/pages/api/sendWalletEmail.ts` - Email sending API endpoint
- `src/pages/wallet.tsx` - Updated to include wallet generator
- `src/lib/algorand/GeneratedWalletProvider.ts` - Enhanced with better error handling

### Key Functions

```typescript
// Generate new wallet
const wallet = generateAlgorandWallet();

// Store wallet locally
storeWallet(wallet);

// Send email with credentials
await fetch('/api/sendWalletEmail', {
  method: 'POST',
  body: JSON.stringify({
    email: userEmail,
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic,
  }),
});
```

## Security Features

### 🔒 Private Key Protection
- **Base64 Encoding**: Private keys are encoded for safe storage
- **Local Storage**: Credentials stored only in user's browser
- **Email Backup**: Secure delivery of credentials via email

### ⚠️ Security Warnings
- Clear warnings about keeping credentials secure
- Instructions for proper backup procedures
- Reminders about never sharing private keys

## Email Configuration

### Environment Variables Required

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASSWORD`

## Usage

### For Users
1. Navigate to the wallet page
2. If no wallet is connected, the wallet generator will appear
3. Enter your email address
4. Click "Generate Wallet"
5. Check your email for wallet credentials
6. Wallet is automatically connected and ready to use

### For Developers
1. Set up email environment variables
2. Install nodemailer: `npm install nodemailer @types/nodemailer`
3. Deploy the application
4. Test the wallet generation flow

## Benefits

### For Users
- **No External Wallets**: Don't need to install Pera, Defly, or other wallets
- **Instant Setup**: Get a wallet immediately with just an email
- **Email Backup**: Secure backup of wallet credentials
- **Easy Recovery**: 25-word phrase for wallet recovery

### For Developers
- **Reduced Friction**: Lower barrier to entry for new users
- **No API Dependencies**: Self-contained wallet generation
- **Better UX**: Seamless wallet creation and connection
- **Scalable**: Can handle many concurrent wallet generations

## Future Enhancements

- [ ] Wallet import via mnemonic phrase
- [ ] Multiple wallet support
- [ ] Hardware wallet integration
- [ ] Enhanced security features
- [ ] Wallet backup/export options
