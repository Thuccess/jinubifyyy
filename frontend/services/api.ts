import axios, { AxiosInstance, AxiosError } from 'axios';
import type { AuthResponse, User } from '../types';
import type { BlogPost, BlogPostListResponse, BlogPostResponse, BlogQueryParams } from '../types/blog';
import type { UserProfileResponse, UpdateProfileData } from '../types/user';
import type { ApiResponse, ErrorResponse } from '../types/api';
import { env, hasApiUrl } from '../config/env';

// API base URL
const API_BASE_URL = env.apiUrl;

// Create axios instance (shared across the app)
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (!hasApiUrl && typeof window !== 'undefined') {
  // Surface a clear error in the console instead of crashing on import.
  // In production, this indicates a misconfigured deployment (missing NEXT_PUBLIC_API_URL).
  // The UI stays up, but API calls will fail until the env is fixed.
  // eslint-disable-next-line no-console
  console.error(
    'NEXT_PUBLIC_API_URL is not set. API requests will fail. ' +
      'Set NEXT_PUBLIC_API_URL to your backend base URL (including /api).',
  );
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      // Don't redirect from any /admin route – the admin UI should handle
      // unauthenticated state gracefully with its own messaging instead of
      // bouncing the user back to the public site.
      const path = window.location.pathname;
      const isAdminRoute = path === '/admin' || path.startsWith('/admin/');

      if (path !== '/' && !isAdminRoute) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; company: string }) => {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  verifyEmail: async (token: string): Promise<{ message: string; status?: string }> => {
    const response = await api.get<{ message: string; status?: string }>('/auth/verify-email', { params: { token } });
    return response.data;
  },
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
    return response.data;
  },
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>('/users/profile');
    return response.data;
  },
  getMyQr: async (): Promise<{ message: string; qrDataUrl: string; profileUrl: string }> => {
    const response = await api.get<{ message: string; qrDataUrl: string; profileUrl: string }>('/users/me/qr');
    return response.data;
  },
  updateProfile: async (data: UpdateProfileData): Promise<UserProfileResponse> => {
    const response = await api.put<UserProfileResponse>('/users/profile', data);
    return response.data;
  },
};

// Briefs API (user-scoped)
export const briefsAPI = {
  getBriefs: async (params?: { serviceSlug?: string }) => {
    const response = await api.get('/briefs', { params });
    return response.data as { briefs: any[] };
  },
  createBrief: async (data: { title: string; serviceSlug?: string; notes?: string }) => {
    const response = await api.post('/briefs', data);
    return response.data;
  },
  updateBrief: async (
    id: string,
    data: Partial<{ title: string; serviceSlug: string; notes: string; isDefault: boolean }>
  ) => {
    const response = await api.put(`/briefs/${id}`, data);
    return response.data;
  },
  deleteBrief: async (id: string) => {
    const response = await api.delete(`/briefs/${id}`);
    return response.data;
  },
};

// Assets API (user-scoped, URL-based)
export const assetsAPI = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data as { assets: any[] };
  },
  createAsset: async (data: { label: string; url: string; type?: string; tags?: string[] }) => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  deleteAsset: async (id: string) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

/** Normalize API blog post to flat shape (author string, imageUrl, date) for listing and post pages. */
function normalizeBlogPost(post: BlogPost | Record<string, unknown> | null): BlogPost | null {
  if (!post || typeof post !== 'object') return null;
  const p = post as Record<string, unknown>;
  const author = typeof p.author === 'object' && p.author !== null && 'name' in p.author
    ? String((p.author as { name?: string }).name ?? '')
    : String(p.author ?? '');
  const imageUrl = String(p.featuredImage ?? p.imageUrl ?? '');
  const date = p.publishedAt ?? p.date ?? p.createdAt ?? '';
  return {
    ...post,
    author,
    imageUrl,
    date: date as string | Date,
  } as BlogPost;
}

