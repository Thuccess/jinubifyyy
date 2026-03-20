'use client';

import { useCallback, useEffect, useState } from 'react';
import { siteAPI, type SocialLinks } from '../services/api';

export function useSocialLinks() {
  const [socials, setSocials] = useState<SocialLinks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSocials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await siteAPI.getSocials();
      setSocials(data.socials || {});
    } catch (e: any) {
      const message = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Failed to load social links';
      setError(message);
      setSocials(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  return {
    socials,
    isLoading,
    error,
    refetch: fetchSocials,
  };
}

