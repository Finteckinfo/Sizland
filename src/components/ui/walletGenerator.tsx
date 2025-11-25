'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Typography } from './typography';
import { Wallet, Loader2, CheckCircle } from 'lucide-react';
import { generateAlgorandWallet, storeWallet, encryptWalletWithPassword, storeEncryptedWallet, type GeneratedWallet } from '@/lib/algorand/walletGenerator';
import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { useRouter } from 'next/router'

interface WalletGeneratorProps {
  onWalletGenerated?: (wallet: GeneratedWallet) => void;
}

export const WalletGenerator: React.FC<WalletGeneratorProps> = ({ onWalletGenerated }) => {
  const [step, setStep] = useState<'start' | 'password' | 'complete'>('start');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const { wallets } = useWallet()
  const router = useRouter()

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    setSuccess(null);

    try {
      const wallet = generateAlgorandWallet();
      setGeneratedWallet(wallet);
      
      // Move to password creation step
      setStep('password');
      setSuccess('Wallet generated! Now create a password to protect it.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetPassword = async () => {
    if (!generatedWallet) return;
    
    // Validate password
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    setIsGenerating(true);
    
    try {
      // Encrypt and store wallet with password
      const encryptedWallet = await encryptWalletWithPassword(generatedWallet, password);
      storeEncryptedWallet(encryptedWallet);
      
      // Also store unencrypted for immediate use (will be cleared on page refresh)
      storeWallet(generatedWallet);

      // Try to auto-connect the custom provider without reloading
      try {
        const customWallet = wallets.find(w => w.id === WalletId.CUSTOM)
        if (customWallet) {
          await customWallet.connect()
        }
      } catch (_) {
        // ignore auto-connect failures; user can connect manually later
      }

      onWalletGenerated?.(generatedWallet);
      setStep('complete');
      setSuccess('Wallet created and secured with password!');
    } catch (error) {
      console.error('Failed to encrypt wallet:', error);
      setPasswordError('Failed to encrypt wallet. Please try again.');
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

      {step === 'start' ? (
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
      ) : step === 'password' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-500" />
            <div>
              <Typography variant="h4" className="text-blue-800 dark:text-blue-200">
                Create a Password
              </Typography>
              <Typography variant="small" className="text-blue-600 dark:text-blue-400">
                Protect your wallet with a strong password
              </Typography>
            </div>
          </div>

          {generatedWallet && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Typography variant="small" className="text-gray-500 mb-1">
                Wallet Address
              </Typography>
              <Typography variant="paragraph" className="font-mono text-sm break-all">
                {generatedWallet.address}
              </Typography>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Password (minimum 8 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <Typography variant="small" className="text-red-600 dark:text-red-400">
                  {passwordError}
                </Typography>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Typography variant="small" className="text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>📝 Important:</strong>
              </Typography>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• You can use this password to access your wallet quickly</li>
                <li>• You can also use your 25-word recovery phrase to restore access</li>
                <li>• Save your recovery phrase securely - it's your backup!</li>
              </ul>
            </div>

            <Button
              onClick={handleSetPassword}
              disabled={isGenerating || !password || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Securing Wallet...
                </>
              ) : (
                'Secure Wallet with Password'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <Typography variant="h4" className="text-green-800 dark:text-green-200">
                Wallet Created Successfully!
              </Typography>
              {success && (
                <Typography variant="small" className="text-green-600 dark:text-green-400">
                  {success}
                </Typography>
              )}
            </div>
          </div>

          {generatedWallet && (
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
                  <li>• Download and save your wallet credentials securely</li>
                  <li>• You'll need your password or 25-word phrase to access your wallet</li>
                  <li>• Your wallet is now connected and ready to use</li>
                </ul>
              </div>

              <Button
                onClick={() => router.push('/new-wallet')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                View & Download Credentials
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
