import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  callbackFromQuery,
  clientPostAuthPath,
} from '@/lib/auth-callback';
import {
  SIZLAND_AUTH_ORIGIN,
  shouldBounceToApexForOAuth,
} from '@/lib/sizwallet-auth-client';

/**
 * Primary auth entry — Sign in with SizWallet (OIDC).
 * Session cookies on .siz.land cover buy / solutions / mytab / erp after login.
 */
export default function AuthChoice() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const callbackUrl = callbackFromQuery(router.query);

  const returnTo = clientPostAuthPath(callbackUrl);

  function startSizWallet() {
    setError(null);
    setStarting(true);
    localStorage.setItem('auth_mode', 'sizwallet');
    if (callbackUrl) localStorage.setItem('auth_callback_url', callbackUrl);

    if (typeof window !== 'undefined' && shouldBounceToApexForOAuth(window.location.hostname)) {
      const target = `${SIZLAND_AUTH_ORIGIN}/auth-choice?sizwallet=1&callbackUrl=${encodeURIComponent(returnTo)}`;
      window.location.href = target;
      return;
    }

    void signIn('sizwallet', { callbackUrl: returnTo }).catch(() => {
      setError('Could not start Sign in with SizWallet. Check SIZWALLET_* env on this deploy.');
      setStarting(false);
    });
  }

  // Auto-start when bounced from a subdomain (?sizwallet=1)
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.sizwallet !== '1') return;
    startSizWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.sizwallet]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/images/sizlogo.png"
                alt="SIZ Logo"
                width={96}
                height={96}
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 font-poppins">
            Welcome to Sizland
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sign in with SizWallet. Your DID and wallet keys stay on wallet.siz.land —
            this site only receives a private login id.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 p-8 shadow-lg">
          <ul className="mb-8 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Unlock once with your SizWallet identity</li>
            <li>Works across siz.land and its subdomains</li>
            <li>No password stored on this site</li>
          </ul>

          {error ? (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="button"
            disabled={starting}
            onClick={startSizWallet}
            className="w-full rounded-full py-3.5 px-4 font-semibold text-white shadow-lg disabled:opacity-60"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)',
            }}
          >
            {starting ? 'Redirecting to SizWallet…' : 'Sign in with SizWallet'}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Need a wallet?{' '}
            <a
              href="https://wallet.siz.land"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Create or recover on wallet.siz.land
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
