import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireProfile = false,
  fallback,
  onUnauthorized,
}) => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.history.pushState({}, '', '/auth');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    if (requireProfile && !profile) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      return;
    }
  }, [user, profile, loading, requireProfile, onUnauthorized]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔍 AuthGuard - No user, returning fallback or null');
    return fallback ? <>{fallback}</> : null;
  }

  if (requireProfile && !profile) {
    console.log('🔍 AuthGuard - Profile required but not found');
    return fallback ? <>{fallback}</> : null;
  }

  console.log('🔍 AuthGuard - User authenticated, rendering children');
  return <>{children}</>;
};
