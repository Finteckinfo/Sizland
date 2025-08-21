// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude scripts directory from build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude scripts directory from webpack compilation
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent scripts from being included in the build
      'scripts': false,
    };
    
    return config;
  },
  
  // Exclude scripts from TypeScript compilation
  typescript: {
    // This will be ignored during build
    ignoreBuildErrors: false,
  },
  
  // Experimental features
  experimental: {
    // Optimize build performance
    optimizePackageImports: ['@algorandfoundation/algokit-utils'],
  },
};

module.exports = nextConfig;
