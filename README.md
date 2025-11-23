# SIZLAND - Web3 Landing Platform

**The Gateway to Blockchain-Powered Project Management**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Algorand](https://img.shields.io/badge/Algorand-Blockchain-00D1B2)](https://www.algorand.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

Live: [https://siz.land](https://siz.land) | ERP: [https://app.sizland.com](https://app.sizland.com)

---

## What is SIZLAND?

SIZLAND is a **revolutionary blockchain-based project management ecosystem** that combines traditional ERP capabilities with Web3 technology. This landing page serves as the public gateway to the SIZLAND platform, showcasing our vision and onboarding users into the future of transparent, decentralized project management.

### The Complete Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                    SIZLAND ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌐 Landing Page (This Repo)                                │
│  └─► Marketing, demos, wallet connection showcase           │
│                                                              │
│  💼 ERP Application (SIZERP2-0)                             │
│  └─► Project management, task tracking, team collaboration  │
│                                                              │
│  ⚡ Backend API (SIZERPBACKEND2-0)                          │
│  └─► Business logic, database, payment processing           │
│                                                              │
│  ⛓️  Algorand Blockchain                                     │
│  └─► SIZ Token, secure payments, transparent transactions   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Purpose

This landing page is the **first touchpoint** for users discovering SIZLAND. It serves multiple critical functions:

- **Marketing Hub**: Showcase the power of blockchain-integrated project management
- **Education Center**: Explain how SIZLAND revolutionizes team collaboration
- **Web3 Demo**: Demonstrate wallet connection and blockchain capabilities
- **Onboarding Gateway**: Direct users to create accounts in the ERP system
- **Trust Builder**: Display tokenomics, roadmap, and ecosystem transparency
- **Community Portal**: Connect with stakeholders, partners, and developers

## Key Features

### Modern Web3 Landing Experience

**Hero Section**
- Stunning animated background with GSAP/Framer Motion
- Clear value proposition and call-to-action
- Live wallet connection demonstration
- Real-time blockchain data display

**Feature Showcase**
- Interactive cards highlighting platform capabilities
- Visual demonstrations of key workflows
- Testimonials and success stories
- Integration partner logos

**Web3 Integration Demo**
- Multi-chain wallet support (Ethereum, Polygon, Arbitrum)
- Real-time balance and transaction display
- Network switching capabilities
- Smart contract interaction examples

### SIZ Token & Blockchain Integration

**Token Distribution**
- Fiat-to-crypto gateway (Stripe & Paystack integration)
- Automated wallet generation for new users
- Secure token claiming with email verification
- ARC-0059 atomic transfers on Algorand
- Real-time transaction monitoring
- Complete purchase history tracking

**Wallet Support**
- **Algorand**: Pera Wallet, Defly, Lute Connect
- **Ethereum**: MetaMask, WalletConnect, Coinbase Wallet, Rainbow
- **Multi-chain**: Polygon, Arbitrum, Optimism ready
- Direct transfer fallback mechanisms

### Design & User Experience

**Responsive Design**
- Mobile-first approach with TailwindCSS
- Tablet and desktop optimizations
- Dark/Light theme toggle
- Smooth animations and transitions
- Progressive Web App (PWA) support

**Performance Optimized**
- Next.js 15 with App Router
- Server-side rendering (SSR)
- Static site generation (SSG) where applicable
- Image optimization with next/image
- Code splitting and lazy loading

### Content Sections

**Information Pages**
- Comprehensive whitepaper
- Product roadmap and milestones
- Team introduction
- Technology stack details
- Partnership information
- Blog and news updates

**Onboarding Flow**
- Clear CTAs to ERP signup
- Guided wallet connection process
- Video tutorials and demos
- FAQ and documentation links

### Security & Authentication

**NextAuth Integration**
- Multiple authentication strategies
- Wallet-based auth (SIWE - Sign-In With Ethereum)
- Email/password authentication
- OAuth providers ready (Google, GitHub)
- Secure session management with JWT

**Data Protection**
- Encrypted wallet storage
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Input validation and sanitization

### Analytics & Tracking

- User behavior analytics
- Conversion funnel tracking
- Wallet connection metrics
- Page performance monitoring
- A/B testing capabilities
- SEO optimization

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router and Pages Router
- **Language**: TypeScript 5.5
- **Styling**: TailwindCSS with Shadcn UI components
- **Animations**: Framer Motion, GSAP, React Spring
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with validation

### Blockchain
- **Blockchain**: Algorand (Mainnet/Testnet)
- **SDK**: AlgoSDK 3.3
- **Wallet Integration**: 
  - @txnlab/use-wallet for Algorand wallets
  - @perawallet/connect for Pera Wallet
  - @blockshake/defly-connect for Defly
  - lute-connect for Lute Wallet
- **Smart Contracts**: ARC-0059 router for atomic transfers
- **Ethereum Support**: Wagmi, Viem, RainbowKit (multi-chain ready)

### Payment Processing
- **Stripe**: Card payments and webhook handling
- **Paystack**: African payment methods support
- **Webhook Verification**: Secure webhook signature validation

### Backend & Database
- **Database**: PostgreSQL with connection pooling
- **ORM**: pg (node-postgres) for direct SQL access
- **API Routes**: Next.js API routes for server-side logic
- **Email**: Nodemailer for transactional emails
- **Authentication**: NextAuth for session management

### Development Tools
- **Package Manager**: Bun (npm/yarn also supported)
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint with Next.js configuration
- **Formatting**: Prettier
- **Testing Scripts**: Custom TypeScript test runners

## Quick Start

### Prerequisites

**Required:**
- Node.js 18+ or Bun (recommended for faster builds)
- npm or yarn package manager
- Git for version control

**For Full Functionality:**
- PostgreSQL database (for token distribution tracking)
- Stripe account (payment processing)
- Paystack account (African payment methods)
- WalletConnect Project ID (Web3 wallet connections)
- Algorand wallet (Pera, Defly, or Lute)
- SIZ token ASA on Algorand mainnet/testnet

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/Finteckinfo/next-web3-template-main.git
cd next-web3-template-main
```

**2. Install Dependencies**

```bash
# Using Bun (recommended - faster)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

**3. Environment Setup**

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

**Minimum Configuration (For Landing Page Only):**

```env
# Public Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ERP_URL=http://localhost:5173
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id

# Clerk Authentication (Optional)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# For Token Distribution Features (Optional)
DATABASE_URL=postgresql://user:password@host:port/database
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Algorand Configuration (Optional)
ALGORAND_NETWORK_URL=https://testnet-api.algonode.cloud
SIZ_TOKEN_ASSET_ID=your_asset_id
CENTRAL_WALLET_ADDRESS=your_wallet
CENTRAL_WALLET_MNEMONIC=your 25 word mnemonic
```

**4. Database Setup (If Using Token Distribution)**

```bash
npm run setup:db
```

**5. Start Development Server**

```bash
npm run dev
```

✅ **Landing page now running at:** `http://localhost:3000`

## Development

### Available Scripts

```bash
# Development Workflow
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run export           # Export static site

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking

# Database Management (Token Distribution)
npm run setup:db         # Initialize database
npm run init:inventory   # Setup token inventory
npm run check:db         # Test DB connection

# Testing & Debugging
npm run test:arc59       # Test Algorand integration
npm run test:payment     # Test payment flow
npm run test:webhook     # Test webhook processing
```

### Development Workflow

**For Landing Page Development Only:**
1. Start dev server: `npm run dev`
2. Edit pages in `src/pages/` or `src/app/`
3. Add components in `src/components/`
4. Update styles in `src/styles/`
5. Hot reload happens automatically

**For Full Ecosystem Development:**

**Terminal 1 - Landing Page:**
```bash
cd ~/SizLand/web3-landing
npm run dev  # Runs on :3000
```

**Terminal 2 - ERP System:**
```bash
cd ~/SizLand/SIZERP2-0
npm run dev  # Runs on :5173
```

**Terminal 3 - Backend API:**
```bash
cd ~/SizLand/SIZERPBACKEND2-0
npm run dev  # Runs on :4000
```

### Project Structure

```
web3-landing/
├── public/                      # Static assets
│   ├── favicon.ico              # Site icon
│   ├── images/                  # Image assets
│   └── manifest.json            # PWA manifest
│
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css          # Global styles
│   │
│   ├── pages/                   # Pages Router (Hybrid)
│   │   ├── api/                 # API endpoints
│   │   │   ├── auth/            # Authentication
│   │   │   ├── webhooks/        # Payment webhooks
│   │   │   ├── generateWallet.ts
│   │   │   └── wallet.ts
│   │   ├── index.tsx            # Landing page (alternative)
│   │   ├── whitepaper.tsx       # Whitepaper page
│   │   ├── dex.tsx              # DEX information
│   │   ├── blog.tsx             # Blog listing
│   │   └── wallet.tsx           # Wallet dashboard
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI library
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx       # Navigation bar
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   └── Sidebar.tsx      # Mobile menu
│   │   ├── sections/            # Page sections
│   │   │   ├── Hero.tsx         # Hero section
│   │   │   ├── Features.tsx     # Features showcase
│   │   │   ├── Roadmap.tsx      # Product roadmap
│   │   │   ├── Tokenomics.tsx   # Token economics
│   │   │   └── Team.tsx         # Team members
│   │   └── web3/                # Web3 components
│   │       ├── ConnectButton.tsx
│   │       ├── WalletInfo.tsx
│   │       └── NetworkSwitch.tsx
│   │
│   ├── lib/                     # Utilities & configs
│   │   ├── algorand/            # Algorand SDK
│   │   ├── stripe/              # Payment processing
│   │   ├── db/                  # Database utils
│   │   ├── wagmi.ts             # Wagmi config
│   │   └── utils.ts             # Helper functions
│   │
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── Web3Context.tsx      # Web3 providers
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── index.ts             # Main types
│   │   ├── api.ts               # API types
│   │   └── web3.ts              # Web3 types
│   │
│   └── styles/                  # Stylesheets
│       └── globals.css          # Global CSS
│
├── scripts/                     # Utility scripts
│   ├── setup-database.ts        # DB initialization
│   ├── test-arc59-integration.ts
│   └── test-payment-flow.ts
│
├── .env.example                 # Environment template
├── .env.local                   # Local environment (gitignored)
├── .gitignore                   # Git ignore rules
├── components.json              # Shadcn config
├── middleware.ts                # Route protection
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── README.md                    # This file
```

## User Journey

### From Discovery to Ecosystem Entry

**Step 1: Discovery** (Landing Page)
```
User finds SIZLAND → Explores features → Watches demos → Connects wallet
```

**Step 2: Education** (Landing Page)
```
Reads whitepaper → Reviews roadmap → Checks tokenomics → Views team
```

**Step 3: Decision** (Landing Page)
```
Clicks "Get Started" → Redirected to ERP signup
```

**Step 4: Onboarding** (ERP System)
```
Creates account → Connects Algorand wallet → Completes profile
```

**Step 5: Participation** (ERP System)
```
Joins projects → Works on tasks → Receives blockchain payments
```

### Complete Token Purchase Flow

**1. Token Purchase Initiation**
- User clicks "Buy SIZ Tokens" on landing page
- Selects token amount and payment method
- Stripe/Paystack checkout session created
- Redirected to secure payment page

**2. Payment Processing**
- Payment provider processes transaction
- Webhook notification sent to `/api/webhooks/stripe`
- Payment verified via signature validation
- Transaction recorded in database

**3. Wallet Generation**
- Server automatically generates Algorand wallet
- Mnemonic encrypted with AES-256-GCM
- Wallet address and encrypted keys stored
- Email sent with claim link

**4. Token Distribution**
- User clicks email claim link
- Verifies identity via secure token
- ARC-0059 atomic transfer initiated on Algorand
- Tokens transferred to user's new wallet
- Transaction hash returned for verification
- Confirmation email sent with wallet details

### Integration with ERP System

**Seamless Transition**

The landing page is designed to smoothly transition users to the ERP application:

```javascript
// CTA Button Component
function GetStartedButton() {
  const handleClick = () => {
    // Track conversion
    analytics.track('get_started_clicked');
    
    // Redirect to ERP signup
    window.location.href = process.env.NEXT_PUBLIC_ERP_URL + '/register';
  };
  
  return <Button onClick={handleClick}>Get Started</Button>;
}
```

**Shared Authentication Context**

Both landing page and ERP can share authentication via Clerk:

```javascript
// Wallet connection preserved across domains
const { isSignedIn, user } = useUser();

if (isSignedIn) {
  // User authenticated, redirect to dashboard
  router.push(ERP_URL + '/dashboard');
}
```

### Web3 Integration Example

**Wallet Connection (Ethereum/Multi-chain)**

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return connectors.map((connector) => (
    <button key={connector.id} onClick={() => connect({ connector })}>
      Connect {connector.name}
    </button>
  ));
}
```

**Token Distribution (Algorand)**

```typescript
import algosdk from 'algosdk';

// ARC-0059 atomic transfer
async function distributeTokens(recipientAddress: string, amount: number) {
  const algodClient = new algosdk.Algodv2(
    process.env.ALGORAND_TOKEN,
    process.env.ALGORAND_URL,
    ''
  );

  // Create atomic transfer transaction group
  const txn = await makeAtomicTransferTxn({
    from: centralWallet,
    to: recipientAddress,
    amount: amount,
    assetId: SIZ_TOKEN_ASSET_ID,
    appId: ARC59_APP_ID,
  });

  // Sign and send
  const signedTxn = await signTransaction(txn);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  
  // Wait for confirmation
  await waitForConfirmation(algodClient, txId, 4);
  
  return txId;
}
```

### Admin Dashboard

Access at `/admin` (requires admin authentication):

- **Token Inventory**: View available token supply
- **Purchase History**: Monitor all token purchases
- **User Management**: View and manage user accounts
- **Transaction Logs**: Track all blockchain transactions
- **Database Queries**: Execute custom SQL queries
- **System Health**: Monitor application status

## API Endpoints

### Public Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/generateWallet` - Create new wallet
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/paystack` - Paystack webhook handler
- `GET /api/wallet` - Get wallet information

### Protected Endpoints

- `GET /api/user/profile` - Get user profile
- `POST /api/user/claim-tokens` - Claim purchased tokens
- `GET /api/user/transactions` - Get transaction history

### Admin Endpoints

- `GET /api/admin/inventory` - Get token inventory
- `GET /api/admin/purchases` - List all purchases
- `GET /api/admin/users` - List all users
- `POST /api/admin/distribute` - Manual token distribution

## Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run start

# Or export as static site
npm run export
```

### Deployment Platforms

**Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Custom domain
vercel --prod --domains=sizland.com
```

**Option 2: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Option 3: Docker**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)

**Critical Updates:**
```env
# Application URLs
NEXT_PUBLIC_APP_URL=https://sizland.com
NEXT_PUBLIC_ERP_URL=https://app.sizland.com
NEXT_PUBLIC_API_URL=https://api.sizland.com

# Algorand Mainnet
ALGORAND_NETWORK_URL=https://mainnet-api.algonode.cloud
SIZ_TOKEN_ASSET_ID=<your_mainnet_asset_id>

# Production Payment Keys
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Security
DB_SSL=require
NEXTAUTH_SECRET=<generate_strong_secret>
NEXTAUTH_URL=https://sizland.com
```

### Domain Configuration

**Recommended DNS Setup:**
```
# Main landing page
A     @           <vercel_ip_or_netlify_ip>
CNAME www         cname.vercel-dns.com

# ERP Application
CNAME app         <erp-deployment>.vercel.app

# Backend API
CNAME api         <backend-deployment>.railway.app
```

### Webhook Configuration

**Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://sizland.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

**Paystack Dashboard:**
1. Go to Settings → Webhooks
2. Add URL: `https://sizland.com/api/webhooks/paystack`
3. Enable: `charge.success`

### Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Webhook endpoints configured and tested
- [ ] SSL certificates active (HTTPS)
- [ ] Database connection working
- [ ] Token distribution tested on mainnet
- [ ] Analytics tracking configured
- [ ] Error monitoring setup (Sentry)
- [ ] Performance monitoring active
- [ ] SEO meta tags verified
- [ ] Social sharing cards tested

## 🔐 Security

### Implemented Security Measures

**Data Protection**
- ✅ AES-256-GCM encryption for wallet mnemonics
- ✅ PBKDF2 key derivation for encryption keys
- ✅ All sensitive data in environment variables
- ✅ HTTPS enforcement in production
- ✅ Secure HTTP headers with middleware

**API Security**
- ✅ Webhook signature verification (Stripe/Paystack)
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration for trusted domains
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)

