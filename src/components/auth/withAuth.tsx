import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface WithAuthOptions {
  requireProfile?: boolean;
  redirectTo?: string;
  showLoading?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireProfile = false,
    redirectTo = '/auth',
    showLoading = true,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { user, profile, loading } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
      if (loading) {
        return;
      }

      setIsVerifying(false);

      if (!user) {
        setRedirecting(true);
        window.history.pushState({}, '', redirectTo);
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      if (requireProfile && !profile) {
        setRedirecting(true);
        window.history.pushState({}, '', '/profile');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }
    }, [user, profile, loading]);

    if (loading || isVerifying) {
      if (!showLoading) {
        return null;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    if (redirecting) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requireProfile && !profile) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
