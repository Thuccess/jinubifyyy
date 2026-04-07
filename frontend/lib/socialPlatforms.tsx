/**
 * Allowed social platforms for public profile / QR. Keep order in sync with
 * `backend/constants/socialPlatforms.js`.
 */

'use client';

import type { JSX } from 'react';
import type { IconType } from 'react-icons';
import { FaLinkedin } from 'react-icons/fa6';
import {
  SiFacebook,
  SiInstagram,
  SiMessenger,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from 'react-icons/si';

export const SOCIAL_PLATFORM_IDS = [
  'facebook',
  'instagram',
  'youtube',
  'tiktok',
  'whatsapp',
  'messenger',
  'x',
  'snapchat',
  'linkedin',
  'pinterest',
  'reddit',
  'threads',
  'telegram',
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORM_IDS)[number];

const SOCIAL_ID_SET = new Set<string>(SOCIAL_PLATFORM_IDS);

export type SocialPlatformMeta = {
  label: string;
  Icon: IconType;
  /** Solid brand color (Simple Icons / official guides). */
  color?: string;
  /** Use theme foreground (for black marks on light / white on dark). */
  useThemeColor?: boolean;
};

export const SOCIAL_PLATFORM_META: Record<SocialPlatformId, SocialPlatformMeta> = {
  facebook: { label: 'Facebook', Icon: SiFacebook, color: '#0866FF' },
  instagram: { label: 'Instagram', Icon: SiInstagram, color: '#E4405F' },
  youtube: { label: 'YouTube', Icon: SiYoutube, color: '#FF0000' },
  tiktok: { label: 'TikTok', Icon: SiTiktok, useThemeColor: true },
  whatsapp: { label: 'WhatsApp', Icon: SiWhatsapp, color: '#25D366' },
  messenger: { label: 'Messenger', Icon: SiMessenger, color: '#0099FF' },
  x: { label: 'X', Icon: SiX, useThemeColor: true },
  snapchat: { label: 'Snapchat', Icon: SiSnapchat, color: '#FFFC00' },
  linkedin: { label: 'LinkedIn', Icon: FaLinkedin, color: '#0A66C2' },
  pinterest: { label: 'Pinterest', Icon: SiPinterest, color: '#E60023' },
  reddit: { label: 'Reddit', Icon: SiReddit, color: '#FF4500' },
  threads: { label: 'Threads', Icon: SiThreads, useThemeColor: true },
  telegram: { label: 'Telegram', Icon: SiTelegram, color: '#26A5E4' },
};

export function normalizeSocialPlatformId(raw: string): SocialPlatformId | null {
  const k = raw.trim().toLowerCase();
  if (k === 'twitter') return 'x';
  if (SOCIAL_ID_SET.has(k)) return k as SocialPlatformId;
  return null;
}

export function SocialPlatformGlyph({
  platform,
  className = 'h-5 w-5 shrink-0',
}: {
  platform: string;
  className?: string;
}): JSX.Element | null {
  const id = normalizeSocialPlatformId(platform);
  if (!id) return null;
  const { Icon, color, useThemeColor } = SOCIAL_PLATFORM_META[id];
  return (
    <Icon
      className={useThemeColor ? `${className} text-text-primary` : className}
      style={!useThemeColor && color ? { color } : undefined}
      aria-hidden
    />
  );
}
