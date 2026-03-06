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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // userPreference represents an explicit user choice ('light' or 'dark').
  // When null, the app follows the system theme.
  const [userPreference, setUserPreference] = useState<Theme | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const nextTheme: Theme = prevTheme === 'light' ? 'dark' : 'light';
      setUserPreference(nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    if (userPreference) {
      localStorage.setItem('theme', userPreference);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme, userPreference]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    // Support older and newer browser APIs
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
  }, [userPreference]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
