# ARC-0059 Integration for SIZ Token Distribution

## 🎯 **Overview**

This document explains how to integrate **ARC-0059 (ASA Inbox Router)** to solve customer frustration from asset opt-in requirements when purchasing SIZ tokens.

**🚀 Bonus**: No deployment needed! We use the existing canonical contracts maintained by the Algorand Foundation.

## 🚀 **What ARC-0059 Solves**

### **Before (Problems):**
- ❌ Users must manually opt into SIZ tokens before receiving them
- ❌ Failed transfers if users aren't opted in
- ❌ Complex wallet setup required
- ❌ Customer frustration and support tickets

### **After (Solutions):**
- ✅ **Automatic routing** - tokens go to user's "inbox" if not opted in
- ✅ **Seamless claiming** - users can claim tokens without manual opt-in
- ✅ **No failed transfers** - all payments result in successful token delivery
- ✅ **Better user experience** - non-technical users can easily claim tokens

## 🏗️ **Architecture**

```
Stripe Payment → Webhook → ARC-0059 Contract → User Inbox → User Claims Tokens
```

### **Flow Breakdown:**
1. **User makes payment** via Stripe
2. **Webhook triggers** token transfer
3. **ARC-0059 contract** receives tokens
4. **Contract routes tokens**:
   - If user is opted in → Direct transfer
   - If user is not opted in → Store in inbox
5. **User claims tokens** from inbox (automatic opt-in handled)

## 📁 **File Structure**

```
src/lib/algorand/
├── arc59/
│   └── client.ts            # TypeScript client for ARC-0059
├── client.ts                # Algorand client
├── token-transfer.ts        # Updated transfer service
└── utils.ts                 # Utility functions

ARC59_INTEGRATION.md         # This documentation
```

## 🔧 **Setup Instructions**

### **Step 1: Install Dependencies**

```bash
npm install @algorandfoundation/algokit-utils
```

### **Step 2: Environment Variables**

Add to your `.env.local`:

```env
# ARC-0059 Configuration (Using Canonical Deployments)
ARC59_APP_ID=643020148  # Testnet: 643020148, Mainnet: 2449590623

# Existing variables
ALGORAND_NETWORK_URL=https://testnet-api.algonode.cloud
ALGORAND_NETWORK_TOKEN=
SIZ_TOKEN_ASSET_ID=your_siz_token_asset_id
CENTRAL_WALLET_MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25"
```

### **Step 3: Use Existing ARC-0059 Contracts**

The ARC-0059 standard has canonical deployments that are already ready to use:

| Network | App ID | Status |
|---------|--------|---------|
| **Testnet** | `643020148` | ✅ Ready to use |
| **Mainnet** | `2449590623` | ✅ Ready to use |

**No deployment needed!** These contracts are already:
- ✅ Deployed and verified
- ✅ Opted into most common assets
- ✅ Ready for production use
- ✅ Maintained by the Algorand Foundation

### **Step 4: Verify Router Status (Optional)**

```typescript
import { Arc59Client } from '@/lib/algorand/arc59/client';

const arc59Client = new Arc59Client({
  appId: Number(process.env.ARC59_APP_ID),
  sender: process.env.CENTRAL_WALLET_ADDRESS!,
  signer: yourSigner
});

// Opt the router into SIZ tokens
await arc59Client.optRouterIn(Number(process.env.SIZ_TOKEN_ASSET_ID));
```

## 💻 **Usage Examples**

### **1. Transfer Tokens (Automatic Routing)**

```typescript
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';

// This will automatically use ARC-0059 if available
const result = await sizTokenTransferService.transferSizTokens({
  receiverAddress: 'USER_WALLET_ADDRESS',
  amount: 100,
  paymentId: 'stripe_payment_id'
});

if (result.success) {
  console.log('✅ Tokens transferred successfully!');
  console.log('Transaction ID:', result.txId);
} else {
  console.error('❌ Transfer failed:', result.error);
}
```

### **2. Check User Status**

```typescript
const status = await sizTokenTransferService.checkReceiverOptIn('USER_WALLET_ADDRESS');

if (status.isOptedIn) {
  console.log('✅ User is opted in - direct transfer possible');
} else if (status.error?.includes('inbox')) {
  console.log('📬 User has tokens in inbox - they can claim them');
} else {
  console.log('⚠️ User needs to opt in or has insufficient ALGO');
}
```

### **3. User Claims Tokens**

```typescript
import { Arc59Client } from '@/lib/algorand/arc59/client';

const arc59Client = new Arc59Client({
  appId: Number(process.env.ARC59_APP_ID),
  sender: userWalletAddress,
  signer: userSigner
});

// User claims tokens from their inbox
const txId = await arc59Client.claimAsset({
  assetId: Number(process.env.SIZ_TOKEN_ASSET_ID),
  claimer: userWalletAddress
});

console.log('🎉 Tokens claimed successfully!', txId);
```

## 🔒 **Security Features**

### **Built-in Protections:**
- ✅ **User isolation** - each user has their own inbox
- ✅ **Asset validation** - only authorized assets can be routed
- ✅ **Access control** - only intended recipients can claim
- ✅ **Transaction grouping** - atomic operations prevent partial failures

