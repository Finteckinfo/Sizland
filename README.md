# SIZ.land - Web3 Token Distribution Platform

Live Demo: [https://siz.land](https://siz.land)

A comprehensive Next.js Web3 application for the SIZ token ecosystem, featuring Algorand blockchain integration, automated token distribution, wallet management, and payment processing via Stripe and Paystack. Built with TypeScript, Next.js, and modern Web3 technologies.

## Overview

SIZ.land serves as the primary frontend for the SIZ token ecosystem, providing users with seamless token purchasing, wallet creation, and blockchain interaction capabilities. The platform integrates with Algorand blockchain for secure token distribution using ARC-0059 atomic transfers, supports multiple wallet providers, and includes comprehensive admin tools for token inventory management.

## Key Features

### Blockchain Integration
- **Algorand Network**: Full integration with Algorand blockchain for SIZ token operations
- **ARC-0059 Atomic Transfers**: Secure, automated token distribution using Algorand smart contracts
- **Multi-Wallet Support**: Compatible with Pera Wallet, Defly, Lute Connect, and WalletConnect
- **Direct Transfer Fallback**: Automatic fallback to direct transfers if atomic transfer fails
- **Transaction Monitoring**: Real-time transaction status tracking and confirmations
- **ASA (Algorand Standard Asset)**: Full support for SIZ token as an ASA

### Token Purchase & Distribution
- **Fiat Payment Processing**: Stripe and Paystack integration for token purchases
- **Automated Wallet Generation**: Server-side wallet creation for new users
- **Token Claiming System**: Secure token claiming with email verification
- **Batch Distribution**: Efficient batch token transfers for multiple recipients
- **Inventory Management**: Real-time tracking of available token supply
- **Purchase History**: Complete transaction history for all users

### Authentication & Security
- **Multiple Auth Methods**: 
  - Wallet-based authentication (SIWE - Sign-In With Ethereum)
  - Email/password authentication
  - NextAuth integration for SSO
- **Secure Wallet Storage**: Encrypted wallet mnemonic storage
- **Session Management**: Secure session handling with JWT tokens
- **Admin Access Control**: Role-based access for administrative functions
- **Database Security**: PostgreSQL with SSL support

### User Experience
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Dark/Light Theme**: Built-in theme toggle for user preference
- **Wallet Dashboard**: Complete wallet management interface
- **Transaction History**: Detailed transaction logs and status updates
- **Real-time Notifications**: User feedback for all blockchain operations
- **Progressive Web App**: PWA support with offline capabilities

### Admin Features
- **Token Inventory Dashboard**: Real-time token supply monitoring
- **User Management**: Admin interface for user account management
- **Transaction Monitoring**: Track all token distributions and purchases
- **Database Tools**: SQL query interface for data management
- **Analytics**: Purchase trends and user statistics

### Content Pages
- **Landing Page**: Hero section with features, about, and roadmap
- **Whitepaper**: Comprehensive SIZ ecosystem documentation
- **Blog**: Content management system for updates and news
- **DEX Information**: Decentralized exchange integration details
- **Privacy & Terms**: Legal documentation

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

## Prerequisites

- Node.js 18+ (or Bun for faster performance)
- PostgreSQL database
- Stripe account (for payment processing)
- Algorand wallet with funding account
- SIZ token ASA deployed on Algorand
- ARC-0059 router application deployed

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Finteckinfo/next-web3-template-main.git
cd next-web3-template-main
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the following required variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
DB_SSL=disable  # or "require" for production

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Algorand Blockchain Configuration
ALGORAND_NETWORK_URL=https://mainnet-api.algonode.cloud
ALGORAND_NETWORK_TOKEN=  # Usually empty for public nodes
ALGOD_URL=https://mainnet-api.algonode.cloud

# SIZ Token Configuration
SIZ_TOKEN_ASSET_ID=your_token_asset_id
CENTRAL_WALLET_ADDRESS=your_central_wallet_address
CENTRAL_WALLET_MNEMONIC=your 25 word mnemonic phrase

# ARC-0059 Router Configuration
ARC59_APP_ID=your_arc59_application_id
UNFREEZE_ACCOUNT_ADDRESS=your_freeze_manager_address
UNFREEZE_ACCOUNT_MNEMONIC=your freeze manager 25 word mnemonic

# Testing (optional)
TEST_RECEIVER_ADDRESS=test_wallet_address
TEST_RECEIVER_MNEMONIC=test wallet 25 word mnemonic
```

### 4. Database Setup

Run the database initialization script:

```bash
npm run setup:db
```

This will create the necessary tables:
- `purchases`: Token purchase records
- `webhooks`: Webhook event logs
- `users`: User accounts
- `wallets`: Generated wallet information

### 5. Start Development Server

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:3000`.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run typecheck        # TypeScript type checking

# Database Management
npm run setup:db         # Initialize database tables
npm run init:inventory   # Set up token inventory
npm run fix:schema       # Fix database schema issues
npm run check:db         # Check database connection
npm run create:tables    # Create missing tables

# Testing & Debugging
npm run test:arc59              # Test ARC-0059 integration
npm run test:payment            # Test payment flow
npm run test:wallet-claim       # Test wallet claiming
npm run test:paystack           # Test Paystack integration
npm run test:webhook-flow       # Test webhook processing
npm run debug:production        # Debug production issues
npm run debug:webhook           # Debug webhook integration
```

### Project Structure

```
siz.land/
├── public/                      # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                     # Next.js App Router pages
│   ├── assets/                  # Images and icons
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── navigation/          # Navigation components
│   │   ├── hero.tsx             # Landing hero section
│   │   ├── features.tsx         # Features section
│   │   ├── roadmap.tsx          # Product roadmap
│   │   └── ...
│   ├── config/                  # Configuration files
│   ├── context/                 # React context providers
│   ├── lib/                     # Utility functions
│   │   ├── algorand/            # Algorand integration
│   │   ├── stripe/              # Stripe integration
│   │   ├── db/                  # Database utilities
│   │   └── utils.ts
│   ├── pages/                   # Next.js Pages Router
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── admin/           # Admin endpoints
│   │   │   ├── user/            # User endpoints
│   │   │   ├── generateWallet.ts
│   │   │   └── wallet.ts
│   │   ├── admin/               # Admin dashboard
│   │   ├── index.tsx            # Homepage
│   │   ├── wallet.tsx           # Wallet dashboard
│   │   ├── wallet-auth.tsx      # Wallet authentication
│   │   ├── new-wallet.tsx       # Wallet creation
│   │   ├── login.tsx            # Login page
│   │   ├── signup.tsx           # Registration page
│   │   ├── dex.tsx              # DEX information
│   │   ├── blog.tsx             # Blog page
│   │   ├── whitepaper.tsx       # Whitepaper
│   │   └── ...
│   ├── providers/               # Context providers
│   ├── styles/                  # Global styles
│   ├── types/                   # TypeScript types
│   └── wagmi.ts                 # Wagmi configuration
├── scripts/                     # Utility scripts
│   ├── test-arc59-integration.ts
│   ├── test-payment-flow.ts
│   ├── setup-database.ts
│   └── ...
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (gitignored)
├── components.json              # Shadcn configuration
├── middleware.ts                # Next.js middleware
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # Documentation
```

## Core Features Documentation

### Token Purchase Flow

1. **User Initiates Purchase**
   - User selects token amount on landing page
   - Stripe checkout session created
   - User redirected to Stripe payment page

2. **Payment Processing**
   - Stripe processes payment
   - Webhook received at `/api/webhooks/stripe`
   - Payment verified and recorded in database

3. **Wallet Generation**
   - Server generates new Algorand wallet
   - Wallet address and encrypted mnemonic stored
   - Wallet info sent to user via email

4. **Token Distribution**
   - User claims wallet using email link
   - ARC-0059 atomic transfer initiated
   - Tokens transferred to user's wallet
   - Transaction confirmed on blockchain

### Wallet Authentication

Users can authenticate using two methods:

**Wallet-Based Authentication**:
```typescript
// Connect wallet using any supported provider
const { wallets, activeAccount } = useWallet();
// Sign message to verify ownership
const signature = await signMessage(message);
// Authenticate with backend
```

**Email/Password Authentication**:
```typescript
// Traditional authentication flow
await signIn('credentials', { email, password });
```

### ARC-0059 Integration

The platform uses ARC-0059 for secure atomic transfers:

```typescript
// Atomic transfer with ARC-0059
const txn = await makeAtomicTransferTxn({
  from: centralWallet,
  to: recipientAddress,
  amount: tokenAmount,
  assetId: SIZ_TOKEN_ASSET_ID,
  appId: ARC59_APP_ID
});
```

Fallback to direct transfer if atomic transfer fails:
```typescript
// Direct ASA transfer
const txn = await makeAssetTransferTxn({
  from: centralWallet,
  to: recipientAddress,
  amount: tokenAmount,
  assetId: SIZ_TOKEN_ASSET_ID
});
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

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Update the following for production deployment:

- Change `ALGORAND_NETWORK_URL` to mainnet
- Use production Stripe keys
- Enable SSL for database (`DB_SSL=require`)
- Set strong secrets for wallet encryption
- Configure production domain in CORS settings

### Deployment Platforms

**Netlify** (Configured):
```bash
# Deploy using Netlify CLI
netlify deploy --prod
```

**Vercel**:
```bash
# Deploy using Vercel CLI
vercel --prod
```

**Manual Deployment**:
```bash
npm run build
npm start
```

### Webhook Configuration

Configure webhooks in payment provider dashboards:

**Stripe**:
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

**Paystack**:
- Endpoint: `https://yourdomain.com/api/webhooks/paystack`
- Events: `charge.success`

## Security Considerations

- All wallet mnemonics are encrypted before storage
- Use environment variables for all sensitive data
- Enable database SSL in production
- Implement rate limiting on API endpoints
- Validate all webhook signatures
- Use HTTPS in production
- Regular security audits recommended
- Keep dependencies updated

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

## Related Documentation

- `ARC59_INTEGRATION.md` - Detailed ARC-0059 integration guide
- `STRIPE_INTEGRATION.md` - Stripe payment setup
- `PAYSTACK_INTEGRATION.md` - Paystack integration guide
- `WALLET_GENERATION.md` - Wallet creation documentation
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch checklist
- `PRODUCTION_TROUBLESHOOTING.md` - Common production issues
- `Admin-README.md` - Admin dashboard guide
- `COMPLETE_INTEGRATION_GUIDE.md` - End-to-end integration guide
