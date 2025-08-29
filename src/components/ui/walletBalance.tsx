'use client'

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Typography } from './typography';
import { Button } from './button';
import { ConnectWalletButton } from './connect-button';
import { WalletIcon, CoinsIcon, AlertCircleIcon, ChevronDownIcon, DownloadIcon, CheckCircleIcon } from 'lucide-react';
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

interface PendingPayment {
  id: string;
  tokenAmount: number;
  paymentStatus: string;
  tokenTransferStatus: string;
  createdAt: string;
  status: string;
  message: string;
  canClaim: boolean;
}

export const WalletBalance: React.FC = () => {
  const { activeAccount, activeWallet, algodClient } = useWallet();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('mainnet');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Get URL parameters for success state
  const [urlParams, setUrlParams] = useState<{ success?: string; tokens?: string }>({});
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

  // Check URL parameters on mount and when component updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const tokens = params.get('tokens');
      
      if (success === 'true' && tokens) {
        setUrlParams({ success, tokens });
        setIsProcessingSuccess(true);
        
        // Simulate processing delay for better UX
        setTimeout(() => {
          setIsProcessingSuccess(false);
          // Refresh payments to get latest status
          if (activeAccount?.address) {
            fetchPendingPayments();
          }
        }, 2000);
      }
    }
  }, [activeAccount?.address]);

  // Get the SIZ asset ID for the selected network
  const getSizAssetId = (network: Network) => {
    return SIZ_ASSET_IDS[network];
  };

  // Create Algorand client for the selected network
  const getAlgorandClient = (network: Network) => {
    const networkConfig = ALGORAND_NETWORKS[network];
    return new algosdk.Algodv2('', networkConfig.algodUrl, '');
  };

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch pending payments for the connected wallet
  const fetchPendingPayments = async () => {
    if (!activeAccount?.address) return;

    try {
      const response = await fetch(`/api/payments/pending?walletAddress=${activeAccount.address}`);
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  // Handle claim functionality
  const handleClaim = async () => {
    if (!activeAccount?.address || pendingPayments.length === 0) return;

    setClaimLoading(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      // Check if there are any payments that can be claimed
      const claimablePayments = pendingPayments.filter(payment => payment.canClaim);
      
      if (claimablePayments.length === 0) {
        setClaimError('No tokens are ready to claim yet. Please wait for the transaction to be confirmed.');
        return;
      }

      // For now, show a helpful message since wallet signing is not yet implemented
      setClaimSuccess('🎉 Claim functionality is coming soon! Your tokens are being processed automatically. Check back in a few minutes to see them in your wallet.');
      
      // TODO: Implement proper wallet signing when the wallet integration is complete
      // The current implementation would require proper wallet signing support
      
      // Refresh pending payments to show updated status
      await fetchPendingPayments();
      
    } catch (error) {
      console.error('Error claiming tokens:', error);
      setClaimError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setClaimLoading(false);
    }
  };

  // Fetch account information using AlgoKit
  const fetchAccountInfo = async () => {
    if (!activeAccount?.address) return;

    setLoading(true);
    setError(null);

    try {
      // Use the recommended approach from Algorand AI agent
      const algodConfig = selectedNetwork === 'testnet'
        ? { server: 'https://testnet-api.algonode.cloud', port: '', token: '' }
        : { server: 'https://mainnet-api.algonode.cloud', port: '', token: '' };

      const algod = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port);
      const account = await algod.accountInformation(activeAccount.address).do();

      const sizAssetId = getSizAssetId(selectedNetwork);

      // Debug: Log account info and assets
      console.log('Account info:', account);
      console.log('Looking for SIZ asset ID:', sizAssetId);
      console.log('Available assets:', account.assets || []);

      // List all tokens for debugging
      const accountAssets = account.assets || [];
      console.log('=== ALL TOKENS IN WALLET ===');
      accountAssets.forEach((asset: any) => {
        console.log('Asset ID:', asset.assetId, 'Amount:', asset.amount);
      });
      console.log('=== END ALL TOKENS ===');

      // Find the SIZ asset in the user's assets using Number() comparison
      const sizAssetRaw = accountAssets.find(
        (asset: any) => Number(asset.assetId) === sizAssetId
      );

      console.log('Found SIZ asset:', sizAssetRaw);

      let amount = 0;
      if (sizAssetRaw) {
        amount = Number(sizAssetRaw.amount);
        console.log('✅ SIZ token found! Amount:', amount);
        console.log('🎉 This should now display in the UI!');
      } else {
        console.log('❌ SIZ token NOT found in wallet assets');
        console.log('This could mean:');
        console.log('1. Wallet is not opted-in to SIZ token on', selectedNetwork);
        console.log('2. SIZ token ID', sizAssetId, 'is incorrect for', selectedNetwork);
        console.log('3. Wallet has no SIZ tokens');
      }

      // Fetch SIZ asset params for better display
      let name, unitName, decimals;
      try {
        const assetInfo = await algod.getAssetByID(sizAssetId).do();
        name = assetInfo.params.name;
        unitName = assetInfo.params.unitName;
        decimals = assetInfo.params.decimals;
      } catch (e) {
        // Fallback values if asset info can't be fetched
        name = 'SIZ Token';
        unitName = 'SIZ';
        decimals = 0;
      }

      const formattedAssets: Asset[] = [{
        assetId: sizAssetId,
        amount,
        name,
        unitName,
        decimals,
      }];

      const formattedAccount: AccountInfo = {
        amount: Number(account.amount),
        minBalance: Number(account.minBalance || 0),
        assets: formattedAssets,
      };

      setAccountInfo(formattedAccount);
    } catch (err) {
      console.error('Error fetching account info:', err);
      setError('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  // Fetch account info when wallet connects or network changes (only on client)
  useEffect(() => {
    if (mounted && activeAccount?.address) {
      fetchAccountInfo();
      fetchPendingPayments();
    } else {
      setAccountInfo(null);
      setPendingPayments([]);
    }
  }, [mounted, activeAccount?.address, selectedNetwork]);

  // Also fetch when the component mounts and wallet is already connected
  useEffect(() => {
    if (mounted && activeAccount?.address && !accountInfo) {
      fetchAccountInfo();
      fetchPendingPayments();
    }
  }, [mounted, activeAccount?.address]);

  // Handle network change
  const handleNetworkChange = (network: Network) => {
    console.log('Switching to network:', network);
    setSelectedNetwork(network);
    setShowNetworkDropdown(false);
    // Clear current account info to force refresh with new network
    setAccountInfo(null);
    setError(null);
    setPendingPayments([]);
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

  // Format SIZ token amount (divide by 100 for 2 decimal places)
  const formatSizTokenAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  // Get only the most recent payment for cleaner UI
  const mostRecentPayment = pendingPayments.length > 0 ? pendingPayments[0] : null;
  
  // Calculate total tokens from all payments for summary
  const totalTokens = pendingPayments.reduce((sum, p) => sum + p.tokenAmount, 0);

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
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-300 p-4 sm:p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <WalletIcon className="h-6 w-6 text-blue-500" />
          <Typography variant="h3">Wallet Balance</Typography>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Claim Button - Only show when there are claimable payments */}
          {pendingPayments.filter(p => p.canClaim).length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleClaim}
              disabled={claimLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
            >
              <DownloadIcon className="h-4 w-4" />
                             {claimLoading ? 'Claiming...' : `Claim ${formatSizTokenAmount(pendingPayments.filter(p => p.canClaim).reduce((sum, p) => sum + p.tokenAmount, 0))} SIZ`}
            </Button>
          )}

          {/* Completed Direct Transfer Button - Show when direct transfers are completed */}
          {pendingPayments.filter(p => p.status === 'completed').length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={true}
              className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-not-allowed"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Completed
            </Button>
          )}

          {/* Pending Status Button - Show when payments are being processed but not yet claimable */}
          {pendingPayments.filter(p => !p.canClaim && p.status !== 'completed').length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={true}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            >
              <AlertCircleIcon className="h-4 w-4" />
              Processing...
            </Button>
          )}

          {/* Network Selector */}
          <div className="relative w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            >
              <span className={`w-2 h-2 rounded-full ${selectedNetwork === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              {selectedNetwork === 'mainnet' ? 'MainNet' : 'TestNet'}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>

            {showNetworkDropdown && (
              <div className="absolute top-full left-0 sm:right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px] w-full sm:w-auto">
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
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Success Processing Loader */}
      {isProcessingSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            <div>
              <Typography variant="paragraph" className="text-green-700 dark:text-green-300 font-medium">
                🎉 Payment Successful! Processing {urlParams.tokens} SIZ tokens...
              </Typography>
              <Typography variant="small" className="text-green-600 dark:text-green-400">
                Your tokens are being transferred to your wallet. This may take a few moments.
              </Typography>
            </div>
          </div>
        </div>
      )}

      {/* Claim Status Messages */}
      {claimSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <Typography variant="paragraph" className="text-green-700 dark:text-green-300">
            {claimSuccess}
          </Typography>
        </div>
      )}

      {claimError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <Typography variant="paragraph" className="text-red-700 dark:text-red-300">
            {claimError}
          </Typography>
        </div>
      )}

      {/* Payment Status - Show different content based on payment state */}
      {mostRecentPayment && (
        <>
          {/* Show congratulatory message when payment is completed */}
          {(mostRecentPayment.status === 'completed' || mostRecentPayment.paymentStatus === 'completed') && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <Typography variant="h4" className="text-green-700 dark:text-green-300 font-bold mb-2">
                  Congratulations!
                </Typography>
                <Typography variant="paragraph" className="text-green-600 dark:text-green-400 mb-3">
                  You've successfully purchased {formatSizTokenAmount(mostRecentPayment.tokenAmount)} SIZ tokens!
                </Typography>
                <Typography variant="small" className="text-green-500 dark:text-green-400 mb-4">
                  Your tokens have been transferred directly to your wallet. You can now use them for trading, staking, or any other SIZ token activities.
                </Typography>
                
                {/* Call to action */}
                <div className="bg-white dark:bg-green-800/30 rounded-lg p-3 border border-green-200 dark:border-green-600">
                  <Typography variant="small" className="text-green-600 dark:text-green-300 font-medium mb-2">
                    💡 Want to grow your SIZ portfolio?
                  </Typography>
                  <Typography variant="small" className="text-green-500 dark:text-green-400">
                    Head back to the main page to purchase more tokens and expand your investment!
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Wallet Info */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Typography variant="small" className="text-gray-500 mb-1">
          Connected Wallet
        </Typography>
        <Typography variant="paragraph" className="font-mono text-sm sm:text-base break-all">
          {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}
        </Typography>
        <Typography variant="small" className="text-gray-500">
          {activeWallet?.metadata?.name || 'Algorand Wallet'} • {selectedNetwork === 'mainnet' ? 'MainNet' : 'TestNet'}
        </Typography>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Typography variant="paragraph" className="text-gray-500">
            Loading wallet information...
          </Typography>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-6 sm:py-8">
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
        <div className="space-y-4 sm:space-y-6">
          {/* SIZ Token */}
          {accountInfo.assets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CoinsIcon className="h-5 w-5 text-green-500" />
                <Typography variant="h4">SIZ Token</Typography>
              </div>
              <div className="space-y-2">
                {accountInfo.assets.map((asset) => (
                  <div
                    key={asset.assetId}
                    className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
                  >
                    <div>
                      <Typography variant="paragraph" className="font-bold text-green-600 dark:text-green-400">
                        {asset.name || 'SIZ Token'}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        Asset ID: {asset.assetId}
                      </Typography>
                    </div>
                    <div className="text-left sm:text-right">
                                             <Typography variant="h4" className="font-bold text-green-600 dark:text-green-400">
                         {formatSizTokenAmount(asset.amount)} {asset.unitName || 'SIZ'}
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
            <div className="text-center py-4 sm:py-6">
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Typography variant="paragraph" className="text-gray-500 mb-2">
                  No SIZ tokens found in this wallet
                </Typography>
                <Typography variant="small" className="text-gray-400">
                  Switch networks to view SIZ tokens on different networks
                </Typography>
              </div>
            </div>
          )}

          {/* ALGO Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CoinsIcon className="h-5 w-5 text-yellow-500" />
              <Typography variant="h4">ALGO Balance</Typography>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
        </div>
      )}
    </div>
  );
}; 