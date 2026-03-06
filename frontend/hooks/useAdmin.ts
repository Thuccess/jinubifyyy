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

export const useAdminApplications = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'applications', params],
    queryFn: () => adminAPI.getApplications(params),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      adminAPI.updateApplicationStatus(id, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useAdminInvestors = (params?: { page?: number; limit?: number; stage?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'investors', params],
    queryFn: () => adminAPI.getInvestors(params),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
};

export const useUpdateInvestorStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage, adminNotes }: { id: string; stage: string; adminNotes?: string }) =>
      adminAPI.updateInvestorStage(id, { stage, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'investors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useDeleteInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deleteInvestor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'investors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
