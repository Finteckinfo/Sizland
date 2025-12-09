import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SiweMessage } from 'siwe';
import { useTheme } from 'next-themes';
import { maskWalletAddress, trackWalletAuthEvent } from '@/lib/analytics';

interface MetaMaskSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const MetaMaskSignIn: React.FC<MetaMaskSignInProps> = ({
  onSuccess,
  onError
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMetaMaskSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      trackWalletAuthEvent('attempt', {
        channel: 'metamask',
        surface: 'metamask',
        method: 'siwe',
        chain: 'evm',
        stage: 'metamask-init',
      });

      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];
      trackWalletAuthEvent('attempt', {
        channel: 'metamask',
        surface: 'metamask',
        method: 'siwe',
        chain: 'evm',
        stage: 'metamask-account-selected',
        walletAddress: maskWalletAddress(address),
      });

      // Get network info
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      }) as string;

      // Request a nonce from the server
      const nonceRes = await fetch('/api/auth/siwe/nonce');
      if (!nonceRes.ok) {
        throw new Error('Failed to get nonce from server');
      }

      const { nonce, nonceKey } = await nonceRes.json();

      // Create SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      
      const siweMessage = new SiweMessage({
        domain,
        address,
        statement: 'Sign in to Sizland with your Ethereum wallet',
        uri: origin,
        version: '1',
        chainId: parseInt(chainId, 16),
        nonce
      });

      const message = siweMessage.prepareMessage();

      // Request signature from MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      }) as string;

      // Sign in with NextAuth using the SIWE provider
      const result = await signIn('siwe', {
        message,
        signature,
        nonceKey,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        trackWalletAuthEvent('success', {
          channel: 'metamask',
          surface: 'metamask',
          method: 'siwe',
          chain: 'evm',
          stage: 'nextauth-siwe',
          walletAddress: maskWalletAddress(address),
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/lobby');
        }
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with MetaMask';
      setError(errorMessage);
      trackWalletAuthEvent('error', {
        channel: 'metamask',
        surface: 'metamask',
        method: 'siwe',
        chain: 'evm',
        stage: 'metamask-flow',
        error: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
      console.error('MetaMask sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleMetaMaskSignIn}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting to MetaMask...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.5 4L22.5 14.5L25.2 8.3L36.5 4Z" fill="#E17726" stroke="#E17726" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 4L17.3 14.6L14.8 8.3L3.5 4Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M31.3 27.7L27.5 33.5L35.8 35.7L38.1 27.9L31.3 27.7Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.9 27.9L4.2 35.7L12.5 33.5L8.7 27.7L1.9 27.9Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17.5L9.8 21L18 21.4L17.7 12.5L12 17.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M28 17.5L22.2 12.4L22 21.4L30.2 21L28 17.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5 33.5L17.3 31.2L13.2 28L12.5 33.5Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22.7 31.2L27.5 33.5L26.8 28L22.7 31.2Z" fill="#E27625" stroke="#E27625" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign In with MetaMask</span>
          </>
        )}
      </button>

      <p className={`mt-3 text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        No password needed. Just sign a message with your wallet.
      </p>
    </div>
  );
};
