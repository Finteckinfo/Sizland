# 🚀 ARC-0059 Quick Start Guide

## ⚡ **Get ARC-0059 Running in 5 Minutes**

### **1. Install Dependencies**
```bash
npm install @algorandfoundation/algokit-utils
```

### **2. Set Environment Variables**
Create or update your `.env.local`:
```env
# ARC-0059 Configuration (Using Canonical Deployments)
ARC59_APP_ID=643020148  # Testnet: 643020148, Mainnet: 2449590623

# Algorand Network
ALGORAND_NETWORK_URL=https://testnet-api.algonode.cloud
ALGORAND_NETWORK_TOKEN=

# SIZ Token
SIZ_TOKEN_ASSET_ID=739030083  # Testnet: 739030083, Mainnet: 2905622564

# Central Wallet
CENTRAL_WALLET_MNEMONIC="your 25 word mnemonic phrase here"
CENTRAL_WALLET_ADDRESS="your wallet address here"
```

### **3. Test the Integration**
```bash
# Using Node.js directly (since we removed tsx)
npx ts-node scripts/test-arc59.ts

# Or if you prefer tsx
npm install -g tsx
tsx scripts/test-arc59.ts
```

## 🎯 **What Happens Next**

1. **Use existing ARC-0059 contracts** → Already deployed and ready
2. **Router already opted in** → Can handle SIZ tokens immediately
3. **Automatic routing** → Tokens go to inbox if user not opted in
4. **Seamless claiming** → Users claim tokens without manual setup

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **"ARC59_APP_ID is not set"**
- Set the App ID in your `.env.local`:
  - Testnet: `ARC59_APP_ID=643020148`
  - Mainnet: `ARC59_APP_ID=2449590623`

#### **"Router not opted into SIZ tokens"**
- The canonical ARC-0059 contracts are already opted into most assets
- If needed, the contract can be opted in via `arc59_optRouterIn`

#### **"Failed to connect to Algorand network"**
- Check your `ALGORAND_NETWORK_URL`
- Ensure you have internet connection

## 📱 **Usage in Your App**

### **Automatic Token Transfers:**
```typescript
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';

// This automatically uses ARC-0059 if available
const result = await sizTokenTransferService.transferSizTokens({
  receiverAddress: 'USER_WALLET',
  amount: 100,
  paymentId: 'stripe_payment_id'
});
```

### **Check User Status:**
```typescript
const status = await sizTokenTransferService.checkReceiverOptIn('USER_WALLET');

if (status.error?.includes('inbox')) {
  console.log('📬 User has tokens in inbox - they can claim them!');
}
```

## 🎉 **Success!**

Your users can now:
- ✅ **Buy SIZ tokens** without worrying about opt-in
- ✅ **Receive tokens automatically** (direct or to inbox)
- ✅ **Claim from inbox** with one click
- ✅ **Never experience failed transfers**

## 📚 **Next Steps**

1. **Test thoroughly** on testnet
2. **Deploy to mainnet** when ready
3. **Monitor performance** and user feedback
4. **Optimize** based on usage patterns

---

**Need help?** Check the full [ARC59_INTEGRATION.md](./ARC59_INTEGRATION.md) documentation!
