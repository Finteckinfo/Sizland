'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Typography } from './typography';
import { Wallet, Loader2, CheckCircle } from 'lucide-react';
import { generateAlgorandWallet, storeWallet, type GeneratedWallet } from '@/lib/algorand/walletGenerator';
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { useRouter } from 'next/router'

interface WalletGeneratorProps {
  onWalletGenerated?: (wallet: GeneratedWallet) => void;
}

export const WalletGenerator: React.FC<WalletGeneratorProps> = ({ onWalletGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { wallets } = useWallet()
  const router = useRouter()

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    setSuccess(null);

    try {
      const wallet = generateAlgorandWallet();
      setGeneratedWallet(wallet);

      // Store wallet locally for the custom provider to pick up
      storeWallet(wallet);

      // Try to auto-connect the custom provider without reloading
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM)
        if (customWallet) {
          await customWallet.connect()
        }
      } catch (_) {
        // ignore auto-connect failures; user can connect manually later
      }

      onWalletGenerated?.(wallet);
      setSuccess('Wallet generated successfully!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-6 w-6 text-green-500" />
        <Typography variant="h3">Generate New Wallet</Typography>
      </div>

      {!generatedWallet ? (
        <div className="space-y-6">
          <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new Algorand wallet locally in your browser. No credentials are sent anywhere.
          </Typography>

          <Button
            onClick={handleGenerateWallet}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating Wallet...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Generate Wallet
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <Typography variant="h4" className="text-green-800 dark:text-green-200">
                Wallet Generated Successfully!
              </Typography>
              {success && (
                <Typography variant="small" className="text-green-600 dark:text-green-400">
                  {success}
                </Typography>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Typography variant="small" className="text-gray-500 mb-1">
                Wallet Address
              </Typography>
              <Typography variant="paragraph" className="font-mono text-sm break-all">
                {generatedWallet.address}
              </Typography>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Typography variant="small" className="text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>⚠️ Important:</strong>
              </Typography>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Save your private key and recovery phrase securely</li>
                <li>• Never share these credentials with anyone</li>
                <li>• Your wallet is now connected and ready to use</li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/new-wallet')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              New Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
