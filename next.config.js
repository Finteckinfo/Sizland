// next.config.js
const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const SIZLAND_WALLET_URL =
  process.env.NEXT_PUBLIC_SIZLAND_WALLET_URL || 'https://wallet.siz.land';

const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  async redirects() {
    const walletDest = SIZLAND_WALLET_URL;
    const legacyWalletPaths = [
      '/wallet',
      '/new-wallet',
      '/unlock-wallet',
      '/wallet-auth',
    ];
    return legacyWalletPaths.map((source) => ({
      source,
      destination: walletDest,
      permanent: false,
    }));
  },
  async rewrites() {
    return {
      // beforeFiles runs BEFORE filesystem - required so root / doesn't match index first
      beforeFiles: [
        {
          source: '/',
          destination: '/solutions',
          has: [{ type: 'host', value: 'solutions.siz.land' }],
        },
        {
          source: '/ratecard',
          destination: '/ratecard',
          has: [{ type: 'host', value: 'solutions.siz.land' }],
        },
        {
          source: '/',
          destination: '/buy-land',
          has: [{ type: 'host', value: 'buy.siz.land' }],
        },
        {
          source: '/',
          destination: '/mytab',
          has: [{ type: 'host', value: 'mytab.siz.land' }],
        },
      ],
      // Subpaths on solutions.siz.land (exclude /api via middleware - no catch-all here to avoid breaking APIs)
      afterFiles: [],
    };
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    // Stub RN-only/optional deps required by some web SDKs
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    // Fix ESM resolution for nested dependencies (zustand/middleware, zustand/vanilla)
    // Ensure proper module resolution for ESM packages
    config.resolve.fullySpecified = false;
    
    // Use top-level zustand instead of nested one in @wagmi/core and @base-org/account
    const zustandPath = path.resolve(__dirname, 'node_modules', 'zustand');
    config.resolve.alias['zustand'] = zustandPath;
    config.resolve.alias['zustand/vanilla'] = path.join(zustandPath, 'vanilla.js');
    config.resolve.alias['zustand/middleware'] = path.join(zustandPath, 'middleware.js');
    
    // Use NormalModuleReplacementPlugin as a fallback for more reliable resolution
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^zustand\/vanilla$/,
        path.join(zustandPath, 'vanilla.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^zustand\/middleware$/,
        path.join(zustandPath, 'middleware.js')
      )
    );
    
    return config;
  },
  // CRITICAL FIX: Ensure webhook routes work properly and enable CORS for SSO
  async headers() {
    return [
      {
        source: '/api/stripe-webhook',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Note: CORS with credentials requires dynamic origin handling in API routes
      // Static headers here cannot use wildcards with credentials
      // The actual CORS handling is done in the API route handlers
    ];
  },
};

module.exports = nextConfig;
