# Stripe Webhook Production Deployment Checklist

## ✅ **Pre-Deployment Setup**

### 1. **Environment Variables**
```bash
# Production Stripe Keys (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database & App
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
CENTRAL_WALLET_ADDRESS=...
SIZ_TOKEN_ASSET_ID=...
```

### 2. **File Structure Verification**
```
src/
  app/
    api/
      stripe-webhook/
        route.ts ✅ (NEW - App Router)
      stripe/
        create-checkout-session/
          route.ts ✅ (Existing)
```

## 🚀 **Deployment Steps**

### 1. **Deploy Code Changes**
- [ ] Push new webhook endpoint to production
- [ ] Verify `/api/stripe-webhook` is accessible
- [ ] Test endpoint responds to POST requests

### 2. **Stripe Dashboard Configuration**
- [ ] Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] **Create/Update endpoint URL**: `https://yourdomain.com/api/stripe-webhook`
- [ ] **Select events**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
- [ ] **Copy webhook secret** (`whsec_...`) to production environment
- [ ] **Test endpoint** using Stripe's test button

### 3. **Environment Verification**
- [ ] `STRIPE_SECRET_KEY` is LIVE mode (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] Database connection is production instance

## 🔍 **Testing & Verification**

### 1. **Local Testing (Pre-Production)**
```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
```

### 2. **Production Testing**
```bash
# Test production endpoint
stripe listen --forward-to https://yourdomain.com/api/stripe-webhook

# Verify webhook delivery in Stripe Dashboard
# Check webhook logs for successful delivery
```

### 3. **End-to-End Test**
- [ ] Create test checkout session
- [ ] Complete payment with test card
- [ ] Verify webhook received in production logs
- [ ] Check database for payment record
- [ ] Verify token transfer initiated

## 🚨 **Common Production Issues & Solutions**

### 1. **Webhook Not Delivered**
- **Cause**: Endpoint URL incorrect or not accessible
- **Solution**: Verify URL in Stripe Dashboard matches production domain

### 2. **Signature Verification Failed**
- **Cause**: Wrong webhook secret or body parsing issue
- **Solution**: 
  - Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
  - Ensure using `await req.text()` (raw body) before verification

### 3. **500 Errors**
- **Cause**: Runtime errors in webhook handler
- **Solution**: Check production logs for specific error messages

### 4. **Timeout Issues**
- **Cause**: Handler taking too long (>10 seconds)
- **Solution**: Move heavy processing to background jobs

## 📊 **Monitoring & Debugging**

### 1. **Stripe Dashboard Monitoring**
- [ ] Webhook delivery success rate
- [ ] Response times
- [ ] Error logs and status codes

### 2. **Application Logs**
- [ ] Webhook event reception
- [ ] Payment processing steps
- [ ] Database operations
- [ ] Token transfer status

### 3. **Database Monitoring**
- [ ] Payment transaction records
- [ ] Webhook event audit trail
- [ ] Token transfer status updates

## 🔒 **Security Checklist**

- [ ] Webhook signature verification enabled
- [ ] Production secrets not in code
- [ ] HTTPS endpoint only
- [ ] Rate limiting considered
- [ ] Idempotency implemented

## 📝 **Post-Deployment Verification**

### 1. **Immediate Checks**
- [ ] Webhook endpoint responds to POST
- [ ] Stripe test events delivered successfully
- [ ] Database records created correctly
- [ ] No errors in production logs

### 2. **24-Hour Monitoring**
- [ ] Monitor webhook delivery rates
- [ ] Check payment processing success
- [ ] Verify token transfers completing
- [ ] Review error logs

### 3. **Rollback Plan**
- [ ] Keep old Pages Router webhook as backup
- [ ] Document rollback procedure
- [ ] Test rollback process

## 🆘 **Emergency Contacts**

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Production Logs**: Check your hosting platform logs
- **Database**: Verify connection and schema
- **Team**: Coordinate with development team

---

**Remember**: Always test in staging first, deploy during low-traffic periods, and monitor closely after deployment.
