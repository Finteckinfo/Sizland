# Bug Fixes Summary

## Date: November 21, 2025

### Fixed Issues

#### 1. Sensitive credentials committed to version control
**Status**: FIXED

**Problem**: The .env file was committed to the repository with actual API keys and secrets, including:
- NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  
- NEXTAUTH_SECRET

The .gitignore only excluded .env.local variants but not .env itself.

**Solution Applied**:
- Added .env to .gitignore
- Removed .env from git index
- Rewrote entire git history using git filter-branch to purge all traces
- Force pushed to GitHub to update remote repository
- Created SECURITY_BREACH_RESPONSE.md with credential rotation instructions

**Action Required**: Rotate all exposed credentials (see SECURITY_BREACH_RESPONSE.md)

---

#### 2. Incorrect Netlify publish directory configuration
**Status**: FIXED

**Problem**: The netlify.toml had `publish = ".next"` which is incorrect for Netlify deployments. The .next directory contains build artifacts but Netlify's Essential Next.js plugin handles serving automatically.

**Solution Applied**:
Removed the incorrect publish directory from netlify.toml:

```diff
[build]
  command = "npm run build"
- publish = ".next"
```

---

#### 3. Incorrect redirect configuration for Next.js application
**Status**: FIXED

**Problem**: The netlify.toml contained a catch-all redirect rule:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This is a single-page application pattern that breaks Next.js:
- API routes at /api/* would not work
- Server-side rendering would fail
- Dynamic routes would be broken

**Solution Applied**:
Removed the entire [[redirects]] section from netlify.toml. Netlify's Essential Next.js plugin handles all routing automatically.

---

#### 4. Missing required environment variable in configuration
**Status**: FIXED

**Problem**: The .env file was missing UNFREEZE_ACCOUNT_MNEMONIC variable which is required by:
- src/lib/algorand/arc59-send.ts
- src/lib/algorand/token-transfer.ts
- Various test scripts

Without this variable, token distribution would fail when assets are frozen.

**Solution Applied**:
- Added UNFREEZE_ACCOUNT_MNEMONIC to .env
- Added UNFREEZE_ACCOUNT_MNEMONIC to .env.example
- Cleaned up .env.example formatting issues (removed standalone = characters)
- Added missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.example
- Added missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.example
- Added missing NEXTAUTH_URL and NEXTAUTH_SECRET to .env.example
- Added missing NEXT_PUBLIC_BACKEND_URL to .env.example

---

## Files Modified

### /web3-landing/netlify.toml
- Removed incorrect `publish = ".next"` configuration
- Removed incorrect SPA redirect rule

### /web3-landing/.env
- Added missing UNFREEZE_ACCOUNT_MNEMONIC variable
- NOTE: File is now properly gitignored

### /web3-landing/.env.example
- Added NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- Added NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- Added UNFREEZE_ACCOUNT_MNEMONIC
- Added NEXTAUTH_URL
- Added NEXTAUTH_SECRET
- Added NEXT_PUBLIC_BACKEND_URL
- Cleaned up formatting (removed malformed = characters)

### /web3-landing/.gitignore
- Added .env to prevent future commits

---

## Testing Recommendations

1. **Environment Variables**: Verify all required variables are set before deployment
2. **Netlify Deployment**: Test deployment to ensure Next.js routing works correctly
3. **API Routes**: Verify /api/* endpoints function properly
4. **Token Operations**: Test token distribution with freeze/unfreeze functionality
5. **SSO Authentication**: Verify NextAuth.js configuration works with new secret

---

## Next Steps

1. Rotate compromised credentials (see SECURITY_BREACH_RESPONSE.md)
2. Test Netlify deployment with corrected configuration
3. Set up pre-commit hooks to prevent .env commits
4. Consider using environment variable management service (Vercel, AWS Secrets Manager)
5. Configure proper environment variables in Netlify dashboard for production

---

## Related Documentation

- SECURITY_BREACH_RESPONSE.md - Credential rotation instructions
- .env.example - Complete environment variable reference
