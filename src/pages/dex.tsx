// src/pages/dex.tsx
import React from 'react';
import { CandleStickChart } from '@/components/ui/candleStickChart';
import { PageLayout } from '@/components/page-layout';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DexPage = () => {

  return (
    <PageLayout title="DEX - Sizland" description="Trade on Sizland DEX" requireAuth={true}>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/lobby" 
                  className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 drop-shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                  Sizland DEX
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1 drop-shadow-md">
                  Decentralized Exchange with SIZ Live Trading
                </p>
              </div>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Chart - Full width on all screen sizes */}
            <div className="w-full">
              <CandleStickChart />
            </div>

            {/* Market Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-lg shadow p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-lg">
                  24h Volume
                </h3>
                <p className="text-2xl font-bold text-green-400 drop-shadow-lg">
                  $125,430
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 drop-shadow-md">
                  +12.5% from yesterday
                </p>
              </div>
              
              <div className="bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-lg shadow p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-lg">
                  Current Price
                </h3>
                <p className="text-2xl font-bold text-blue-400 drop-shadow-lg">
                  $0.53
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 drop-shadow-md">
                  SIZ/BPL
                </p>
              </div>
              
              <div className="bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-lg shadow p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 drop-shadow-lg">
                  Market Cap
                </h3>
                <p className="text-2xl font-bold text-purple-400 drop-shadow-lg">
                  $2.1M
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 drop-shadow-md">
                  Total market value
                </p>
              </div>
            </div>

            {/* Trading Features */}
            <div className="bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-lg shadow p-6 mt-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 drop-shadow-lg">
                DEX Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-400/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-400/50">
                    <span className="text-green-400 text-sm font-semibold drop-shadow-lg">✓</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 drop-shadow-md">Low Trading Fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-400/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/50">
                    <span className="text-blue-400 text-sm font-semibold drop-shadow-lg">✓</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 drop-shadow-md">Fast Execution</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-400/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-400/50">
                    <span className="text-purple-400 text-sm font-semibold drop-shadow-lg">✓</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 drop-shadow-md">Deep Liquidity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-400/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-orange-400/50">
                    <span className="text-orange-400 text-sm font-semibold drop-shadow-lg">✓</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 drop-shadow-md">Secure Trading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DexPage;
