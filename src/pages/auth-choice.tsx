import { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthChoiceCard } from '@/components/auth/auth-choice-card';
import Image from 'next/image';

export default function AuthChoice() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const web3Features = [
    'Wallet-first authentication',
    'Full decentralization',
    'Direct blockchain access',
    'Secure cryptographic signing',
    'No password needed',
  ];

  const web2Features = [
    'Email/password login',
    'Social login (Google, GitHub)',
    'Connect wallet later (optional)',
    'Easy account recovery',
    'Multi-device access',
  ];

  const handleWeb3Choice = () => {
    localStorage.setItem('auth_mode', 'web3');
    router.push('/wallet-auth');
  };

  const handleWeb2Choice = () => {
    localStorage.setItem('auth_mode', 'web2');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/images/sizlogo.png"
                alt="SIZ Logo"
                width={96}
                height={96}
                className="object-contain drop-shadow-lg animate-float"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
            Welcome to Sizland
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose your preferred authentication method
          </p>
        </div>

        {/* Authentication Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Web3 Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <AuthChoiceCard
                title="Web3 Mode"
                badge="Crypto Friendly"
                features={web3Features}
                flavor="web3"
                ctaLabel="Continue with Wallet"
                onClick={handleWeb3Choice}
              />
            </div>
          </div>

          {/* Web2 Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <AuthChoiceCard
                title="Web2 Mode"
                badge="Traditional Login"
                features={web2Features}
                flavor="web2"
                ctaLabel="Continue with Email/Social"
                onClick={handleWeb2Choice}
              />
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <button
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Need help choosing?
          </button>
        </div>

        {/* Help Dialog */}
        {showHelp && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowHelp(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" aria-hidden="true"></div>

              {/* Center modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div 
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Authentication Methods Explained
                    </h3>
                  </div>
                  
                  <div className="mt-6 space-y-6 text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Web3 Mode (Wallet-First)</h4>
                      <p className="leading-relaxed">
                        Your wallet becomes your identity. You&apos;ll connect a blockchain wallet (like MetaMask) that serves 
                        as your login credential using cryptographic signatures. This is the true Web3 experience - decentralized, 
                        secure, and censorship-resistant. No passwords needed, just sign a message with your wallet.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Web2 Mode (Traditional)</h4>
                      <p className="leading-relaxed">
                        Use familiar login methods like email/password or social accounts (Google, GitHub). 
                        You can optionally connect a wallet later to access blockchain features. This is easier 
                        for newcomers and allows multi-device access.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Which should I choose?</h4>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>
                          <strong className="text-gray-900 dark:text-white">Choose Web3</strong> if you&apos;re familiar with cryptocurrency wallets and want full decentralization.
                        </li>
                        <li>
                          <strong className="text-gray-900 dark:text-white">Choose Web2</strong> if you&apos;re new to crypto or prefer traditional login methods.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm">
                        <strong className="text-blue-900 dark:text-blue-300">Note:</strong> You can always switch between modes later in your account settings!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowHelp(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
