'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileDetailsForm } from '@/components/profile/ProfileDetailsForm';
import { PayoutInformationForm } from '@/components/profile/PayoutInformationForm';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sessionManager } from '@/lib/auth/sessionManager';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('edit-profile');
  const { user, profile, loading } = useAuth();
  const [sessionValid, setSessionValid] = useState(true);
  const [validatingSession, setValidatingSession] = useState(true);

  console.log('📄 ProfilePage: Component rendered');
  console.log('📄 ProfilePage: user from useAuth:', user);
  console.log('📄 ProfilePage: profile from useAuth:', profile);

  useEffect(() => {
    const validateAuthentication = async () => {
      if (loading) {
        return;
      }

      try {
        setValidatingSession(true);
        const validation = await sessionManager.validateSession();

        if (!validation.isValid) {
          console.error('Session validation failed:', validation.error);
          setSessionValid(false);

          setTimeout(() => {
            window.history.pushState({}, '', '/auth');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }, 2000);
          return;
        }

        setSessionValid(true);
      } catch (error) {
        console.error('Error validating session:', error);
        setSessionValid(false);
      } finally {
        setValidatingSession(false);
      }
    };

    validateAuthentication();

    sessionManager.startPeriodicCheck(() => {
      setSessionValid(false);
      window.history.pushState({}, '', '/auth');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    return () => {
      sessionManager.stopPeriodicCheck();
    };
  }, [loading, user]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUsername = () => {
    if (profile?.email) {
      return `@${profile.email.split('@')[0]}`;
    }
    if (user?.email) {
      return `@${user.email.split('@')[0]}`;
    }
    return '@user';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'edit-profile':
        return <ProfileDetailsForm />;
      case 'security':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
            <p className="text-gray-600 dark:text-gray-400">Security settings coming soon...</p>
          </div>
        );
      case 'payout':
        return (
          <PayoutInformationForm />
        );
      case 'sign-out':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Sign Out</h2>
            <p className="text-gray-600 dark:text-gray-400">Are you sure you want to sign out?</p>
          </div>
        );
      default:
        return <ProfileDetailsForm />;
    }
  };

  if (loading || validatingSession) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!sessionValid || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your session has expired or is invalid. Please sign in again to access your profile.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative z-0">
        <div
          className="h-48 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=1)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-purple-800/70 to-pink-800/70 z-0"></div>

          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-2 mx-auto border-4 border-white/20">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <h2 className="text-white text-xl font-semibold">I AM +</h2>
              <p className="text-white/80 text-sm">COACHING</p>
            </div>
          </div>
        </div>

        {/* Profile Avatar and Info */}
        <div className="absolute -bottom-12 left-8 z-10">
          <div className="flex items-end space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
              <AvatarImage src="" alt={getDisplayName()} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {getDisplayName()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{getUsername()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProfileSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}