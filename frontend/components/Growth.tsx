import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PaperAirplaneIcon } from './icons/Icons';
import type { GrowthContent } from './cms/sectionTypes';

const Growth: React.FC<{ content?: GrowthContent }> = ({ content: c }) => {
  const badge = c?.badge ?? 'Get Seen Globally';
  const title = c?.title ?? "Expand Your Reach Across the Globe 🌎";
  const subtitle = c?.subtitle ?? "Whether you're targeting a local community or a global audience, our platform provides the traction you need to get noticed by the right people, anywhere in the world.";
  const ctaText = c?.ctaText ?? 'Explore Services';
  const ctaHref = c?.ctaHref ?? '/services';
  return (
    <div className="py-16 sm:py-24 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative card-solid glass-interactive rounded-3xl p-8 lg:p-16 overflow-hidden border border-border-subtle shadow-xl">

            <Image src="https://picsum.photos/seed/face1/48/48" alt="Happy customer SovaRiver" width={48} height={48} className="absolute top-12 left-8 w-12 h-12 rounded-full shadow-lg border-2 border-surface-card object-cover" />
            <Image src="https://picsum.photos/seed/face2/48/48" alt="Happy customer Sidanbrook" width={48} height={48} className="absolute top-20 right-8 w-12 h-12 rounded-full shadow-lg border-2 border-surface-card object-cover" />
            <Image src="https://picsum.photos/seed/face3/48/48" alt="Happy customer" width={40} height={40} className="absolute bottom-16 left-24 w-10 h-10 rounded-full shadow-lg border-2 border-surface-card object-cover" />
            <Image src="https://picsum.photos/seed/face4/48/48" alt="Happy customer" width={56} height={56} className="absolute bottom-24 right-16 w-14 h-14 rounded-full shadow-lg border-2 border-surface-card object-cover" />

            <div className="text-center relative">
                <div className="inline-flex items-center bg-brand-soft rounded-full p-2 text-sm font-semibold shadow">
                    <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="mx-3 text-text-primary">{badge}</span>
                </div>

                <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary pb-2">
                    {title}
                </h2>
                <p className="mt-4 text-text-secondary max-w-xl mx-auto">
                    {subtitle}
                </p>
                <Link
                    href={ctaHref}
                    className="mt-8 group inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-text-inverted bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                    {ctaText} <PaperAirplaneIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Growth;