**Authentication & Authorization**
- ✅ NextAuth for session management
- ✅ JWT token-based authentication
- ✅ Wallet signature verification (SIWE)
- ✅ Role-based access control (RBAC)
- ✅ Protected admin routes

**Blockchain Security**
- ✅ Transaction signing on server-side
- ✅ Wallet mnemonic never exposed to client
- ✅ ARC-0059 atomic transfers for safety
- ✅ Transaction verification before confirmation

### Security Best Practices

**For Development:**
```bash
# Audit dependencies regularly
npm audit

# Fix vulnerabilities
npm audit fix

# Keep dependencies updated
npm update

# Use security linting
npm run lint
```

**For Production:**
- 🔒 Enable database SSL (`DB_SSL=require`)
- 🔒 Use strong secrets (>32 characters, random)
- 🔒 Rotate API keys and secrets regularly
- 🔒 Enable 2FA for admin accounts
- 🔒 Monitor security logs
- 🔒 Implement CSRF protection
- 🔒 Set up WAF (Web Application Firewall)
- 🔒 Regular penetration testing

### Security Incident Response

**If Security Breach Detected:**
1. **Immediate**: Disable affected services
2. **Notify**: Alert users and stakeholders
3. **Investigate**: Review logs and identify breach vector
4. **Rotate**: Change all compromised credentials
5. **Patch**: Fix vulnerability
6. **Monitor**: Watch for further attempts
7. **Document**: Create incident report

