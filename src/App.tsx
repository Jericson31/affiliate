import React, { useState, useEffect } from 'react';
import RootLayout from './app/layout';
import DashboardLayout from './app/(dashboard)/layout';
import AuthLayout from './app/(auth)/layout';
import AuthPage from './app/(auth)/auth/page';
import DashboardPage from './app/(dashboard)/dashboard/page';
import LeadsPage from './app/(dashboard)/leads/page';
import SalesPage from './app/(dashboard)/sales/page';
import LinksPage from './app/(dashboard)/links/page';
import LeaderboardPage from './app/(dashboard)/leaderboard/page';
import ProfilePage from './app/(dashboard)/profile/page';
import { useAuth } from './hooks/useAuth';
import { AuthGuard } from './components/auth/AuthGuard';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [, forceUpdate] = useState({});
  const { user, profile, loading } = useAuth();

  console.log('🔍 App.tsx - Render Cycle Auth State:', {
    userExists: !!user,
    profileExists: !!profile,
    loading,
    currentPath,
    userEmail: user?.email,
    profileRole: profile?.role
  });

  useEffect(() => {
    const handlePopState = () => {
      console.log('🔍 App.tsx - popstate event, new path:', window.location.pathname);
      setCurrentPath(window.location.pathname);
      forceUpdate({});
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    console.log('🔍 App.tsx - useEffect triggered:', { loading, user: !!user, currentPath });
    if (!loading) {
      if (user && (currentPath === '/auth' || currentPath === '/')) {
        console.log('🔍 App.tsx - User authenticated, navigating to dashboard');
        window.history.replaceState({}, '', '/dashboard');
        setCurrentPath('/dashboard');
      } else if (!user && currentPath !== '/auth') {
        console.log('🔍 App.tsx - No user, navigating to auth');
        window.history.replaceState({}, '', '/auth');
        setCurrentPath('/auth');
      }
    }
  }, [loading, user, currentPath]);

  const renderPage = () => {
    console.log('🔍 App.tsx renderPage - loading:', loading, 'user:', !!user, 'currentPath:', currentPath);

    if (loading) {
      console.log('🔍 App.tsx - Showing loading screen');
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
          </div>
        </div>
      );
    }

    const targetPath = currentPath;
    console.log('🔍 App.tsx - Final targetPath:', targetPath);

    if (targetPath === '/auth') {
      console.log('🔍 App.tsx - Rendering AuthPage');
      return (
        <AuthLayout>
          <AuthPage />
        </AuthLayout>
      );
    } else {
      console.log('🔍 App.tsx - Rendering Dashboard with AuthGuard');
      if (!user) {
        console.warn('⚠️ App.tsx - User is null but attempting to render dashboard, showing loading');
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
            </div>
          </div>
        );
      }
      return (
        <AuthGuard>
          <DashboardLayout>
            {(() => {
              switch (targetPath) {
                case '/profile':
                  return <ProfilePage />;
                case '/leaderboard':
                  return <LeaderboardPage />;
                case '/links':
                  return <LinksPage />;
                case '/sales':
                  return <SalesPage />;
                case '/leads':
                  return <LeadsPage />;
                case '/dashboard':
                case '/':
                default:
                  return <DashboardPage />;
              }
            })()}
          </DashboardLayout>
        </AuthGuard>
      );
    }
  };

  return (
    <RootLayout>
      {renderPage()}
    </RootLayout>
  );
}

export default App;
