import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, EventItemPayload } from '../services/api';

export const useEvents = (params?: { page?: number; limit?: number; featured?: boolean }) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsAPI.getEvents(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useEventBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsAPI.getBySlug(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminEvents = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin-events', params],
    queryFn: () => eventsAPI.adminList(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useEventMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['admin-events'] });
  };

  return {
    createEvent: useMutation({
      mutationFn: (payload: EventItemPayload) => eventsAPI.create(payload),
      onSuccess: invalidate,
    }),
    updateEvent: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: EventItemPayload }) => eventsAPI.update(id, payload),
      onSuccess: invalidate,
    }),
    deleteEvent: useMutation({
      mutationFn: (id: string) => eventsAPI.remove(id),
      onSuccess: invalidate,
    }),
    reorderEvents: useMutation({
      mutationFn: (order: { id: string; order: number }[]) => eventsAPI.reorder(order),
      onSuccess: invalidate,
    }),
  };
};

