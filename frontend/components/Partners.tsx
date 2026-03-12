import React from 'react';
import { YouTubeIcon, TwitterIcon, InstagramIcon, TikTokIcon, FacebookIcon } from './icons/Socials';
import type { PartnersContent } from './cms/sectionTypes';

const PARTNER_ICONS: Record<string, React.ReactNode> = {
  YouTube: <YouTubeIcon className="h-8 w-auto" />,
  Twitter: <TwitterIcon className="h-8 w-auto" />,
  Instagram: <InstagramIcon className="h-8 w-auto" />,
  TikTok: <TikTokIcon className="h-8 w-auto" />,
  Facebook: <FacebookIcon className="h-8 w-auto" />,
};
const DEFAULT_NAMES = ['YouTube', 'Twitter', 'Instagram', 'TikTok', 'Facebook'];

const Partners: React.FC<{ content?: PartnersContent }> = ({ content: c }) => {
  const names = (c?.platformNames && c.platformNames.length > 0) ? c.platformNames : DEFAULT_NAMES;
  const partners = names.map((name) => ({ name, icon: PARTNER_ICONS[name] ?? null, href: '#' }));
  const eyebrow = c?.eyebrow ?? 'Supporting Businesses Across East Africa';
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h2 className="text-sm font-semibold text-text-secondary tracking-wider uppercase">
                {eyebrow}
            </h2>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-12 items-center">
               {partners.filter((p) => p.icon).map((partner) => (
                    <a 
                        key={partner.name}
                        href={partner.href} 
                        className="flex justify-center text-text-muted grayscale hover:grayscale-0 hover:text-text-primary transition duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit our partner ${partner.name}`}
                    >
                        {partner.icon}
                    </a>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;