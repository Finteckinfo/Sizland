'use client'

import React from 'react';
import { Typography } from './typography';
import { Button } from './button';
import { Copy, X, CheckCircle } from 'lucide-react';

export const WalletPopup = ({
  data,
  onClose,
}: {
  data: { address: string; private_key: string; mnemonic: string };
  onClose: () => void;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const copyText = `Address: ${data.address}\nPrivate Key: ${data.private_key}\nMnemonic: ${data.mnemonic}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <Typography variant="h3" className="text-gray-900 dark:text-gray-100">
                Wallet Created Successfully
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400 mt-2">
            Your wallet credentials have been generated and sent to your email. Keep them safe!
          </Typography>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-medium">
              Address
            </Typography>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Typography variant="paragraph" className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {data.address}
              </Typography>
            </div>
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-medium">
              Private Key
            </Typography>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Typography variant="paragraph" className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {data.private_key}
              </Typography>
            </div>
          </div>

          {/* Mnemonic */}
          <div className="space-y-2">
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-medium">
              Mnemonic (25 words)
            </Typography>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Typography variant="paragraph" className="font-mono text-sm break-words text-gray-900 dark:text-gray-100 leading-relaxed">
                {data.mnemonic}
              </Typography>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <Typography variant="small" className="text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Important:</strong> Store these credentials securely. Never share your private key or mnemonic with anyone. 
              You can use the mnemonic to recover your wallet if needed.
            </Typography>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All
              </>
            )}
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
