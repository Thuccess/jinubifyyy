import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, storeAuth, getStoredUser } from '../services/api';
import type { User } from '../types';

interface SignupData {
  name: string;
  email: string;
  password: string;
  company: string;
}

interface LoginData {
  email: string;
  password: string;
}

// DEPRECATED: legacy /auth/signup client hook removed. Use AuthModal + /auth/register flow.

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await authAPI.login(data);
      storeAuth(response.token, response.user, true);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authAPI.getCurrentUser();
      return response.user;
    },
    enabled: !!getStoredUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
