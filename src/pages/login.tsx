import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import AuroraText from '@/components/ui/aurora-text';

const LoginPage = () => {
  const { resolvedTheme: theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/lobby');
      }
    } catch (err) {
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
        {/* Header */}
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
              <AuroraText className="inline-block">
                Back
              </AuroraText>
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to your Sizland account
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <div
          className={`p-8 rounded-2xl shadow-xl border ${
            theme === 'dark'
              ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
              : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
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

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
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
                    <EyeOff className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Stay logged in + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                  defaultChecked
                />
                <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>Stay logged in</span>
              </label>
              <Link
                href="/forgot-password"
                className={`underline-offset-4 ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-full font-semibold text-white transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'hover:brightness-105'
              }`}
              style={
                loading
                  ? undefined
                  : {
                      background:
                        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 42%), linear-gradient(90deg, #34d399 0%, #10b981 60%, #0ea970 100%)"
                    }
              }
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-[#233446]' : 'border-[#dbe6dc]'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-3 py-1 rounded ${
                    theme === 'dark'
                      ? 'bg-[#141f2d] text-gray-300'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Or sign in with
                </span>
              </div>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/lobby' })}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-[#dff6e9] text-gray-800 border border-[#bde7ce] hover:bg-[#e9f9ef]'
                  : 'bg-[#e6f9ef] text-gray-800 border border-[#c9ecdc] hover:bg-[#f2fcf6]'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  style={{ fill: '#4285F4' }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  style={{ fill: '#34A853' }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  style={{ fill: '#FBBC05' }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  style={{ fill: '#EA4335' }}
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
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
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