// Blog API (returns normalized posts with flat author, imageUrl, date for listing and post pages)
export const blogAPI = {
  getAllPosts: async (params?: BlogQueryParams): Promise<BlogPostListResponse> => {
    const response = await api.get<BlogPostListResponse>('/blog', { params });
    const data = response.data;
    const posts = (data.posts || []).map((post) => normalizeBlogPost(post) ?? post);
    return { ...data, posts };
  },
  getPostBySlug: async (slug: string): Promise<BlogPostResponse> => {
    const response = await api.get<BlogPostResponse>(`/blog/${slug}`);
    const data = response.data;
    const post = data.post ? normalizeBlogPost(data.post) ?? data.post : data.post;
    return { ...data, post };
  },
};

// Public blogs API (GET /api/blogs — published only; no auth)
export const blogsPublicAPI = {
  getList: async (params?: BlogQueryParams): Promise<BlogPostListResponse> => {
    const response = await api.get<BlogPostListResponse>('/blogs', { params });
    const data = response.data;
    const posts = (data.posts || []).map((post) => normalizeBlogPost(post) ?? post);
    return { ...data, posts };
  },
  getBySlug: async (slug: string): Promise<BlogPostResponse> => {
    const response = await api.get<BlogPostResponse>(`/blogs/${encodeURIComponent(slug)}`);
    const data = response.data;
    const post = data.post ? normalizeBlogPost(data.post) ?? data.post : data.post;
    return { ...data, post };
  },
  getFeatured: async (): Promise<{ posts: BlogPost[] }> => {
    const response = await api.get<{ posts: BlogPost[] }>('/blogs/featured');
    const posts = (response.data.posts || []).map((p) => normalizeBlogPost(p) ?? p);
    return { posts };
  },
  getByCategory: async (category: string, params?: { page?: number; limit?: number }): Promise<BlogPostListResponse & { category: string }> => {
    const response = await api.get(`/blogs/category/${encodeURIComponent(category)}`, { params });
    const data = response.data;
    const posts = (data.posts || []).map((p) => normalizeBlogPost(p) ?? p);
    return { ...data, posts };
  },
  getByTag: async (tag: string, params?: { page?: number; limit?: number }): Promise<BlogPostListResponse & { tag: string }> => {
    const response = await api.get(`/blogs/tag/${encodeURIComponent(tag)}`, { params });
    const data = response.data;
    const posts = (data.posts || []).map((p) => normalizeBlogPost(p) ?? p);
    return { ...data, posts };
  },
};

// Contact API
export const contactAPI = {
  submitContact: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await api.post('/contact', data);
    return response.data;
  },
};

// Career applications (public)
export const careerAPI = {
  apply: async (data: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
    coverLetter?: string;
    resumeUrl?: string;
  }) => {
    const response = await api.post('/career/apply', data);
    return response.data as {
      message: string;
      application: { _id: string; status: string; createdAt: string };
    };
  },
};

// Investment inquiries (public)
export const investmentAPI = {
  inquire: async (data: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    interestLevel?: string;
    investmentRange?: string;
    message?: string;
  }) => {
    const response = await api.post('/investment/inquire', data);
    return response.data as {
      message: string;
      inquiry: { _id: string; stage: string; createdAt: string };
    };
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  getOrders: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/dashboard/orders', { params });
    return response.data;
  },
  getActivities: async (params?: { limit?: number }) => {
    const response = await api.get('/dashboard/activities', { params });
    return response.data;
  },
  createOrder: async (data: { serviceName: string; quantity: number; price: number }) => {
    const response = await api.post('/dashboard/orders', data);
    return response.data;
  },
};

