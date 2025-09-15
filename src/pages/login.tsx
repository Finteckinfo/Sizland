import { SignIn } from '@clerk/nextjs';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: "#6366f1",
                colorBackground: theme === 'dark' ? "#1f2937" : "#ffffff",
                colorInputBackground: theme === 'dark' ? "#374151" : "#ffffff",
                colorInputText: theme === 'dark' ? "#ffffff" : "#000000",
              },
              elements: {
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
                card: `bg-white dark:bg-gray-800 shadow-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`,
                headerTitle: "text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                socialButtonsBlockButton: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600",
                socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-300",
                formFieldInput: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white",
                formFieldLabel: "text-gray-700 dark:text-gray-300",
                identityPreviewText: "text-gray-600 dark:text-gray-400",
                formResendCodeLink: "text-indigo-600 dark:text-indigo-400",
                footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300",
              },
            }}
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