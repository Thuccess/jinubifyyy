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
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  const resolveAppliedTheme = (mode: Theme): 'light' | 'dark' => {
    if (mode === 'light' || mode === 'dark') return mode;
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // After mount: apply stored or system theme so server and initial client HTML match, then sync.
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const preference: Theme =
      storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
        ? storedTheme
        : 'system';
    setTheme(preference);
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const appliedTheme = resolveAppliedTheme(theme);
    root.classList.toggle('dark', appliedTheme === 'dark');
    if (mounted) {
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = (_event: MediaQueryListEvent) => {
      if (theme !== 'system') return;
      const root = window.document.documentElement;
      root.classList.toggle('dark', mediaQuery.matches);
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
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
