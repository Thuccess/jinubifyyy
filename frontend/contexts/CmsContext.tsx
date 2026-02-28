import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const [site, setSite] = useState<CmsSiteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSite = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cmsAPI.getSite();
      setSite(data);
    } catch (e) {
      const message = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Failed to load site content';
      setError(message);
      setSite(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  const value: CmsContextType = {
    site,
    isLoading,
    error,
    refetch: fetchSite,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};
