 'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Use a single initial theme so server and client first render match (avoids hydration error).
// After mount we apply stored/system theme in useEffect.
const SSR_THEME: Theme = 'light';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(SSR_THEME);
  const [userPreference, setUserPreference] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const nextTheme: Theme = prevTheme === 'light' ? 'dark' : 'light';
      setUserPreference(nextTheme);
      return nextTheme;
    });
  };

  // After mount: apply stored or system theme so server and initial client HTML match, then sync.
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const preference = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    setUserPreference(preference);
    if (preference) {
      setTheme(preference);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    if (mounted && userPreference) {
      localStorage.setItem('theme', userPreference);
    } else if (mounted) {
      localStorage.removeItem('theme');
    }
  }, [theme, userPreference, mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = () => {
      if (userPreference == null) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    applySystemTheme();

    const listener = (event: MediaQueryListEvent) => {
      if (userPreference == null) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', listener);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(listener);
      }
    };
  }, [userPreference, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
