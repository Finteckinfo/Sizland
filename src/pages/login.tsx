import { SignIn } from '@clerk/nextjs';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getClerkAppearance } from '@/lib/clerk-appearance';

const LoginPage = () => {
  const { theme } = useTheme();

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
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome Back
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to your Sizland account
            </p>
          </div>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            appearance={getClerkAppearance(theme)}
            routing="hash"
            redirectUrl="/"
            signUpUrl="/signup"
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;