// Client Dashboard API (client portal)
export const clientAPI = {
  getDashboardSummary: async () => {
    const response = await api.get('/client/dashboard-summary');
    return response.data;
  },
  getProjects: async () => {
    const response = await api.get('/client/projects');
    return response.data;
  },
  getProjectById: async (id: string) => {
    const response = await api.get(`/client/projects/${id}`);
    return response.data;
  },
  getMessages: async () => {
    const response = await api.get('/client/messages');
    return response.data;
  },
  sendMessage: async (data: { projectId?: string; message: string }) => {
    const response = await api.post('/client/messages', data);
    return response.data;
  },
  getFiles: async () => {
    const response = await api.get('/client/files');
    return response.data;
  },
  getPayments: async () => {
    const response = await api.get('/client/payments');
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/client/reports');
    return response.data;
  },
  submitServiceRequest: async (data: {
    serviceType: string;
    projectDescription: string;
    budget?: number;
    deadline?: string;
    attachments?: { name: string; url: string }[];
  }) => {
    const response = await api.post('/client/service-request', data);
    return response.data;
  },
  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    password?: string;
  }) => {
    const response = await api.patch('/client/profile', data);
    return response.data;
  },
};

// Public Orders API (pricing page "Order Now")
export interface PublicOrderCustomer {
  name: string;
  phone: string;
  email: string;
  country: string;
  city?: string;
  company?: string;
  industry?: string;
  notes?: string;
}

export interface PublicOrderMeta {
  service: string;
  serviceSlug: string;
  packageName: string;
  price: number;
  currency: string;
  pricingCategory: string;
  sourcePage: string;
  status: 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled';
  orderTimestamp: string;
}

export interface CreatePublicOrderPayload {
  customer: PublicOrderCustomer;
  order: PublicOrderMeta;
}

export const publicOrdersAPI = {
  create: async (payload: CreatePublicOrderPayload) => {
    const response = await api.post('/orders/create', payload);
    return response.data as { message: string; orderId: string };
  },
};

