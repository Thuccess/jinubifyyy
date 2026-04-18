import type { SocialLinks } from '@/services/api';

/** Jinubify company profiles — used when CMS `/site/socials` omits a field. */
export const COMPANY_SOCIAL_DEFAULTS: SocialLinks = {
  tiktok: 'https://www.tiktok.com/@jinubify8',
  facebook: 'https://www.facebook.com/profile.php?id=61578163257283',
  linkedin: 'https://ug.linkedin.com/in/ruot-maliah-04b027330',
  twitter: 'https://x.com/maliah_ruot',
};

/** Non-empty API values win; otherwise company defaults. */
export function mergeCompanySocials(api?: SocialLinks | null): SocialLinks {
  const d = COMPANY_SOCIAL_DEFAULTS;
  return {
    facebook: api?.facebook?.trim() || d.facebook || '',
    twitter: api?.twitter?.trim() || d.twitter || '',
    instagram: api?.instagram?.trim() || '',
    linkedin: api?.linkedin?.trim() || d.linkedin || '',
    youtube: api?.youtube?.trim() || '',
    tiktok: api?.tiktok?.trim() || d.tiktok || '',
  };
}

/** Display order + hrefs for the Partners strip (Supporting Businesses…). */
export const COMPANY_SOCIAL_STRIP: { name: string; href: string }[] = [
  { name: 'TikTok', href: COMPANY_SOCIAL_DEFAULTS.tiktok! },
  { name: 'Facebook', href: COMPANY_SOCIAL_DEFAULTS.facebook! },
  { name: 'LinkedIn', href: COMPANY_SOCIAL_DEFAULTS.linkedin! },
  { name: 'X', href: COMPANY_SOCIAL_DEFAULTS.twitter! },
];

/** CMS may still use legacy labels (e.g. Twitter); map to company URLs. */
export const COMPANY_SOCIAL_HREF_BY_NAME: Record<string, string> = {
  TikTok: COMPANY_SOCIAL_DEFAULTS.tiktok!,
  Facebook: COMPANY_SOCIAL_DEFAULTS.facebook!,
  LinkedIn: COMPANY_SOCIAL_DEFAULTS.linkedin!,
  X: COMPANY_SOCIAL_DEFAULTS.twitter!,
  Twitter: COMPANY_SOCIAL_DEFAULTS.twitter!,
};
