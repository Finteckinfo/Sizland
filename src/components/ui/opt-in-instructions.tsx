import React from 'react';
import { Button } from './button';
import { Copy, ExternalLink, AlertTriangle } from 'lucide-react';

interface OptInInstructionsProps {
  assetId: string;
  className?: string;
}

export const OptInInstructions: React.FC<OptInInstructionsProps> = ({ 
  assetId, 
  className = '' 
}) => {
  const copyAssetId = () => {
    navigator.clipboard.writeText(assetId);
  };

  const openAlgoExplorer = () => {
    window.open(`https://algoexplorer.io/asset/${assetId}`, '_blank');
  };

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Opt-In Required to Receive SIZ Tokens
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            Your wallet needs to be configured to receive SIZ tokens before you can purchase them.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Step 1: Copy the SIZ Token Asset ID
          </h4>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
              {assetId}
            </code>
            <Button
              onClick={copyAssetId}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Step 2: Add SIZ Token to Your Wallet
          </h4>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>Pera Wallet:</strong> Go to Assets → Add New Asset → Paste the Asset ID above
            </p>
            <p>
              <strong>MyAlgo Wallet:</strong> Go to Assets → Add Asset → Enter the Asset ID above
            </p>
            <p>
              <strong>Defly Wallet:</strong> Go to Assets → + → Enter Asset ID → Paste the Asset ID above
            </p>
            <p>
              <strong>AlgoSigner:</strong> Go to Assets → Add Asset → Enter the Asset ID above
            </p>
            <p>
              <strong>Other Wallets:</strong> Look for "Add Asset", "Import Asset", or "+" option
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Step 3: Verify the Token
          </h4>
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Verify this is the correct SIZ token by checking the asset details
            </p>
            <Button
              onClick={openAlgoExplorer}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on AlgoExplorer
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Important Notes
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Opt-in requires a small transaction fee (about 0.001 ALGO)</li>
            <li>• Your minimum balance will increase by 0.1 ALGO</li>
            <li>• You only need to opt-in once per wallet</li>
            <li>• After opt-in, you can purchase and receive SIZ tokens immediately</li>
          </ul>
        </div>

        {/* Quick Check After Opt-In */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            After Opt-In
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Once you've completed the opt-in process in your wallet, click the button below to verify your wallet is ready:
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Check Wallet Status
          </Button>
        </div>
      </div>
    </div>
  );
};
