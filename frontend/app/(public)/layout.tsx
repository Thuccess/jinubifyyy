'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

/** Split from the route layout chunk so dev/HMR does not time out loading one huge `layout.js`. */
const MainLayout = dynamic(() => import('@/components/layout/MainLayout'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)] text-text-secondary text-sm">
      <span className="inline-flex items-center gap-3">
        <span
          className="h-5 w-5 rounded-full border-2 border-[color:var(--accent-primary)] border-t-transparent animate-spin"
          aria-hidden
        />
        Loading…
      </span>
    </div>
  ),
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, login, logout } = useAuth();

  return (
    <MainLayout
      theme={theme}
      toggleTheme={toggleTheme}
      currentUser={currentUser}
      onLoginSuccess={login}
      onLogout={logout}
    >
      {children}
    </MainLayout>
  );
}
