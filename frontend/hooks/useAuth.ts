import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, storeAuth, getStoredUser } from '../services/api';
import type { User } from '../types';

interface SignupData {
  name: string;
  email: string;
  password: string;
  company: string;
  photoURL?: string;
  phone?: string;
  website?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useSignup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await authAPI.signup(data);
      return response;
    },
    onSuccess: () => {
      // Signup now returns only a message; user signs in after verification + approval.
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    },
  });
};

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
