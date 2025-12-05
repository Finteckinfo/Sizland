// src/pages/wallet.tsx
import React, { useState, useEffect } from 'react';
import { OrderCard } from '@/components/ui/orderCard';
import { TradeCard } from '@/components/ui/tradeCard';
import { CandleStickChart } from '@/components/ui/candleStickChart';
import { WalletBalance } from '@/components/ui/walletBalance';
import Tokenomics from '@/components/tokenomics';
import { AuroraText } from '@/components/ui/aurora-text';
import { useTheme } from 'next-themes';

import { PageLayout } from '@/components/page-layout';
import { useWallet } from '@txnlab/use-wallet-react';

const dummyOrders = [
  { price: '0.45', amount: '100', total: '45' },
  { price: '0.50', amount: '200', total: '100' },
  { price: '0.48', amount: '150', total: '72' },
  { price: '0.55', amount: '300', total: '165' },
  { price: '0.47', amount: '120', total: '56.4' },
  { price: '0.52', amount: '180', total: '93.6' },
  { price: '0.49', amount: '220', total: '107.8' },
  { price: '0.53', amount: '90', total: '47.7' },
  { price: '0.49', amount: '220', total: '107.8' },
  { price: '0.53', amount: '90', total: '47.7' },
  { price: '0.49', amount: '220', total: '107.8' },
];

// Basic placeholder chart options
const candleChartOptions = {
  rangeSelector: {
    selected: 1
  },
  title: {
    text: 'SIZ/BPL Market'
  },
  series: [
    {
      type: 'candlestick',
      name: 'SIZ/BPL',
      data: [
        [Date.UTC(2025, 6, 17), 0.45, 0.55, 0.42, 0.5],
        [Date.UTC(2025, 6, 18), 0.48, 0.52, 0.46, 0.51],
        [Date.UTC(2025, 6, 19), 0.51, 0.54, 0.49, 0.53],
        [Date.UTC(2025, 6, 20), 0.52, 0.56, 0.50, 0.55],
      ],
      tooltip: {
        valueDecimals: 2
      }
    }
  ]
};

const WalletPage = () => {
  const { activeAccount } = useWallet();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout title="Trade" description="Trade with Sizland">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Wallet Title Section */}
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <AuroraText>Wallet</AuroraText>
            </h1>
          </div>
        </div>

        {/* Wallet Balance Section */}
        <div className="w-full">
          <WalletBalance />
        </div>

        
        {/* Trading Section */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Buy Order - Left side on desktop */}
          <div className="w-full lg:w-1/4">
            <OrderCard type="buy" data={dummyOrders} />
          </div>
          
          {/* Quick Trade - Center on desktop */}
          <div className="w-full lg:w-1/2">
            <TradeCard />
          </div>
          
          {/* Sell Order - Right side on desktop */}
          <div className="w-full lg:w-1/4">
            <OrderCard type="sell" data={dummyOrders} />
          </div>
        </div>
        
        {/* Tokenomics Section */}
        <div className="w-full">
          <Tokenomics />
        </div>
        
        {/* Chart - Full width on all screen sizes */}
        <div className="w-full">
          <CandleStickChart />
        </div>
      </div>
    </PageLayout>
  );
};

export default WalletPage; 