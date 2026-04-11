export type WebsiteDemoPreviewMode = 'iframe' | 'new_tab';

export type WebsiteDemoVisibility = 'active' | 'hidden';

export interface WebsiteDemo {
  _id: string;
  websiteDemo?: boolean;
  title: string;
  slug: string;
  category?: string;
  demoUrl: string;
  previewMode?: WebsiteDemoPreviewMode;
  thumbnail: string;
  gallery?: string[];
  video?: string;
  shortDescription?: string;
  description?: string;
  features?: string[];
  ctaPrimary?: string;
  ctaSecondary?: string;
  price?: number | null;
  isFeatured?: boolean;
  visibility?: WebsiteDemoVisibility;
  isActive?: boolean;
  views?: number;
  clicks?: number;
  createdAt?: string;
  order?: number;
}
