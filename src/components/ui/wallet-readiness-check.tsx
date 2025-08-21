import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Button } from './button';
import { sizTokenTransferService } from '@/lib/algorand/token-transfer';
import { OptInInstructions } from './opt-in-instructions';

interface WalletReadinessCheckProps {
  onReady: () => void;
  onNotReady: (reason: string, instructions: string) => void;
}

export const WalletReadinessCheck: React.FC<WalletReadinessCheckProps> = ({
  onReady,
  onNotReady
}) => {
  const { activeAccount } = useWallet();
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'not-ready' | 'error'>('checking');

  useEffect(() => {
    if (activeAccount?.address) {
      checkWalletReadiness();
    }
  }, [activeAccount?.address]);

  const checkWalletReadiness = async () => {
    if (!activeAccount?.address) {
      setStatus('error');
      onNotReady('No wallet connected', 'Please connect your Algorand wallet first.');
      return;
    }

    setIsChecking(true);
    setStatus('checking');

    try {
      // Check if wallet is opted into SIZ tokens
      const optInStatus = await sizTokenTransferService.checkReceiverOptIn(activeAccount.address);
      
      if (optInStatus.isOptedIn) {
        setStatus('ready');
        onReady();
      } else {
        setStatus('not-ready');
        const instructions = sizTokenTransferService.generateOptInInstructions(activeAccount.address, optInStatus);
        onNotReady('Wallet not opted into SIZ tokens', instructions);
      }
    } catch (error) {
      setStatus('error');
      onNotReady('Failed to check wallet status', 'Unable to verify wallet readiness. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Checking wallet readiness...</span>
          </div>
        );
      
             case 'ready':
         return (
           <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
             <div className="flex items-center space-x-2 text-green-600 mb-2">
               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
               <span className="text-sm font-medium">Wallet ready to receive SIZ tokens!</span>
             </div>
             <p className="text-sm text-green-700 dark:text-green-300">
               Perfect! Your wallet is configured and ready. You can now proceed with your SIZ token purchase.
             </p>
           </div>
         );
      
      case 'not-ready':
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Wallet needs setup to receive SIZ tokens</span>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Error checking wallet status</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!activeAccount?.address) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 mb-3">Please connect your Algorand wallet to continue</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Wallet Status Check
        </h3>
        {renderStatus()}
      </div>
      
             {status === 'not-ready' && (
         <div className="space-y-4">
           <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
             <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
               Setup Required
             </h4>
             <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
               Your wallet needs to be configured to receive SIZ tokens before you can purchase them.
             </p>
             <Button 
               onClick={checkWalletReadiness}
               disabled={isChecking}
               className="bg-yellow-600 hover:bg-yellow-700 text-white"
             >
               {isChecking ? 'Checking...' : 'Check Again'}
             </Button>
           </div>
           
           {/* Opt-In Instructions */}
           <OptInInstructions 
             assetId={process.env.NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID || 'SIZ_TOKEN_ASSET_ID'} 
           />
         </div>
       )}
      
      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Error Occurred
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            We couldn't verify your wallet status. Please try again or contact support.
          </p>
          <Button 
            onClick={checkWalletReadiness}
            disabled={isChecking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isChecking ? 'Checking...' : 'Try Again'}
          </Button>
        </div>
      )}
    </div>
  );
};

