'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PageLayout } from '@/components/page-layout';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { loadWallet, clearWallet, type GeneratedWallet } from '@/lib/algorand/walletGenerator';
import { Copy, CheckCircle, AlertTriangle, Shield, Download, Trash2 } from 'lucide-react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';

const NewWalletPage = () => {
  const router = useRouter();
  const { activeAccount, activeWallet, wallets } = useWallet();
  const [wallet, setWallet] = useState<GeneratedWallet | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedWallet = loadWallet();
    if (storedWallet) {
      setWallet(storedWallet);
    } else {
      // Redirect to home if no wallet is found
      router.push('/');
    }
  }, [router]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadCredentials = () => {
    if (!wallet) return;

    const credentials = `Sizland Wallet Credentials

Address: ${wallet.address}
Private Key (Base64): ${wallet.privateKey}
Mnemonic (25 words): ${wallet.mnemonic}

IMPORTANT: Keep these credentials secure and never share them with anyone.
You can use the mnemonic to recover your wallet if needed.

Generated on: ${new Date().toLocaleString()}
`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sizland-wallet-credentials.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearWallet = () => {
    if (confirm('Are you sure you want to clear this wallet? This action cannot be undone.')) {
      clearWallet();
      setWallet(null);
      
      // Notify navbar that wallet has been cleared
      window.dispatchEvent(new CustomEvent('walletCleared'));
      
      router.push('/');
    }
  };

  const isWalletConnected = activeAccount && activeWallet?.metadata?.name === 'Generated Wallet';

  const handleManualConnect = async () => {
    try {
      const customWallet = wallets.find((w: any) => w.id === WalletId.CUSTOM);
      if (customWallet) {
        await customWallet.connect();
      }
    } catch (error) {
      console.error('Manual connection failed:', error);
    }
  };

  if (!mounted) {
    return (
      <PageLayout
        title="Loading..."
        description="Loading wallet information"
        justify="center"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (!wallet) {
    return (
      <PageLayout
        title="No Wallet Found"
        description="No generated wallet found. Please create a new wallet first."
        justify="center"
      >
        <div className="flex flex-col items-center gap-6 py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <Typography variant="paragraph" className="text-center text-gray-600 dark:text-gray-400">
            No wallet credentials found. Please generate a new wallet first.
          </Typography>
          <Button onClick={() => router.push('/')}>
            Go Back Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Your New Wallet"
      description="Your Sizland wallet has been created successfully. Keep these credentials safe!"
      justify="start"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <Typography variant="h1" className="text-green-600 dark:text-green-400">
            Wallet Created Successfully!
          </Typography>
          <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your Sizland wallet has been generated and is ready to use. The credentials have been sent to your email.
            Keep this information secure - you'll need it to access your wallet.
          </Typography>
        </div>

        {/* Connection Status */}
        <div className={`p-4 rounded-lg border-2 ${
          isWalletConnected 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isWalletConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <Typography variant="paragraph" className="font-medium">
                {isWalletConnected 
                  ? '✅ Wallet is connected and ready to use!' 
                  : '⚠️ Wallet is not connected. Please connect it to start using.'
                }
              </Typography>
            </div>
            {!isWalletConnected && (
              <Button
                onClick={handleManualConnect}
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Wallet Credentials */}
        <div className="space-y-6">
          {/* Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                Wallet Address
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(wallet.address, 'address')}
                className="flex items-center gap-2"
              >
                {copied === 'address' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Typography variant="paragraph" className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {wallet.address}
              </Typography>
            </div>
          </div>

          {/* Private Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                Private Key (Base64)
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(wallet.privateKey, 'privateKey')}
                className="flex items-center gap-2"
              >
                {copied === 'privateKey' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <Typography variant="paragraph" className="font-mono text-xs break-all text-red-800 dark:text-red-200">
                {wallet.privateKey}
              </Typography>
            </div>
          </div>

          {/* Mnemonic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                Recovery Phrase (25 words)
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(wallet.mnemonic, 'mnemonic')}
                className="flex items-center gap-2"
              >
                {copied === 'mnemonic' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <Typography variant="paragraph" className="font-mono text-sm break-words text-orange-800 dark:text-orange-200 leading-relaxed">
                {wallet.mnemonic}
              </Typography>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <Typography variant="h4" className="text-yellow-800 dark:text-yellow-200">
                ⚠️ Security Warning
              </Typography>
              <Typography variant="paragraph" className="text-yellow-700 dark:text-yellow-300">
                <strong>Never share your private key or recovery phrase with anyone!</strong> These credentials give full access to your wallet. 
                Store them securely and consider backing them up in multiple safe locations. You can use the recovery phrase to restore your wallet if needed.
              </Typography>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadCredentials}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Credentials
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/wallet')}
            className="flex items-center gap-2"
          >
            Go to Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            Back to Home
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearWallet}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Wallet
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NewWalletPage;
