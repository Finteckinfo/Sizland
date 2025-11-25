'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Typography } from './typography';
import { Lock, Unlock, Loader2, AlertTriangle } from 'lucide-react';
import { 
  unlockWallet, 
  recoverAlgorandWallet,
  storeWallet,
  hasEncryptedWallet,
  type GeneratedWallet 
} from '@/lib/algorand/walletGenerator';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { useRouter } from 'next/router';

interface WalletUnlockProps {
  onUnlocked?: (wallet: GeneratedWallet) => void;
}

export const WalletUnlock: React.FC<WalletUnlockProps> = ({ onUnlocked }) => {
  const [method, setMethod] = useState<'password' | 'phrase'>('password');
  const [password, setPassword] = useState('');
  const [phrase, setPhrase] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallet();
  const router = useRouter();

  const hasEncrypted = hasEncryptedWallet();

  const handleUnlockWithPassword = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      const wallet = await unlockWallet(password);
      
      if (!wallet) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Store unencrypted wallet for session
      storeWallet(wallet);

      // Try to auto-connect
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM);
        if (customWallet) {
          await customWallet.connect();
        }
      } catch (_) {
        // ignore auto-connect failures
      }

      onUnlocked?.(wallet);
      router.push('/wallet');
    } catch (err) {
      setError('Failed to unlock wallet. Please check your password.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleUnlockWithPhrase = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      const cleanPhrase = phrase.trim();
      const wordCount = cleanPhrase.split(/\s+/).length;

      if (wordCount !== 25) {
        setError('Recovery phrase must be exactly 25 words.');
        return;
      }

      const wallet = recoverAlgorandWallet(cleanPhrase);

      // Store recovered wallet
      storeWallet(wallet);

      // Try to auto-connect
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM);
        if (customWallet) {
          await customWallet.connect();
        }
      } catch (_) {
        // ignore auto-connect failures
      }

      onUnlocked?.(wallet);
      router.push('/wallet');
    } catch (err) {
      setError('Invalid recovery phrase. Please check your 25 words and try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!hasEncrypted) {
    return (
      <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <Typography variant="h3">No Wallet Found</Typography>
        </div>
        <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have an encrypted wallet yet. Please create a new wallet first.
        </Typography>
        <Button onClick={() => router.push('/')} className="w-full">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-6 w-6 text-blue-500" />
        <Typography variant="h3">Unlock Your Wallet</Typography>
      </div>

      {/* Method Selection */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={method === 'password' ? 'default' : 'outline'}
          onClick={() => setMethod('password')}
          className="flex-1"
        >
          Password
        </Button>
        <Button
          variant={method === 'phrase' ? 'default' : 'outline'}
          onClick={() => setMethod('phrase')}
          className="flex-1"
        >
          Recovery Phrase
        </Button>
      </div>

      {method === 'password' ? (
        <div className="space-y-4">
          <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
            Enter your password to unlock your wallet.
          </Typography>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlockWithPassword()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <Typography variant="small" className="text-red-600 dark:text-red-400">
                {error}
              </Typography>
            </div>
          )}

          <Button
            onClick={handleUnlockWithPassword}
            disabled={isUnlocking || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 mr-2" />
                Unlock Wallet
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
            Enter your 25-word recovery phrase to restore access to your wallet.
          </Typography>

          <div>
            <label className="block text-sm font-medium mb-2">
              Recovery Phrase (25 words)
            </label>
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter your 25-word recovery phrase separated by spaces"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <Typography variant="small" className="text-red-600 dark:text-red-400">
                {error}
              </Typography>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Typography variant="small" className="text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Note:</strong> Your recovery phrase must be exactly 25 words in the correct order.
            </Typography>
          </div>

          <Button
            onClick={handleUnlockWithPhrase}
            disabled={isUnlocking || !phrase}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Recovering...
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 mr-2" />
                Recover Wallet
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
