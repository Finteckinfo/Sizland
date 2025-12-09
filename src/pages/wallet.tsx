// src/pages/wallet.tsx
import React, { useState, useEffect } from 'react';
import { WalletBalance } from '@/components/ui/walletBalance';
import { AuroraText } from '@/components/ui/aurora-text';
import { useTheme } from 'next-themes';

import { PageLayout } from '@/components/page-layout';
import { useWallet } from '@txnlab/use-wallet-react';


const WalletPage = () => {
  const { activeAccount } = useWallet();
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout 
      title="Sizland Wallet - Manage Your Crypto Assets" 
      description="Trade, manage, and track your SIZ tokens and other crypto assets on the Sizland platform. View your wallet balance, place orders, and access tokenomics data."
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Wallet Title Section */}
        <div className="w-full">
          <div className="mb-12 sm:mb-16 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <AuroraText>Wallet</AuroraText>
            </h1>
          </div>
        </div>

        {/* Wallet Balance Section */}
        <div className="w-full">
          <WalletBalance />
        </div>
      </div>
    </PageLayout>
  );
};

export default WalletPage; 