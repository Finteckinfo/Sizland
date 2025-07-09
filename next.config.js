// next.config.js
// Removed: const { webpackFallback } = require('@txnlab/use-wallet-react')

// Manually define fallbacks if needed. For now, use an empty object.
const webpackFallback = {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ...webpackFallback,
      }
    }
    return config
  },
}

module.exports = nextConfig
