export type Theme = 'light' | 'dark';

export interface User {
  _id?: string;
  name: string;
  email?: string;
  photoURL: string;
  role?: 'user' | 'editor' | 'admin' | 'super_admin';
  balance?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  company?: string;
  industry?: string;
  preferredChannels?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Array<{ msg: string; param: string }>;
  error?: string;
}
