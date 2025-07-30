// src/pages/wallet.tsx
import React from 'react';
import { OrderCard } from '@/components/ui/orderCard';
import { TradeCard } from '@/components/ui/tradeCard';
import { CandleStickChart } from '@/components/ui/candleStickChart';
import { WalletBalance } from '@/components/ui/walletBalance';
import { PageLayout } from '@/components/page-layout';

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
  return (
    <PageLayout title="Trade" description="Trade with Sizland">
      <div className="p-6 space-y-6">
        {/* Wallet Balance Section */}
        <div className="w-full">
          <WalletBalance />
        </div>
        
        {/* Trading Section */}
        <div className="flex gap-4">
          <div className="w-1/4">
            <OrderCard type="sell" data={dummyOrders} />
          </div>
          <div className="w-1/4">
            <OrderCard type="buy" data={dummyOrders} />
          </div>
          <div className="w-1/2">
            <TradeCard />
          </div>
        </div>
        <CandleStickChart />
      </div>
    </PageLayout>
  );
};

export default WalletPage; 