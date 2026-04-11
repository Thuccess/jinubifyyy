import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI, pricingAPI, demosAPI } from '../services/api';

// Services
export const useServices = (params?: { page?: number; limit?: number; search?: string; active?: boolean }) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesAPI.getServices(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useServiceBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: () => servicesAPI.getServiceBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useServicesWithDemos = () => {
  return useQuery({
    queryKey: ['services', 'with-demos'],
    queryFn: () => servicesAPI.getServicesWithDemos(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useServiceById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesAPI.getServiceById(id as string),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useServiceMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  return {
    createService: useMutation({
      mutationFn: servicesAPI.createService,
      onSuccess: invalidate,
    }),
    updateService: useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) => servicesAPI.updateService(id, data),
      onSuccess: invalidate,
    }),
    updateServiceStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        servicesAPI.updateServiceStatus(id, isActive),
      onSuccess: invalidate,
    }),
    reorderServices: useMutation({
      mutationFn: (order: { id: string; order: number }[]) => servicesAPI.reorderServices(order),
      onSuccess: invalidate,
    }),
    deleteService: useMutation({
      mutationFn: (id: string) => servicesAPI.deleteService(id),
      onSuccess: invalidate,
    }),
  };
};

// Pricing
export const usePricingPackages = (params?: { page?: number; limit?: number; service?: string; active?: boolean }) => {
  return useQuery({
    queryKey: ['pricing', params],
    queryFn: () => pricingAPI.getPackages(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePricingMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pricing'] });
  };

  return {
    createPackage: useMutation({
      mutationFn: pricingAPI.createPackage,
      onSuccess: invalidate,
    }),
    updatePackage: useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) => pricingAPI.updatePackage(id, data),
      onSuccess: invalidate,
    }),
    deletePackage: useMutation({
      mutationFn: (id: string) => pricingAPI.deletePackage(id),
      onSuccess: invalidate,
    }),
    seedDefaultPricing: useMutation({
      mutationFn: pricingAPI.seedDefaultPricing,
      onSuccess: invalidate,
    }),
  };
};

// Demos
export const useDemos = (params?: { page?: number; limit?: number; service?: string; active?: boolean }) => {
  return useQuery({
    queryKey: ['demos', params],
    queryFn: () => demosAPI.getDemos(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDemoBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['demo', slug],
    queryFn: () => demosAPI.getDemoBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDemosByServiceSlug = (serviceSlug: string | undefined) => {
  return useQuery({
    queryKey: ['demos', 'by-service', serviceSlug],
    queryFn: () => demosAPI.getDemosByServiceSlug(serviceSlug as string),
    enabled: !!serviceSlug,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDemoByServiceAndSlug = (serviceSlug: string | undefined, demoSlug: string | undefined) => {
  return useQuery({
    queryKey: ['demo', serviceSlug, demoSlug],
    queryFn: () => demosAPI.getDemoByServiceAndSlug(serviceSlug as string, demoSlug as string),
    enabled: !!serviceSlug && !!demoSlug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWebsiteDemos = (params?: { category?: string; featured?: boolean; q?: string }) => {
  return useQuery({
    queryKey: ['demos', 'website', params],
    queryFn: () => demosAPI.getWebsiteDemos(params),
    staleTime: 60 * 1000,
  });
};

export const useWebsiteDemosAdmin = () => {
  return useQuery({
    queryKey: ['demos', 'website', 'admin'],
    queryFn: () => demosAPI.getWebsiteDemosAdmin(),
    staleTime: 30 * 1000,
  });
};

export const useWebsiteDemoBySlug = (
  slug: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['demos', 'website', 'detail', slug],
    queryFn: () => demosAPI.getWebsiteDemoBySlug(slug as string),
    enabled: (options?.enabled ?? true) && !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDemoMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['demos'] });
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  return {
    createDemo: useMutation({
      mutationFn: demosAPI.createDemo,
      onSuccess: invalidate,
    }),
    updateDemo: useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) => demosAPI.updateDemo(id, data),
      onSuccess: invalidate,
    }),
    deleteDemo: useMutation({
      mutationFn: (id: string) => demosAPI.deleteDemo(id),
      onSuccess: invalidate,
    }),
    updateDemoStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        demosAPI.updateDemoStatus(id, isActive),
      onSuccess: invalidate,
    }),
    reorderDemos: useMutation({
      mutationFn: (order: { id: string; order: number }[]) => demosAPI.reorderDemos(order),
      onSuccess: invalidate,
    }),
    updateDemoFeatured: useMutation({
      mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
        demosAPI.updateDemoFeatured(id, isFeatured),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ['demos', 'website'] });
      },
    }),
    recordWebsiteDemoClick: useMutation({
      mutationFn: (slug: string) => demosAPI.recordWebsiteDemoClick(slug),
    }),
  };
};

