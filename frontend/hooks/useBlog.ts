import { useQuery } from '@tanstack/react-query';
import { blogAPI } from '../services/api';
import type { BlogQueryParams } from '../types/blog';

export const useBlogPosts = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ['blogPosts', params],
    queryFn: () => blogAPI.getAllPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => blogAPI.getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
