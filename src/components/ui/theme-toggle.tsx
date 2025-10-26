import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, setTheme } = useDarkMode();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light mode' },
    { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
    { value: 'system' as const, icon: Monitor, label: 'System preference' }
  ];

  return (
    <div className="relative">
      <div 
        className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-200"
        role="radiogroup"
        aria-label="Theme selection"
      >
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-white dark:focus:ring-offset-gray-900
              ${theme === value 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
            role="radio"
            aria-checked={theme === value}
            aria-label={label}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SimpleThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        bg-gray-100 dark:bg-gray-800 
        text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-gray-900
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};