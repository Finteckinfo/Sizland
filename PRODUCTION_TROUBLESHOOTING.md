# 🚨 Production Payment Flow Troubleshooting Guide

## 🎯 **Quick Diagnosis Commands**

### 1. **Test Database Setup**
```bash
npm run setup:db
```

### 2. **Test Complete Payment Flow**
```bash
npm run test:payment
```

### 3. **Test ARC-0059 Integration**
```bash
npm run test:arc59
```

## 🔍 **Common Production Issues & Solutions**

### **Issue 1: "Database connection failed"**
**Symptoms:**
- Webhook returns 500 error
- Console shows "Database connection failed"
- Payment processing stops at database operations

**Solutions:**
1. **Check DATABASE_URL in .env:**
   ```bash
   # Should look like:
   DATABASE_URL=postgres://username:password@host:port/database
   ```

2. **Verify database is accessible:**
   ```bash
   # Test connection manually
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. **Check SSL settings:**
   ```env
   # For most cloud providers (Supabase, Neon, Railway)
   DB_SSL=
   
   # Only if SSL is not required
   DB_SSL=disable
   ```

4. **Run database setup:**
   ```bash
   npm run setup:db
   ```

### **Issue 2: "Missing required metadata"**
**Symptoms:**
- Webhook logs show "Missing required metadata"
- Payment received but tokens not transferred
- Console shows metadata validation errors

**Solutions:**
1. **Check Stripe checkout session creation:**
   ```typescript
   // Ensure these metadata fields are set:
   metadata: {
     token_amount: "100",
     price_per_token: "0.25",
     payment_reference: "unique-ref-123",
     user_wallet_address: "ALGO_ADDRESS",
     product_type: "siz_token",
     network: "algorand"
   }
   ```

2. **Verify webhook endpoint URL:**
   - Check Stripe Dashboard → Webhooks
   - Ensure endpoint is: `https://yourdomain.com/api/stripe-webhook`
   - Verify webhook secret matches `STRIPE_WEBHOOK_SECRET`

### **Issue 3: "Insufficient token inventory"**
**Symptoms:**
- Payment processed but transfer fails
- Console shows "Insufficient token inventory"
- Database shows 0 available balance

**Solutions:**
1. **Check token inventory:**
   ```sql
   SELECT * FROM token_inventory WHERE asset_id = '2905622564';
   ```

2. **Fund central wallet with SIZ tokens:**
   - Transfer SIZ tokens to central wallet address
   - Update inventory table if needed

3. **Reset inventory (if needed):**
   ```sql
   UPDATE token_inventory 
   SET available_balance = 1000000000, reserved_balance = 0
   WHERE asset_id = '2905622564';
   ```

### **Issue 4: "Asset frozen in recipient"**
**Symptoms:**
- ARC-0059 transfer fails with "asset frozen in recipient"
- Console shows freeze-related errors
- Transfer stops at freeze check

**Solutions:**
1. **Check freeze manager credentials:**
   ```env
   UNFREEZE_ACCOUNT_ADDRESS=your_freeze_manager_address
   UNFREEZE_ACCOUNT_MNEMONIC="your 25 word mnemonic"
   ```

2. **Verify freeze manager has authority:**
   - Check asset parameters on AlgoExplorer
   - Ensure freeze manager address is correct

3. **Manual unfreeze (if needed):**
   ```bash
   # Use the Python script or manually unfreeze
   python unfreeze_script.py
   ```

### **Issue 5: "Router not opted into SIZ tokens"**
**Symptoms:**
- ARC-0059 transfer fails at router opt-in
- Console shows "Router needs to opt into SIZ tokens"
- Transfer stops at router setup

**Solutions:**
1. **Check ARC-0059 app ID:**
   ```env
   ARC59_APP_ID=2449590623  # Mainnet
   ```

2. **Verify router opt-in:**
   ```bash
   npm run test:arc59
   # This will automatically opt the router in if needed
   ```

3. **Manual router opt-in (if needed):**
   ```typescript
   // Use the ARC-0059 client directly
   const arc59Client = new Arc59Client({...});
   await arc59Client.optRouterIn(BigInt(process.env.SIZ_TOKEN_ASSET_ID));
   ```

### **Issue 6: "Webhook signature verification failed"**
**Symptoms:**
- Webhook returns 400 "Invalid signature"
- Stripe events not processed
- Console shows signature verification errors

