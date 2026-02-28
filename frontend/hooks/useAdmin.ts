import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminAPI.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminUsers = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminAPI.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminContacts = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['admin', 'contacts', params],
    queryFn: () => adminAPI.getContacts(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return adminAPI.updateContactStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
    },
  });
};
