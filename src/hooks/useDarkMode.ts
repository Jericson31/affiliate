import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Function to get system preference
  const getSystemPreference = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    let shouldBeDark: boolean;
    
    if (newTheme === 'system') {
      shouldBeDark = getSystemPreference();
    } else {
      shouldBeDark = newTheme === 'dark';
    }

    // Apply theme class
    if (shouldBeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    setIsDark(shouldBeDark);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Function to change theme
  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setThemeMode(newTheme);
  };

  return {
    theme,
    isDark,
    setTheme: setThemeMode,
    toggleTheme,
    systemPreference: getSystemPreference()
  };
};