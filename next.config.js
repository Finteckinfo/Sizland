// next.config.js
const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
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
