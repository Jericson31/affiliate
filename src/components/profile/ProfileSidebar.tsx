import React from 'react';
import { Settings, Shield, CreditCard, LogOut } from 'lucide-react';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeSection,
  onSectionChange,
  onSignOut
}) => {
  const menuItems = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: Settings,
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
    },
    {
      id: 'payout',
      label: 'Payout Information',
      icon: CreditCard,
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      icon: LogOut,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        Account Settings
      </h3>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => item.id === 'sign-out' ? onSignOut() : onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};