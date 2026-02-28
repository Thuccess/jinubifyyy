import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardAPI.getOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDashboardOrders = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['dashboard', 'orders', params],
    queryFn: () => dashboardAPI.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDashboardActivities = (params?: { limit?: number }) => {
  return useQuery({
    queryKey: ['dashboard', 'activities', params],
    queryFn: () => dashboardAPI.getActivities(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { serviceName: string; quantity: number; price: number }) => {
      return dashboardAPI.createOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
