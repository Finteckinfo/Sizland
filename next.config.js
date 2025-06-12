// next.config.js
const { webpackFallback } = require('@txnlab/use-wallet-react')

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
