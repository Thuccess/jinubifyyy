export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  BLOG: {
    BASE: '/blog',
    BY_SLUG: (slug: string) => `/blog/${slug}`,
  },
  CONTACT: '/contact',
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    ORDERS: '/dashboard/orders',
    ACTIVITIES: '/dashboard/activities',
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    CONTACTS: '/admin/contacts',
    UPDATE_CONTACT: (id: string) => `/admin/contacts/${id}`,
  },
} as const;
