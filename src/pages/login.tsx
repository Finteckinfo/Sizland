import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import AuroraText from '@/components/ui/aurora-text';
import {
  appendCallbackParam,
  callbackFromQuery,
  clientPostAuthPath,
  isBuyHostname,
} from '@/lib/auth-callback';
import {
  SIZLAND_AUTH_ORIGIN,
  shouldBounceToApexForOAuth,
} from '@/lib/sizwallet-auth-client';

const LoginPage = () => {
  const { resolvedTheme: theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const callbackUrl = callbackFromQuery(router.query);
  const returnTo = clientPostAuthPath(callbackUrl);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.sizwallet === '1') {
      void signIn('sizwallet', { callbackUrl: returnTo });
      return;
    }
    if (router.query.google === '1') {
      void signIn('google', { callbackUrl: returnTo });
    }
  }, [router.isReady, router.query, returnTo]);

  const handleSizWalletSignIn = () => {
    if (typeof window !== 'undefined' && shouldBounceToApexForOAuth(window.location.hostname)) {
      window.location.href = `${SIZLAND_AUTH_ORIGIN}/login?sizwallet=1&callbackUrl=${encodeURIComponent(returnTo)}`;
      return;
    }
    void signIn('sizwallet', { callbackUrl: returnTo });
  };

  const handleGoogleSignIn = () => {
    const dest =
      callbackUrl ||
      (typeof window !== 'undefined' && isBuyHostname(window.location.hostname)
        ? `${window.location.origin}/buy-land`
        : '/lobby');

    if (typeof window !== 'undefined' && isBuyHostname(window.location.hostname)) {
      window.location.href = `${SIZLAND_AUTH_ORIGIN}/login?google=1&callbackUrl=${encodeURIComponent(dest)}`;
      return;
    }

    void signIn('google', { callbackUrl: dest });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        const dest = clientPostAuthPath(callbackUrl);
        if (dest.startsWith('http')) {
          window.location.href = dest;
        } else {
          router.push(dest);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Sign In - Sizland"
      description="Sign in to your Sizland account"
      flexDirection="col"
      justify="center"
      align="center"
      gap={8}
      requireAuth={false}
    >
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center">
            <h1
              className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}
            >
              Welcome{' '}
              <AuroraText className="inline-block">Back</AuroraText>
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in with SizWallet
            </p>
          </div>
        </div>

        <div
          className={`p-8 rounded-2xl shadow-xl border ${
            theme === 'dark'
              ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
              : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]'
          }`}
        >
          <button
            type="button"
            onClick={handleSizWalletSignIn}
            className="w-full py-3.5 px-4 rounded-full font-semibold text-white transition-all duration-200 shadow-lg hover:brightness-105"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)',
            }}
          >
            Sign in with SizWallet
          </button>

          <p className={`mt-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            You&apos;ll unlock on wallet.siz.land, then return here signed in.
          </p>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-[#233446]' : 'border-[#dbe6dc]'}`} />
            </div>
            <div className="relative flex justify-center text-sm">
              <button
                type="button"
                onClick={() => setLegacyOpen((v) => !v)}
                className={`px-3 py-1 rounded ${
                  theme === 'dark'
                    ? 'bg-[#141f2d] text-gray-300 hover:text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                {legacyOpen ? 'Hide email / Google' : 'Email or Google (legacy)'}
              </button>
            </div>
          </div>

          {legacyOpen ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3.5 border rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all ${
                      theme === 'dark'
                        ? 'bg-[#1c2a3a] border-[#32465b] text-white placeholder-gray-400'
                        : 'bg-white border-[#d1d9d2] text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3.5 border rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all ${
                      theme === 'dark'
                        ? 'bg-[#1c2a3a] border-[#32465b] text-white placeholder-gray-400'
                        : 'bg-white border-[#d1d9d2] text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-full font-semibold text-white transition-all duration-200 shadow-lg ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:brightness-105'
                }`}
                style={
                  loading
                    ? undefined
                    : {
                        background:
                          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)',
                      }
                }
              >
                {loading ? 'Signing in...' : 'Sign In with Email'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full font-semibold transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-[#dff6e9] text-gray-800 border border-[#bde7ce] hover:bg-[#e9f9ef]'
                    : 'bg-[#e6f9ef] text-gray-800 border border-[#c9ecdc] hover:bg-[#f2fcf6]'
                }`}
              >
                Continue with Google
              </button>

              <div className="text-center">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Don&apos;t have an account?{' '}
                  <Link
                    href={appendCallbackParam('/signup', callbackUrl)}
                    className={`font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'text-emerald-300 hover:text-emerald-200'
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