### **Best Practices:**
- 🔐 **Environment variables** for sensitive data
- 🧪 **Testnet testing** before mainnet deployment
- 📊 **Monitoring** of contract interactions
- 🔄 **Regular audits** of contract security

## 🧪 **Testing**

### **Testnet Testing:**
```bash
# Set testnet environment
export ALGORAND_NETWORK_URL=https://testnet-api.algonode.cloud
export ARC59_APP_ID=643020148  # Testnet ARC-0059 contract
export SIZ_TOKEN_ASSET_ID=739030083  # Testnet SIZ token

# Test token transfer
npx ts-node scripts/test-arc59.ts
```

### **Test Scenarios:**
1. **User opted in** → Direct transfer
2. **User not opted in** → Inbox routing
3. **User claims from inbox** → Automatic opt-in
4. **Multiple users** → Separate inboxes
5. **Error handling** → Invalid addresses, insufficient funds

## 🚀 **Production Deployment**

### **Mainnet Checklist:**
- [ ] **Testnet thoroughly tested** with various scenarios
- [ ] **Environment variables** properly configured for mainnet
- [ ] **Monitoring** and alerting set up
- [ ] **Support team** trained on new system

### **Mainnet Configuration:**
```bash
# Mainnet configuration
export ALGORAND_NETWORK_URL=https://mainnet-api.algonode.cloud
export ARC59_APP_ID=2449590623  # Mainnet ARC-0059 contract
export SIZ_TOKEN_ASSET_ID=2905622564  # Mainnet SIZ token
```

## 📊 **Monitoring & Analytics**

### **Key Metrics:**
- **Transfer success rate** (should be 100% with ARC-0059)
- **Inbox usage** (how many users need inbox routing)
- **Claim frequency** (how often users claim from inbox)
- **Gas costs** (transaction fees for contract operations)

### **Logging:**
```typescript
// All ARC-0059 operations are logged
console.log('🔄 ARC-0059 transfer initiated');
console.log('✅ ARC-0059 transfer successful');
console.log('❌ ARC-0059 transfer failed');
```

## 🔄 **Migration from Direct Transfers**

### **Gradual Rollout:**
1. **Phase 1**: Configure ARC-0059 alongside existing system
2. **Phase 2**: Route 10% of transfers through ARC-0059
3. **Phase 3**: Increase to 50% and monitor
4. **Phase 4**: Full migration to ARC-0059
5. **Phase 5**: Remove old direct transfer code

### **Rollback Plan:**
- Keep direct transfer functionality as fallback
- Monitor success rates and user feedback
- Revert to direct transfers if issues arise

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **1. Contract Not Configured**
```
Error: ARC59_APP_ID is not set
```
**Solution**: Set the correct App ID in your environment:
- Testnet: `ARC59_APP_ID=643020148`
- Mainnet: `ARC59_APP_ID=2449590623`

#### **2. Router Not Opted In**
```
Error: Router not opted into SIZ tokens
```
**Solution**: Call `optRouterIn()` method

#### **3. Insufficient Funds**
```
Error: Central wallet has insufficient SIZ tokens
```
**Solution**: Ensure central wallet has enough tokens

#### **4. Network Issues**
```
Error: Failed to connect to Algorand network
```
**Solution**: Check network URL and token configuration

### **Debug Mode:**
```typescript
// Enable detailed logging
process.env.DEBUG = 'arc59:*';

// Check contract state
const appInfo = await algodClient.getApplicationByID(appId).do();
console.log('Contract state:', appInfo);
```

## 📚 **Additional Resources**

### **Documentation:**
- [ARC-0059 Specification](https://dev.algorand.co/arc-standards/arc-0059/)
- [AlgoKit Utils](https://dev.algorand.co/algokit/utils/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)

### **Examples:**
- [Reference Implementation](https://github.com/algorandfoundation/ARCs/tree/main/assets/arc-0059/)
- [TypeScript Client](https://dev.algorand.co/arc-standards/arc-0059/#typescript-claim-function)

### **Support:**
- [Algorand Discord](https://discord.gg/algorand)
- [Algorand Forum](https://forum.algorand.org/)
- [GitHub Issues](https://github.com/algorandfoundation/ARCs/issues)

## 🎉 **Success Metrics**

### **User Experience:**
- ✅ **100% transfer success rate** (no more failed transfers)
- ✅ **Reduced support tickets** (no more opt-in issues)
- ✅ **Faster onboarding** (users get tokens immediately)
- ✅ **Higher conversion rates** (less friction in purchase flow)

### **Technical:**
- ✅ **Seamless integration** with existing Stripe flow
- ✅ **Automatic fallback** to direct transfers if needed
- ✅ **Scalable architecture** for high transaction volumes
- ✅ **Cost-effective** (minimal additional gas costs)

---

**🎯 Goal**: Eliminate customer frustration from asset opt-in requirements while maintaining security and user experience.

**🚀 Result**: Seamless SIZ token distribution that works for all users, regardless of their wallet setup.
