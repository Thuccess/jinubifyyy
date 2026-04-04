'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cmsAPI, type CmsSiteResponse } from '../services/api';

interface CmsContextType {
  site: CmsSiteResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function useCms(): CmsContextType {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}

interface CmsProviderProps {
  children: ReactNode;
}

export const CmsProvider: React.FC<CmsProviderProps> = ({ children }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cms', 'site'],
    queryFn: () => cmsAPI.getSite(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : error
        ? 'Failed to load site content'
        : null;

  const value: CmsContextType = {
    site: data ?? null,
    isLoading,
    error: message,
    refetch: async () => {
      await refetch();
    },
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};
