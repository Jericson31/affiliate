import React from 'react';
import { User, LogOut } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('DashboardLayout: Component rendering');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate')); // Trigger App.tsx to re-evaluate route
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleNavigation('/auth'); // Navigate to auth page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email || user?.email || 'User';

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`
    : (profile?.email || user?.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">I AM +</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className={`font-medium pb-4 transition-colors duration-200 ${
                  window.location.pathname === '/dashboard' || window.location.pathname === '/'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavigation('/leads')}
                className={`font-medium pb-4 transition-colors duration-200 ${
                  window.location.pathname === '/leads'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Leads
              </button>
              <button 
                onClick={() => handleNavigation('/sales')}
                className={`font-medium pb-4 transition-colors duration-200 ${
                  window.location.pathname === '/sales'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Sales
              </button>
              <button 
                onClick={() => handleNavigation('/links')}
                className={`font-medium pb-4 transition-colors duration-200 ${
                  window.location.pathname === '/links'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Links
              </button>
              <button 
                onClick={() => handleNavigation('/leaderboard')}
                className={`font-medium pb-4 transition-colors duration-200 ${
                  window.location.pathname === '/leaderboard'
                    ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Leaderboard
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4 relative">
              <SimpleThemeToggle />
              <div 
                ref={dropdownRef}
                className="relative"
              >
                <button 
                  onClick={toggleDropdown}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Kenneth Ray Eiman" />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 transition-all duration-200">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt="Kenneth Ray Eiman" />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {displayName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {profile?.email || user?.email}
                          </p>
                          {profile?.role && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                              {profile.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button 
                        onClick={() => handleNavigation('/profile')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                     <button 
                       onClick={handleSignOut}
                       className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
                     >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}