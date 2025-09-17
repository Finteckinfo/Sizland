import { SignUp } from '@clerk/nextjs';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getClerkAppearance } from '@/lib/clerk-appearance';

const SignUpPage = () => {
  const { theme } = useTheme();

  return (
    <PageLayout 
      title="Sign Up - Sizland" 
      description="Join Sizland ecosystem and start your journey"
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
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Get Started with Sizland
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Join our ecosystem and start your journey
            </p>
          </div>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            appearance={getClerkAppearance(theme)}
            routing="hash"
            redirectUrl="/"
            signInUrl="/login"
          />
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            What you'll get access to:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="font-medium text-indigo-600 mb-1">ERP System</div>
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Business management tools</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="font-medium text-indigo-600 mb-1">Investment Platform</div>
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Access to DeFi opportunities</div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="font-medium text-indigo-600 mb-1">SIZ Tokens</div>
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Ecosystem utility tokens</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SignUpPage;