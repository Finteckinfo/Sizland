import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AuthWrapper = ({ children, fallback }: AuthWrapperProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { resolvedTheme: theme } = useTheme();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/wallet-auth', '/auth-choice', '/sso-callback', '/404', '/terms', '/privacy', '/blog', '/whitepaper'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    // Only redirect if we're loaded, not authenticated, and not on a public route
    if (status === 'unauthenticated' && !isPublicRoute) {
      router.replace('/wallet-auth');
    }
  }, [status, isPublicRoute, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated and not on a public route, render nothing while redirecting
  if (status === 'unauthenticated' && !isPublicRoute) {
    return null;
  }

  // Render children if authenticated or on public route
  return <>{children}</>;
};

export default AuthWrapper;