**Refer to:** `SECURITY_BREACH_RESPONSE.md` for detailed procedures

## Testing

Run the included test scripts to verify functionality:

```bash
# Test blockchain integration
npm run test:arc59

# Test payment processing
npm run test:payment

# Test wallet generation
npm run test:wallet-claim

# Test webhook handling
npm run test:webhook-flow
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
npm run check:db

# Verify DATABASE_URL format
# postgresql://user:password@host:port/database
```

### Blockchain Transaction Failures
- Verify Algorand node connectivity
- Check wallet has sufficient ALGO for fees
- Ensure token asset is not frozen
- Verify ARC-0059 app ID is correct

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook secret matches provider
- Review webhook logs in database
- Test with provider's webhook testing tool

### Token Distribution Issues
- Verify central wallet has sufficient token balance
- Check recipient wallet is opted into ASA
- Ensure ARC-0059 router is funded
- Review transaction logs for errors

## Performance Optimization

- Uses Bun for faster dependency installation
- Implements code splitting and lazy loading
- Optimized images with Next.js Image component
- Database connection pooling
- React Query for efficient data caching
- Progressive Web App support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary to Finteck Information Systems.

## Support

For technical support or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Review the documentation files in the repository

## SIZLAND Ecosystem

This landing page is **part of a complete blockchain-powered project management ecosystem**:

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SIZLAND ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌐 Landing Page (This Repository)                          │
│  📦 Repository: web3-landing                                 │
│  🎯 Purpose: Marketing, education, token distribution        │
│  🔗 Tech: Next.js 15, React 19, TailwindCSS                  │
│                                                              │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  💼 ERP Application                                          │
│  📦 Repository: SIZERP2-0                                    │
│  🎯 Purpose: Project management, task tracking, payments     │
│  🔗 Tech: Vue 3, Vuetify, Pinia, Algorand SDK                │
│                                                              │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  ⚡ Backend API                                              │
│  📦 Repository: SIZERPBACKEND2-0                             │
│  🎯 Purpose: Business logic, database, API endpoints         │
│  🔗 Tech: Node.js, Express, PostgreSQL, Prisma               │
│                                                              │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  ⛓️  Algorand Blockchain                                     │
│  🎯 Purpose: SIZ Token, payments, transparent transactions   │
│  🔗 Tech: Algorand L1, ARC-0059, ASA                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Related Repositories

