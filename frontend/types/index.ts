export type Theme = 'light' | 'dark';

export type AccountType = 'personal' | 'business';

export interface SocialLink {
  platform: string;
  url: string;
}

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
  accountType?: AccountType;
  profileSlug?: string | null;
  qrCodeUrl?: string;
  socialLinks?: SocialLink[];
  status?: string;
  rejectionReason?: string;
  isEmailVerified?: boolean;
  /** When false, login and API access are blocked (admin-controlled). */
  isActive?: boolean;
  phone?: string;
  website?: string;
  location?: string;
  servicesOffered?: string[];
  publicTagline?: string;
  publicBio?: string;
  preferredChannels?: string[];
  brandGuidelines?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    toneOfVoice?: string;
    publicProfileAccentColor?: string;
    publicProfileTextColor?: string;
  };
  lastLoginAt?: Date | string;
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
