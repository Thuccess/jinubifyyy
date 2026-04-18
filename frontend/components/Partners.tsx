import React from 'react';
import { TwitterIcon, TikTokIcon, FacebookIcon, LinkedInIcon } from './icons/Socials';
import type { PartnersContent } from './cms/sectionTypes';
import { COMPANY_SOCIAL_HREF_BY_NAME, COMPANY_SOCIAL_STRIP } from '@/config/companySocialLinks';

const PARTNER_ICONS: Record<string, React.ReactNode> = {
  TikTok: <TikTokIcon className="h-8 w-auto" />,
  Facebook: <FacebookIcon className="h-8 w-auto" />,
  LinkedIn: <LinkedInIcon className="h-8 w-auto" />,
  X: <TwitterIcon className="h-8 w-auto" />,
  Twitter: <TwitterIcon className="h-8 w-auto" />,
};

const DEFAULT_STRIP = COMPANY_SOCIAL_STRIP;

const Partners: React.FC<{ content?: PartnersContent }> = ({ content: c }) => {
  const fromCms =
    c?.platformNames && c.platformNames.length > 0
      ? c.platformNames
          .map((name) => ({
            name,
            href: COMPANY_SOCIAL_HREF_BY_NAME[name] || '',
            icon: PARTNER_ICONS[name] ?? null,
          }))
          .filter((p) => p.icon && p.href)
      : null;
  const partners =
    fromCms && fromCms.length > 0
      ? fromCms
      : DEFAULT_STRIP.map((p) => ({ name: p.name, href: p.href, icon: PARTNER_ICONS[p.name] ?? null }));
  const eyebrow = c?.eyebrow ?? 'Supporting Businesses Across East Africa';
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border-card bg-[color:var(--surface-card)] px-4 py-10 shadow-card sm:rounded-3xl sm:px-8 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 0%, var(--home-accent-from) 0%, transparent 45%), radial-gradient(circle at 100% 100%, var(--home-accent-to) 0%, transparent 42%)`,
            }}
            aria-hidden="true"
          />
          <div className="relative text-center">
            <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-3 sm:mb-10">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-brand-primary sm:w-10" aria-hidden="true" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted sm:text-sm">{eyebrow}</h2>
                <span className="h-px w-8 bg-brand-primary sm:w-10" aria-hidden="true" />
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 items-center gap-y-10 gap-x-6 sm:grid-cols-4 md:gap-x-4">
              {partners
                .filter((p) => p.icon)
                .map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.href}
                    className="group flex min-h-[4.5rem] items-center justify-center rounded-2xl border border-transparent px-3 py-4 transition-all duration-300 hover:border-border-card hover:bg-[color:var(--surface-muted)]/60 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Jinubify on ${partner.name}`}
                  >
                    <span className="text-text-muted grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0 group-hover:text-text-primary">
                      {partner.icon}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