// Blog API (Admin) — requires auth
export const blogAdminAPI = {
  getAllPosts: async (params?: { page?: number; limit?: number; search?: string; published?: boolean; status?: string }) => {
    const response = await api.get('/blog', { params });
    return response.data;
  },
  getPostBySlug: async (slug: string): Promise<BlogPostResponse> => {
    const response = await api.get<BlogPostResponse>(`/blog/${slug}`);
    return response.data;
  },
  createPost: async (data: { slug: string; title: string; excerpt: string; content: string; imageUrl: string; author: string; category: string; published?: boolean; status?: string; featured?: boolean; tags?: string[]; seo?: { title?: string; description?: string; keywords?: string[] } }) => {
    const response = await api.post('/blog', data);
    return response.data;
  },
  updatePost: async (slug: string, data: Partial<{ title: string; excerpt: string; content: string; imageUrl: string; author: string; category: string; published: boolean; status: string; featured: boolean; tags: string[]; seo: { title?: string; description?: string; keywords?: string[] } }>) => {
    const response = await api.put(`/blog/${slug}`, data);
    return response.data;
  },
  patchStatus: async (slug: string, status: 'draft' | 'review' | 'published' | 'archived') => {
    const response = await api.patch(`/blog/${slug}/status`, { status });
    return response.data;
  },
  deletePost: async (slug: string) => {
    const response = await api.delete(`/blog/${slug}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getAnalytics: async (days?: number) => {
    const response = await api.get<{
      traffic: { date: string; count: number }[];
      leads: { date: string; count: number }[];
      conversions: { date: string; count: number }[];
      topServices: { name: string; count: number }[];
      topBlogPosts: { title: string; slug: string; views: number; date?: string }[];
    }>('/admin/analytics', { params: days ? { days } : {} });
    return response.data;
  },
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUsersByStatus: async (status: 'pending' | 'approved' | 'rejected', params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get(`/admin/users/${status}`, { params });
    return response.data;
  },
  getUserMessages: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/messages`);
    return response.data;
  },
  sendUserMessage: async (userId: string, data: { message: string; projectId?: string }) => {
    const response = await api.post(`/admin/users/${userId}/messages`, data);
    return response.data;
  },
  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    const response = await api.put(`/admin/users/${userId}`, { role });
    return response.data;
  },
  approveUser: async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/approve`);
    return response.data;
  },
  rejectUser: async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/reject`);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  getContacts: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/admin/contacts', { params });
    return response.data;
  },
  updateContactStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/contacts/${id}`, { status });
    return response.data;
  },
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    serviceSlug?: string;
    country?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/orders/${id}`, { status });
    return response.data;
  },
  updateOrder: async (id: string, payload: { status: string; adminNotes?: string }) => {
    const response = await api.put(`/admin/orders/${id}`, payload);
    return response.data;
  },
  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  getTestimonials: async () => {
    const response = await api.get('/admin/testimonials');
    return response.data;
  },
  createTestimonial: async (data: { name: string; title: string; avatar?: string; text: string; stars?: number; order?: number; isActive?: boolean }) => {
    const response = await api.post('/admin/testimonials', data);
    return response.data;
  },
  updateTestimonial: async (id: string, data: Partial<{ name: string; title: string; avatar: string; text: string; stars: number; order: number; isActive: boolean }>) => {
    const response = await api.put(`/admin/testimonials/${id}`, data);
    return response.data;
  },
  deleteTestimonial: async (id: string) => {
    const response = await api.delete(`/admin/testimonials/${id}`);
    return response.data;
  },
  getAbout: async () => {
    const response = await api.get('/admin/about');
    return response.data;
  },
  updateAbout: async (data: AboutPagePayload) => {
    const response = await api.put('/admin/about', data);
    return response.data;
  },
  getTeam: async () => {
    const response = await api.get('/admin/team');
    return response.data;
  },
  updateTeam: async (data: TeamPagePayload) => {
    const response = await api.put('/admin/team', data);
    return response.data;
  },
  getApplications: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/admin/applications', { params });
    return response.data as {
      applications: any[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  updateApplicationStatus: async (id: string, payload: { status: string; adminNotes?: string }) => {
    const response = await api.patch(`/admin/applications/${id}/status`, payload);
    return response.data;
  },
  deleteApplication: async (id: string) => {
    const response = await api.delete(`/admin/applications/${id}`);
    return response.data;
  },
  getInvestors: async (params?: { page?: number; limit?: number; stage?: string; search?: string }) => {
    const response = await api.get('/admin/investors', { params });
    return response.data as {
      investors: any[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  updateInvestorStage: async (id: string, payload: { stage: string; adminNotes?: string }) => {
    const response = await api.patch(`/admin/investors/${id}/stage`, payload);
    return response.data;
  },
  deleteInvestor: async (id: string) => {
    const response = await api.delete(`/admin/investors/${id}`);
    return response.data;
  },
  getActivity: async (params?: {
    page?: number;
    limit?: number;
    user?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/admin/activity', { params });
    return response.data as {
      activities: Array<{
        _id: string;
        user: { name: string; email: string } | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        description: string;
        timestamp: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },
  search: async (q: string, limit?: number) => {
    const response = await api.get('/admin/search', { params: { q, limit } });
    return response.data as {
      users: Array<{ _id: string; name: string; email: string; role?: string }>;
      orders: Array<{ _id: string; serviceName: string; status: string; createdAt: string; customer?: { name?: string; email?: string } }>;
      services: Array<{ _id: string; title: string; slug: string }>;
      blogPosts: Array<{ _id: string; title: string; slug: string; status?: string; published?: boolean }>;
      cmsPages: Array<{ _id: string; slug: string; title: string; type?: string }>;
    };
  },
  bulkBlog: async (action: 'publish' | 'unpublish' | 'delete', ids: string[]) => {
    const response = await api.post('/admin/blog/bulk', { action, ids });
    return response.data as { message: string; count: number };
  },
  bulkServices: async (action: 'activate' | 'deactivate' | 'delete', ids: string[]) => {
    const response = await api.post('/admin/services/bulk', { action, ids });
    return response.data as { message: string; count: number };
  },
  bulkPricing: async (action: 'activate' | 'deactivate' | 'delete', ids: string[]) => {
    const response = await api.post('/admin/pricing/bulk', { action, ids });
    return response.data as { message: string; count: number };
  },
  bulkOrders: async (status: string, ids: string[]) => {
    const response = await api.post('/admin/orders/bulk', { action: 'updateStatus', status, ids });
    return response.data as { message: string; count: number };
  },
  bulkUsers: async (action: 'changeRole' | 'delete', ids: string[], role?: 'user' | 'admin') => {
    const response = await api.post('/admin/users/bulk', { action, ids, ...(action === 'changeRole' && role ? { role } : {}) });
    return response.data as { message: string; count: number };
  },
  getMedia: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    sort?: 'createdAt-asc' | 'createdAt-desc';
  }) => {
    const response = await api.get('/admin/media', { params });
    return response.data as {
      media: Array<{
        _id: string;
        filename: string;
        url: string;
        tags: string[];
        usedBy: Array<{ entityType: string; entityId: string }>;
        usageCount: number;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },
  updateMediaTags: async (id: string, tags: string[]) => {
    const response = await api.patch(`/admin/media/${id}/tags`, { tags });
    return response.data as { message: string; media: any };
  },
  deleteMedia: async (id: string) => {
    const response = await api.delete(`/admin/media/${id}`);
    return response.data as { message: string; usageCount?: number };
  },
};

// Image upload (admin): multipart/form-data, field name "image"
export const uploadAPI = {
  uploadImage: async (file: File): Promise<{ url: string; filename: string; image?: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ url: string; filename: string; image?: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// About page content (public + admin)
export interface AboutPagePayload {
  hero?: {
    eyebrow?: string;
    heading?: string;
    subtitle?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  };
  ourStory?: {
    heading?: string;
    imageUrl?: string;
    paragraph1?: string;
    paragraph2?: string;
  };
  stats?: {
    heading?: string;
    subtext?: string;
    items?: { value: number; label: string }[];
  };
  whyJinubify?: {
    heading?: string;
    intro?: string;
    tagline?: string;
    differentiators?: { iconKey: string; title: string; description: string }[];
    coreValues?: { iconKey: string; title: string; description: string }[];
  };
}

export const aboutAPI = {
  get: async (): Promise<AboutPagePayload & { _id?: string }> => {
    const response = await api.get<AboutPagePayload & { _id?: string }>('/about');
    return response.data;
  },
};

// Team page content (public + admin)
export interface TeamMemberPayload {
  _id?: string;
  name: string;
  role: string;
  imageUrl?: string;
  bio?: string;
  detailedBio?: string;
  department?: string;
  social?: { linkedin?: string; twitter?: string; website?: string };
  order?: number;
}

export interface TeamPagePayload {
  hero?: { eyebrow?: string; heading?: string; subtitle?: string };
  stripHeading?: string;
  members?: TeamMemberPayload[];
}

export const teamAPI = {
  get: async (): Promise<TeamPagePayload & { _id?: string }> => {
    const response = await api.get<TeamPagePayload & { _id?: string }>('/team');
    return response.data;
  },
};

// Public Testimonials (home page)
export interface TestimonialItem {
  _id?: string;
  name: string;
  title: string;
  avatar: string;
  text: string;
  stars: number;
  order?: number;
  isActive?: boolean;
}

export const testimonialsAPI = {
  getList: async (): Promise<{ testimonials: TestimonialItem[] }> => {
    const response = await api.get<{ testimonials: TestimonialItem[] }>('/testimonials');
    return response.data;
  },
};

// Events collection (public + admin)
export interface EventItemPayload {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  content?: string;
  date?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  isFeatured?: boolean;
  order?: number;
}

export const eventsAPI = {
  // Public list
  getEvents: async (params?: { page?: number; limit?: number; featured?: boolean }) => {
    const response = await api.get('/events', {
      params: {
        ...params,
        featured: typeof params?.featured === 'boolean' ? String(params.featured) : undefined,
      },
    });
    return response.data as {
      data: EventItemPayload[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  // Public single
  getBySlug: async (slug: string) => {
    const response = await api.get(`/events/${encodeURIComponent(slug)}`);
    return response.data as { data: EventItemPayload };
  },
  // Admin list
  adminList: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/events/admin/list', { params });
    return response.data as {
      data: EventItemPayload[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  create: async (payload: EventItemPayload) => {
    const response = await api.post('/events/admin', payload);
    return response.data as { message: string; data: EventItemPayload };
  },
  update: async (id: string, payload: EventItemPayload) => {
    const response = await api.put(`/events/admin/${id}`, payload);
    return response.data as { message: string; data: EventItemPayload };
  },
  remove: async (id: string) => {
    const response = await api.delete(`/events/admin/${id}`);
    return response.data as { message: string };
  },
  reorder: async (order: { id: string; order: number }[]) => {
    const response = await api.patch('/events/reorder', { order });
    return response.data as { message: string; data: EventItemPayload[] };
  },
};

// Portfolio collection (public + admin)
export interface PortfolioItemPayload {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  content?: string;
  date?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  isFeatured?: boolean;
  order?: number;
}

export const portfolioAPI = {
  // Public list
  getList: async (params?: { page?: number; limit?: number; featured?: boolean }) => {
    const response = await api.get('/portfolio', {
      params: {
        ...params,
        featured: typeof params?.featured === 'boolean' ? String(params.featured) : undefined,
      },
    });
    return response.data as {
      data: PortfolioItemPayload[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  // Public single
  getBySlug: async (slug: string) => {
    const response = await api.get(`/portfolio/${encodeURIComponent(slug)}`);
    return response.data as { data: PortfolioItemPayload };
  },
  // Admin list
  adminList: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/portfolio/admin/list', { params });
    return response.data as {
      data: PortfolioItemPayload[];
      pagination?: { page: number; limit: number; total: number; pages: number };
    };
  },
  create: async (payload: PortfolioItemPayload) => {
    const response = await api.post('/portfolio/admin', payload);
    return response.data as { message: string; data: PortfolioItemPayload };
  },
  update: async (id: string, payload: PortfolioItemPayload) => {
    const response = await api.put(`/portfolio/admin/${id}`, payload);
    return response.data as { message: string; data: PortfolioItemPayload };
  },
  remove: async (id: string) => {
    const response = await api.delete(`/portfolio/admin/${id}`);
    return response.data as { message: string };
  },
  reorder: async (order: { id: string; order: number }[]) => {
    const response = await api.patch('/portfolio/reorder', { order });
    return response.data as { message: string; data: PortfolioItemPayload[] };
  },
};

// Services CMS API (admin + public)
export type ServicePayload = {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  intro?: string;
  bulletsLabel?: string;
  bullets?: string[];
  hasDemo?: boolean;
  category?: string;
  icon?: string;
  imageUrl?: string;
  startingPrice?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
};

export const servicesAPI = {
  getServices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
    category?: string;
    featured?: boolean;
  }) => {
    const response = await api.get('/services', {
      params: {
        ...params,
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
        featured: typeof params?.featured === 'boolean' ? String(params.featured) : undefined,
      },
    });
    return response.data;
  },
  getServiceById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  getServiceBySlug: async (slug: string) => {
    const response = await api.get(`/services/by-slug/${slug}`);
    return response.data;
  },
  getServicesWithDemos: async () => {
    const response = await api.get('/services/with-demos');
    return response.data;
  },
  createService: async (data: ServicePayload) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  updateService: async (id: string, data: Partial<ServicePayload>) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  updateServiceStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/services/${id}/status`, { isActive });
    return response.data;
  },
  reorderServices: async (order: { id: string; order: number }[]) => {
    const response = await api.patch('/services/reorder', { order });
    return response.data;
  },
  deleteService: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

export const pricingAPI = {
  getPackages: async (params?: { page?: number; limit?: number; service?: string; active?: boolean }) => {
    const response = await api.get('/pricing', {
      params: {
        ...params,
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
      },
    });
    return response.data;
  },
  createPackage: async (data: {
    service: string;
    name: string;
    price: string;
    description?: string;
    ctaText?: string;
    billingPeriod?: 'monthly' | 'one-time' | 'custom';
    features?: string[];
    isFeatured?: boolean;
    isActive?: boolean;
    order?: number;
  }) => {
    const response = await api.post('/pricing', data);
    return response.data;
  },
  updatePackage: async (id: string, data: Partial<{
    service: string;
    name: string;
    price: string;
    description: string;
    ctaText: string;
    billingPeriod: 'monthly' | 'one-time' | 'custom';
    features: string[];
    isFeatured: boolean;
    isActive: boolean;
    order: number;
  }>) => {
    const response = await api.put(`/pricing/${id}`, data);
    return response.data;
  },
  deletePackage: async (id: string) => {
    const response = await api.delete(`/pricing/${id}`);
    return response.data;
  },
  seedDefaultPricing: async () => {
    const response = await api.post<{ message: string; created: number; updated: number; skipped?: string[] }>('/pricing/seed');
    return response.data;
  },
};

export const demosAPI = {
  getDemos: async (params?: { page?: number; limit?: number; service?: string; active?: boolean }) => {
    const response = await api.get('/demos', {
      params: {
        ...params,
        active: typeof params?.active === 'boolean' ? String(params.active) : undefined,
      },
    });
    return response.data;
  },
  getDemoBySlug: async (slug: string) => {
    const response = await api.get(`/demos/by-slug/${slug}`);
    return response.data;
  },
  getDemosByServiceSlug: async (serviceSlug: string) => {
    const response = await api.get(`/demos/by-service-slug/${serviceSlug}`);
    return response.data;
  },
  getDemoByServiceAndSlug: async (serviceSlug: string, demoSlug: string) => {
    const response = await api.get(`/demos/by-service-demo/${serviceSlug}/${demoSlug}`);
    return response.data;
  },
  createDemo: async (data: {
    service: string;
    title: string;
    slug: string;
    description: string;
    category?: string;
    demoUrl?: string;
    repoUrl?: string;
    techStack?: string[];
    tags?: string[];
    isFeatured?: boolean;
    embeddedConfig?: unknown;
    isActive?: boolean;
    order?: number;
    images?: { url: string; order: number }[];
    coverImageUrl?: string;
  }) => {
    const response = await api.post('/demos', data);
    return response.data;
  },
  updateDemo: async (id: string, data: Partial<{
    service: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    demoUrl: string;
    repoUrl: string;
    techStack: string[];
    tags: string[];
    isFeatured: boolean;
    embeddedConfig: unknown;
    isActive: boolean;
    order: number;
    images: { url: string; order: number }[];
    coverImageUrl: string;
  }>) => {
    const response = await api.put(`/demos/${id}`, data);
    return response.data;
  },
  deleteDemo: async (id: string) => {
    const response = await api.delete(`/demos/${id}`);
    return response.data;
  },
  updateDemoStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/demos/${id}/status`, { isActive });
    return response.data;
  },
  reorderDemos: async (order: { id: string; order: number }[]) => {
    const response = await api.patch('/demos/reorder', { order });
    return response.data;
  },
};

// Helper function to store token and user
export const storeAuth = (token: string, user: User, remember: boolean = false): void => {
  if (remember) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }
};

// Helper function to clear auth
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
};

// CMS API (public – no auth required for getSite)
export interface CmsSiteResponse {
  siteSettings: Record<string, unknown>;
  nav: Array< { id: string; label: string; href: string; order: number } >;
  pages: Array<{
    _id: string;
    slug: string;
    title: string;
    metaDescription?: string;
    content: Record<string, unknown>;
    sections: Array<{
      _id: string;
      sectionKey: string;
      content: Record<string, unknown>;
      order: number;
    }>;
  }>;
}

export const cmsAPI = {
  getSite: async (): Promise<CmsSiteResponse> => {
    const response = await api.get<CmsSiteResponse>('/cms/site');
    return response.data;
  },
};

export interface SocialLinks {
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
}

export const siteAPI = {
  getSocials: async (): Promise<{ socials: SocialLinks }> => {
    const response = await api.get<{ socials: SocialLinks }>('/site/socials');
    return response.data;
  },
  // Admin-only (auth required via the axios interceptor)
  putSocials: async (socials: SocialLinks): Promise<{ data: SocialLinks } | { data: unknown }> => {
    const response = await api.put('/admin/socials', socials);
    return response.data as any;
  },
};

// Admin CMS API (requires admin auth)
export const adminCmsAPI = {
  getSiteSettings: async () => {
    const response = await api.get<{ data: Array<Record<string, unknown>> }>('/admin/cms/site-settings');
    return response.data;
  },
  putSiteSetting: async (payload: { key: string; value?: unknown; isVisible?: boolean; isDeleted?: boolean; status?: string; order?: number }) => {
    const response = await api.put<{ data: Record<string, unknown> }>('/admin/cms/site-settings', payload);
    return response.data;
  },
  getNav: async () => {
    const response = await api.get<{ data: Array<Record<string, unknown>> }>('/admin/cms/nav');
    return response.data;
  },
  createNavItem: async (payload: { label: string; href: string; order?: number; isVisible?: boolean; status?: string }) => {
    const response = await api.post<{ data: Record<string, unknown> }>('/admin/cms/nav', payload);
    return response.data;
  },
  updateNavItem: async (id: string, payload: { label?: string; href?: string; isVisible?: boolean; isDeleted?: boolean; status?: string; order?: number }) => {
    const response = await api.put<{ data: Record<string, unknown> }>(`/admin/cms/nav/${id}`, payload);
    return response.data;
  },
  deleteNavItem: async (id: string) => {
    const response = await api.delete<{ data: Record<string, unknown> }>(`/admin/cms/nav/${id}`);
    return response.data;
  },
  getPages: async (params?: { type?: string; status?: string; search?: string }) => {
    const response = await api.get<{ data: Array<Record<string, unknown>> }>('/admin/cms/pages', {
      params,
    });
    return response.data;
  },
  getPage: async (id: string) => {
    const response = await api.get<{ data: Record<string, unknown> }>(`/admin/cms/pages/${id}`);
    return response.data;
  },
  createPage: async (payload: {
    slug: string;
    title?: string;
    type?: string;
    seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
    isVisible?: boolean;
    status?: string;
    order?: number;
  }) => {
    const response = await api.post<{ data: Record<string, unknown> }>('/admin/cms/pages', payload);
    return response.data;
  },
  updatePage: async (id: string, payload: Record<string, unknown>) => {
    const response = await api.put<{ data: Record<string, unknown> }>(`/admin/cms/pages/${id}`, payload);
    return response.data;
  },
  deletePage: async (id: string) => {
    const response = await api.delete<{ data: Record<string, unknown> }>(`/admin/cms/pages/${id}`);
    return response.data;
  },
  getSections: async (pageId: string) => {
    const response = await api.get<{ data: Array<Record<string, unknown>> }>(`/admin/cms/pages/${pageId}/sections`);
    return response.data;
  },
  createSection: async (pageId: string, payload: { sectionKey: string; type?: string; content?: Record<string, unknown>; isVisible?: boolean; status?: string; order?: number }) => {
    const response = await api.post<{ data: Record<string, unknown> }>(`/admin/cms/pages/${pageId}/sections`, payload);
    return response.data;
  },
  updateSection: async (pageId: string, sectionId: string, payload: Record<string, unknown>) => {
    const response = await api.put<{ data: Record<string, unknown> }>(`/admin/cms/pages/${pageId}/sections/${sectionId}`, payload);
    return response.data;
  },
  deleteSection: async (pageId: string, sectionId: string) => {
    const response = await api.delete<{ data: Record<string, unknown> }>(`/admin/cms/pages/${pageId}/sections/${sectionId}`);
    return response.data;
  },
};

// Helper function to get stored token
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to get stored user
export const getStoredUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

export default api;

