'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { CmsProvider } from '../contexts/CmsContext';
import RouteProgress from '../components/ui/RouteProgress';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 45 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouteProgress />
      <ThemeProvider>
        <AuthProvider>
          <CmsProvider>{children}</CmsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

