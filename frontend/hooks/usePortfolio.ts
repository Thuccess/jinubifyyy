import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioAPI, type PortfolioItemPayload } from '../services/api';

export const usePortfolio = (params?: { page?: number; limit?: number; featured?: boolean }) => {
  return useQuery({
    queryKey: ['portfolio', params],
    queryFn: () => portfolioAPI.getList(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePortfolioBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['portfolio-item', slug],
    queryFn: () => portfolioAPI.getBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminPortfolio = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin-portfolio', params],
    queryFn: () => portfolioAPI.adminList(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePortfolioMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] });
  };

  return {
    createPortfolio: useMutation({
      mutationFn: (payload: PortfolioItemPayload) => portfolioAPI.create(payload),
      onSuccess: invalidate,
    }),
    updatePortfolio: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: PortfolioItemPayload }) => portfolioAPI.update(id, payload),
      onSuccess: invalidate,
    }),
    deletePortfolio: useMutation({
      mutationFn: (id: string) => portfolioAPI.remove(id),
      onSuccess: invalidate,
    }),
    reorderPortfolio: useMutation({
      mutationFn: (order: { id: string; order: number }[]) => portfolioAPI.reorder(order),
      onSuccess: invalidate,
    }),
  };
};

