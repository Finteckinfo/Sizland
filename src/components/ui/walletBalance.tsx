'use client'

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Typography } from './typography';
import { Button } from './button';
import { WalletIcon, CoinsIcon, AlertCircleIcon } from 'lucide-react';

interface Asset {
  assetId: number;
  amount: number;
  name?: string;
  unitName?: string;
  decimals?: number;
}

interface AccountInfo {
  amount: number;
  minBalance: number;
  assets: Asset[];
}

export const WalletBalance: React.FC = () => {
  const { activeAccount, activeWallet, algodClient } = useWallet();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch account information
  const fetchAccountInfo = async () => {
    if (!activeAccount?.address || !algodClient) return;

    setLoading(true);
    setError(null);

    try {
      const account = await algodClient.accountInformation(activeAccount.address).do();
      
      console.log('Raw account data:', account); // Debug log
      
      // Format the account data with proper BigInt conversion
      const formattedAccount: AccountInfo = {
        amount: Number(account.amount),
        minBalance: Number(account.minBalance || 0),
        assets: account.assets?.map((asset: any) => ({
          assetId: Number(asset['asset-id']),
          amount: Number(asset.amount),
          name: asset.name,
          unitName: asset['unit-name'],
          decimals: asset.decimals
        })) || []
      };

      console.log('Formatted account data:', formattedAccount); // Debug log
      setAccountInfo(formattedAccount);
    } catch (err) {
      console.error('Failed to fetch account info:', err);
      setError('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  // Fetch account info when wallet connects (only on client)
  useEffect(() => {
    if (mounted && activeAccount?.address) {
      fetchAccountInfo();
    } else {
      setAccountInfo(null);
    }
  }, [mounted, activeAccount?.address]);

  // Calculate balances with proper number handling
  const totalAlgoBalance = accountInfo ? accountInfo.amount / 1_000_000 : 0;
  const minBalance = accountInfo ? accountInfo.minBalance / 1_000_000 : 0;
  const availableBalance = Math.max(0, totalAlgoBalance - minBalance);

  // Format number with proper decimals
  const formatNumber = (value: number, decimals: number = 4) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  };

  // Format asset amount
  const formatAssetAmount = (amount: number, decimals: number = 0) => {
    const divisor = Math.pow(10, decimals);
    return formatNumber(amount / divisor, decimals);
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <WalletIcon className="h-6 w-6 text-gray-500" />
          <Typography variant="h3">Wallet Balance</Typography>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Typography variant="paragraph" className="text-gray-500">
            Loading...
          </Typography>
        </div>
      </div>
    );
  }

  if (!activeAccount) {
    return (
      <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <WalletIcon className="h-6 w-6 text-gray-500" />
          <Typography variant="h3">Wallet Balance</Typography>
        </div>
        <div className="text-center py-8">
          <Typography variant="paragraph" className="text-gray-500 mb-4">
            Connect your wallet to view your balance
          </Typography>
          <Button disabled>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <WalletIcon className="h-6 w-6 text-blue-500" />
          <Typography variant="h3">Wallet Balance</Typography>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAccountInfo}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Wallet Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Typography variant="small" className="text-gray-500 mb-1">
          Connected Wallet
        </Typography>
        <Typography variant="paragraph" className="font-mono">
          {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}
        </Typography>
        <Typography variant="small" className="text-gray-500">
          {activeWallet?.metadata?.name || 'Algorand Wallet'}
        </Typography>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Typography variant="paragraph" className="text-gray-500">
            Loading wallet information...
          </Typography>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <Typography variant="paragraph" className="text-red-500 mb-4">
            {error}
          </Typography>
          <Button onClick={fetchAccountInfo} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Balance Information */}
      {accountInfo && !loading && !error && (
        <div className="space-y-6">
          {/* ALGO Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CoinsIcon className="h-5 w-5 text-yellow-500" />
              <Typography variant="h4">ALGO Balance</Typography>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Typography variant="small" className="text-gray-500 mb-1">
                  Total Balance
                </Typography>
                <Typography variant="h4" className="text-blue-600 dark:text-blue-400">
                  {formatNumber(totalAlgoBalance)} ALGO
                </Typography>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Typography variant="small" className="text-gray-500 mb-1">
                  Available
                </Typography>
                <Typography variant="h4" className="text-green-600 dark:text-green-400">
                  {formatNumber(availableBalance)} ALGO
                </Typography>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Typography variant="small" className="text-gray-500 mb-1">
                Minimum Balance (Locked)
              </Typography>
              <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
                {formatNumber(minBalance)} ALGO
              </Typography>
            </div>
          </div>

          {/* Other Assets */}
          {accountInfo.assets.length > 0 && (
            <div className="space-y-3">
              <Typography variant="h4">Other Assets</Typography>
              <div className="space-y-2">
                {accountInfo.assets.map((asset) => (
                  <div 
                    key={asset.assetId} 
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <Typography variant="paragraph" className="font-medium">
                        {asset.name || `Asset ${asset.assetId}`}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        ID: {asset.assetId}
                      </Typography>
                    </div>
                    <Typography variant="paragraph" className="font-mono">
                      {formatAssetAmount(asset.amount, asset.decimals)} {asset.unitName || ''}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Assets Message */}
          {accountInfo.assets.length === 0 && (
            <div className="text-center py-4">
              <Typography variant="paragraph" className="text-gray-500">
                No other assets found in this wallet
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 