'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Typography } from './typography';
import { Mail, Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateAlgorandWallet, storeWallet, type GeneratedWallet } from '@/lib/algorand/walletGenerator';
 

interface WalletGeneratorProps {
  onWalletGenerated?: (wallet: GeneratedWallet) => void;
}

export const WalletGenerator: React.FC<WalletGeneratorProps> = ({ onWalletGenerated }) => {
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<GeneratedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  const handleGenerateWallet = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate wallet
      const wallet = generateAlgorandWallet();
      setGeneratedWallet(wallet);

      // Store wallet in localStorage
      storeWallet(wallet);

      // Send email with credentials
      setIsEmailSending(true);
      const emailResponse = await fetch('/api/sendWalletEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
      }

      setSuccess('Wallet generated successfully! Check your email for credentials.');

      // Auto-connect the generated wallet
      try {
        // The GeneratedWalletProvider should automatically resume the session
        // since we stored the wallet in localStorage
        // We just need to trigger a re-render by updating the wallet state
        setTimeout(() => {
          window.location.reload(); // Simple way to refresh and auto-connect
        }, 2000);
      } catch (connectError) {
        console.error('Failed to auto-connect wallet:', connectError);
        // Don't throw error here as wallet was still generated successfully
      }

      // Call callback if provided
      if (onWalletGenerated) {
        onWalletGenerated(wallet);
      }

    } catch (err) {
      console.error('Wallet generation failed:', err);
      setError('Failed to generate wallet. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsEmailSending(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="rounded-2xl border border-gray-300 p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-6 w-6 text-green-500" />
        <Typography variant="h3">Generate New Wallet</Typography>
      </div>

      {!generatedWallet ? (
        <div className="space-y-6">
          <div>
            <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400 mb-4">
              Create a new Algorand wallet and receive your credentials via email. 
              This wallet will be automatically connected after generation.
            </Typography>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isGenerating}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <Typography variant="small" className="text-red-600 dark:text-red-400">
                  {error}
                </Typography>
              </div>
            )}

            <Button
              onClick={handleGenerateWallet}
              disabled={isGenerating || !email.trim()}
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

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <Typography variant="small" className="text-blue-800 dark:text-blue-200 mb-2">
              <strong>What happens next:</strong>
            </Typography>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• A new Algorand wallet will be generated securely</li>
              <li>• Your wallet credentials will be sent to your email</li>
              <li>• The wallet will be automatically connected</li>
              <li>• You can start using your wallet immediately</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <Typography variant="h4" className="text-green-800 dark:text-green-200">
                Wallet Generated Successfully!
              </Typography>
              <Typography variant="small" className="text-green-600 dark:text-green-400">
                {success}
              </Typography>
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
                <li>• Check your email for complete wallet credentials</li>
                <li>• Save your private key and recovery phrase securely</li>
                <li>• Never share these credentials with anyone</li>
                <li>• Your wallet is now connected and ready to use</li>
              </ul>
            </div>

            <Button
              onClick={() => {
                setGeneratedWallet(null);
                setEmail('');
                setSuccess(null);
              }}
              variant="outline"
              className="w-full"
            >
              Generate Another Wallet
            </Button>
          </div>
        </div>
      )}

      {isEmailSending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
              <Typography variant="paragraph">
                Sending wallet credentials to your email...
              </Typography>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