**Main Repositories:**
- [**SIZERP2-0**](https://github.com/Finteckinfo/SIZERP2-0) - Vue 3 ERP application
- [**SIZERPBACKEND2-0**](../SIZERPBACKEND2-0) - Node.js backend API
- [**web3-landing**](https://github.com/Finteckinfo/next-web3-template-main) - This repository

**Local Paths** (if you have full ecosystem cloned):
```bash
~/SizLand/
├── web3-landing/       # This repository (Next.js landing page)
├── SIZERP2-0/         # Vue 3 ERP application
└── SIZERPBACKEND2-0/  # Node.js backend API
```

### Running the Complete Ecosystem

See the [**Complete SIZLAND System Guide**](../COMPLETE_SIZLAND_SYSTEM_GUIDE.md) for detailed setup of all components.

**Quick Start (All Components):**

```bash
# Terminal 1 - Landing Page (Port 3000)
cd ~/SizLand/web3-landing
npm install
npm run dev

# Terminal 2 - ERP System (Port 5173)
cd ~/SizLand/SIZERP2-0
npm install
npm run dev

# Terminal 3 - Backend API (Port 4000)
cd ~/SizLand/SIZERPBACKEND2-0
npm install
npm run dev
```

## Related Documentation

**In This Repository:**
- `SECURITY_BREACH_RESPONSE.md` - Security incident handling
- `BUG_FIXES_SUMMARY.md` - Recent bug fixes and improvements
- `AUTOMATED_BUG_DETECTION_SETUP.md` - Pre-commit security hooks

**Integration Guides:**
- `ARC59_INTEGRATION.md` - Algorand ARC-0059 atomic transfers
- `STRIPE_INTEGRATION.md` - Stripe payment processing
- `PAYSTACK_INTEGRATION.md` - Paystack for African payments
- `WALLET_GENERATION.md` - Automated wallet creation
- `COMPLETE_INTEGRATION_GUIDE.md` - End-to-end setup

**Deployment:**
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch verification
- `PRODUCTION_TROUBLESHOOTING.md` - Common production issues
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps

**System-Wide:**
- [`../COMPLETE_SIZLAND_SYSTEM_GUIDE.md`](../COMPLETE_SIZLAND_SYSTEM_GUIDE.md) - Complete ecosystem documentation
- [`../README.md`](../README.md) - Master README for entire SIZLAND system

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```
5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add awesome feature"
   git commit -m "fix: resolve bug in wallet connection"
   ```
6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📄 License

**Proprietary License**

This project is private and proprietary to **Finteck Information Systems**. All rights reserved.

- ❌ Not open source
- ❌ No public distribution
- ❌ No commercial use without permission
- ✅ Internal development and testing permitted
- ✅ Client deployments authorized

For licensing inquiries: contact@sizland.com

## 💬 Support & Contact

### Technical Support

**For Bugs & Issues:**
- Create an issue in the GitHub repository
- Email: dev@sizland.com

**For Feature Requests:**
- Submit via GitHub Discussions
- Email: features@sizland.com

### Documentation

**Primary Resources:**
- This README (general overview)
- [Complete System Guide](../COMPLETE_SIZLAND_SYSTEM_GUIDE.md) (full ecosystem)
- [API Documentation](docs/API.md) (API reference)

### Team Contacts

- **Project Lead**: [Your Name]
- **Technical Lead**: [Your Name]
- **DevOps**: [Your Name]
- **Security**: security@sizland.com

## 🎯 Roadmap

### Current Version: 1.0.0

**Completed ✅**
- Landing page with Web3 integration
- Token distribution via Stripe/Paystack
- Automated wallet generation
- ARC-0059 atomic transfers
- Admin dashboard
- Multi-wallet support

**In Progress 🚧**
- Enhanced analytics dashboard
- Mobile app development
- Additional payment gateways
- Multi-language support

**Planned 📋**
- NFT integration for achievements
- DAO governance features
- Cross-chain bridge support
- Advanced smart contract features

See [**Sizland Product Roadmap.pdf**](./Sizland%20Product%20Roadmap.pdf) for detailed roadmap.

## 🙏 Acknowledgments

**Built With:**
- [Next.js](https://nextjs.org/) - React framework
- [Algorand](https://www.algorand.com/) - Blockchain platform
- [Stripe](https://stripe.com/) - Payment processing
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library

**Special Thanks:**
- Algorand Foundation for blockchain support
- CodedThemes for UI inspiration
- The Web3 community for guidance

---

**Made with ❤️ by Finteck Information Systems**

**Last Updated:** November 2025
