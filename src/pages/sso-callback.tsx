import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PageLayout } from '@/components/page-layout';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

const SSOCallbackPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Redirect to home page after successful SSO
        router.push('/');
      } else {
        // Redirect to sign-in if not signed in
        router.push('/sign-in');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <PageLayout 
      title="SSO Callback - Sizland" 
      description="Processing SSO authentication"
      flexDirection="col"
      justify="center"
      align="center"
      gap={8}
      requireAuth={false}
    >
      <div className="w-full max-w-md text-center">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Processing Authentication
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we complete your sign-in...
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SSOCallbackPage;
