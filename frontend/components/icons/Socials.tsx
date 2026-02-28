

import React from 'react';
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiTiktok,
  SiWhatsapp,
  SiLinkedin,
} from 'react-icons/si';

type SocialIconProps = {
  className?: string;
};

export const FacebookIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiFacebook className={className} />
);

export const InstagramIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiInstagram className={className} />
);

export const TwitterIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiX className={className} />
);

export const YouTubeIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiYoutube className={className} />
);

export const TikTokIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiTiktok className={className} />
);

export const WhatsAppIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiWhatsapp className={className} />
);

export const LinkedInIcon: React.FC<SocialIconProps> = ({ className }) => (
  <SiLinkedin className={className} />
);

// Generic globe (kept as inline SVG since it's not a brand logo)
export const GlobeIcon: React.FC<SocialIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 9h17m-17 6h17M9.5 3.5v17m5-17v17" />
  </svg>
);