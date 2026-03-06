'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

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
