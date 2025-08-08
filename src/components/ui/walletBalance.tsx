'use client'

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Typography } from './typography';
import { Button } from './button';
import { WalletIcon, CoinsIcon, AlertCircleIcon, ChevronDownIcon } from 'lucide-react';
import algosdk from 'algosdk';
import { SIZ_ASSET_IDS, ALGORAND_NETWORKS, type Network } from '@/lib/config';

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
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('testnet');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  // Create Algorand client for the selected network
  const getAlgorandClient = (network: Network) => {
    const networkConfig = ALGORAND_NETWORKS[network];
    return new algosdk.Algodv2('', networkConfig.algodUrl, '');
  };

  // Get the SIZ asset ID for the selected network
  const getSizAssetId = (network: Network) => {
    return SIZ_ASSET_IDS[network];
  };

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch account information
  const fetchAccountInfo = async () => {
    if (!activeAccount?.address) return;

    setLoading(true);
    setError(null);

    try {
      const client = getAlgorandClient(selectedNetwork);
      const account = await client.accountInformation(activeAccount.address).do();

      const sizAssetId = getSizAssetId(selectedNetwork);

      // Find the SIZ asset in the user's assets
      const sizAssetRaw = (account.assets || []).find(
        (asset: any) => Number(asset['asset-id']) === sizAssetId
      );

      let amount = 0;
      if (sizAssetRaw) {
        amount = Number(sizAssetRaw.amount);
      }

      // Always fetch SIZ asset params
      let name, unitName, decimals;
      try {
        const assetInfo = await client.getAssetByID(sizAssetId).do();
        name = assetInfo.params.name;
        unitName = assetInfo.params.unitName;
        decimals = assetInfo.params.decimals;
      } catch (e) {
        name = undefined;
        unitName = undefined;
        decimals = 0;
      }

      const assets: Asset[] = [{
        assetId: sizAssetId,
        amount,
        name,
        unitName,
        decimals,
      }];

      const formattedAccount: AccountInfo = {
        amount: Number(account.amount),
        minBalance: Number(account.minBalance || 0),
        assets,
      };

      setAccountInfo(formattedAccount);
    } catch (err) {
      setError('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  // Fetch account info when wallet connects or network changes (only on client)
  useEffect(() => {
    if (mounted && activeAccount?.address) {
      fetchAccountInfo();
    } else {
      setAccountInfo(null);
    }
  }, [mounted, activeAccount?.address, selectedNetwork]);

  // Handle network change
  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network);
    setShowNetworkDropdown(false);
    // Clear current account info to force refresh with new network
    setAccountInfo(null);
  };

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
        <div className="flex items-center gap-2">
          {/* Network Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              className="flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${selectedNetwork === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              {selectedNetwork === 'mainnet' ? 'MainNet' : 'TestNet'}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>

            {showNetworkDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => handleNetworkChange('testnet')}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    selectedNetwork === 'testnet' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  TestNet
                </button>
                <button
                  onClick={() => handleNetworkChange('mainnet')}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    selectedNetwork === 'mainnet' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  MainNet
                </button>
              </div>
            )}
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
          {activeWallet?.metadata?.name || 'Algorand Wallet'} • {selectedNetwork === 'mainnet' ? 'MainNet' : 'TestNet'}
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

          {/* SIZ Token */}
          {accountInfo.assets.length > 0 && (
            <div className="space-y-3">
              <Typography variant="h4">SIZ Token</Typography>
              <div className="space-y-2">
                {accountInfo.assets.map((asset) => (
                  <div
                    key={asset.assetId}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 flex justify-between items-center"
                  >
                    <div>
                      <Typography variant="paragraph" className="font-bold text-blue-600 dark:text-blue-400">
                        {asset.name || 'SIZ Token'}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        Asset ID: {asset.assetId}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                        {formatAssetAmount(asset.amount, asset.decimals)} {asset.unitName || 'SIZ'}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        SIZ Token Balance
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No SIZ Tokens Message */}
          {accountInfo.assets.length === 0 && (
            <div className="text-center py-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Typography variant="paragraph" className="text-gray-500 mb-2">
                  No SIZ tokens found in this wallet
                </Typography>
                <Typography variant="small" className="text-gray-400">
                  Switch networks to view SIZ tokens on different networks
                </Typography>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 