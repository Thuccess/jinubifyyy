/** Content shapes for CMS-driven sections (optional; components fall back to built-in defaults). */

export interface HeroContent {
  badge?: string;
  badgeSub?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  ratingText?: string;
  ratingSub?: string;
  bullets?: string[];
}

export interface PartnersContent {
  eyebrow?: string;
  platformNames?: string[];
}

export interface HowItWorksContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps?: Array<{ title: string; description: string }>;
}

export interface ServicesContent {
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string }>;
}

export interface FeaturePanelContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  items?: Array<{ name: string; description: string }>;
}

export interface GrowthContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export type SectionContent =
  | HeroContent
  | PartnersContent
  | HowItWorksContent
  | ServicesContent
  | FeaturePanelContent
  | GrowthContent
  | Record<string, unknown>;

export interface CmsSection {
  _id: string;
  sectionKey: string;
  content: SectionContent;
  order: number;
}
