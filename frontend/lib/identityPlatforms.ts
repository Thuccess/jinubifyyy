/** Full set for identity dashboard social manager. */
export const IDENTITY_SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'messenger', label: 'Messenger' },
  { id: 'x', label: 'Twitter (X)' },
  { id: 'snapchat', label: 'Snapchat' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'threads', label: 'Threads' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'wechat', label: 'WeChat' },
  { id: 'website', label: 'Website' },
] as const;

export type IdentitySocialPlatformId = (typeof IDENTITY_SOCIAL_PLATFORMS)[number]['id'];
