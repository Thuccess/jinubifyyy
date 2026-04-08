'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

export default function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, login, logout } = useAuth();
  const pathname = usePathname();

  // Public profile pages should render edge-to-edge without the shared page container.
  if (pathname?.startsWith('/u/')) {
    return <>{children}</>;
  }

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