**Solutions:**
1. **Check webhook secret:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. **Verify webhook endpoint:**
   - Check Stripe Dashboard → Webhooks
   - Ensure endpoint URL is correct
   - Verify webhook secret matches

3. **Test webhook locally:**
   ```bash
   # Use Stripe CLI for local testing
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

## 📊 **Debugging Production Issues**

### **Step 1: Check Webhook Logs**
Look for these log patterns in your production logs:

```bash
# Successful webhook
🔔 Stripe webhook received: { timestamp: "...", signature: "Present", bodyLength: 1234 }
✅ Webhook signature verified: { eventType: "checkout.session.completed", eventId: "evt_..." }

# Payment processing
🚀 Processing successful payment: { paymentReference: "...", tokenAmount: 100, ... }
🔍 Step 1: Checking payment idempotency...
📝 Step 2: Creating payment transaction record...
🔍 Step 3: Validating user wallet address...
🔍 Step 4: Checking token inventory...
🚀 Step 5: Initiating SIZ token transfer...

# Successful transfer
🎉 SIZ token transfer completed successfully: { txId: "...", ... }
```

### **Step 2: Check Database State**
```sql
-- Check payment transactions
SELECT * FROM payment_transactions 
WHERE payment_reference = 'your-payment-reference'
ORDER BY created_at DESC;

-- Check webhook events
SELECT * FROM webhook_events 
WHERE stripe_event_id = 'evt_...'
ORDER BY created_at DESC;

-- Check token transfers
SELECT * FROM token_transfers 
WHERE payment_transaction_id = 'uuid-here'
ORDER BY created_at DESC;
```

### **Step 3: Check Algorand Network**
```bash
# Check transaction status
curl "https://mainnet-api.algonode.cloud/v2/transactions/pending/{txId}"

# Check account balance
curl "https://mainnet-api.algonode.cloud/v2/accounts/{wallet_address}"
```

## 🛠️ **Emergency Recovery Procedures**

### **Recover Failed Payment**
```sql
-- 1. Find the failed payment
SELECT * FROM payment_transactions 
WHERE payment_reference = 'failed-payment-ref'
AND payment_status = 'failed';

-- 2. Reset status for retry
UPDATE payment_transactions 
SET payment_status = 'pending_token_transfer',
    token_transfer_status = 'pending',
    updated_at = NOW()
WHERE payment_reference = 'failed-payment-ref';

-- 3. Release any reserved tokens
UPDATE token_inventory 
SET available_balance = available_balance + reserved_balance,
    reserved_balance = 0
WHERE asset_id = '2905622564';
```

### **Reset Token Inventory**
```sql
-- Reset to initial state
UPDATE token_inventory 
SET available_balance = 1000000000,
    reserved_balance = 0,
    updated_at = NOW()
WHERE asset_id = '2905622564';
```

### **Clear Failed Transfers**
```sql
-- Clear failed transfer records
DELETE FROM token_transfers 
WHERE status = 'failed' 
AND created_at < NOW() - INTERVAL '1 hour';
```

## 📞 **Getting Help**

### **1. Check Logs First**
- Look for error patterns in webhook logs
- Check database state for inconsistencies
- Verify Algorand transaction status

### **2. Run Diagnostic Scripts**
```bash
npm run test:payment    # Test complete flow
npm run test:arc59      # Test ARC-0059 integration
npm run setup:db        # Verify database setup
```

### **3. Common Fixes**
- **Database issues**: Run `npm run setup:db`
- **ARC-0059 issues**: Run `npm run test:arc59`
- **Environment issues**: Check `.env` file
- **Stripe issues**: Verify webhook configuration

### **4. Contact Support**
If issues persist:
1. Run diagnostic scripts and share output
2. Share relevant log entries
3. Provide payment reference or transaction ID
4. Include error messages and stack traces

## 🚀 **Prevention Best Practices**

### **1. Monitor Webhook Health**
- Set up alerts for webhook failures
- Monitor payment success rates
- Track token transfer completion times

### **2. Regular Testing**
- Test payment flow weekly
- Verify database connectivity
- Check ARC-0059 integration

### **3. Environment Management**
- Use separate environments for testing/production
- Validate environment variables before deployment
- Keep secrets secure and rotated

### **4. Database Maintenance**
- Regular backups of payment data
- Monitor table sizes and performance
- Clean up old failed transactions

---

**Remember**: Most production issues can be resolved by running the diagnostic scripts and checking the logs. Start with `npm run test:payment` to get a complete system health check.
