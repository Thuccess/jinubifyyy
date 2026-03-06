import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';

const WEBSITE_SUB_ITEMS = [
  'Business websites',
  'Corporate websites',
  'NGO & organization websites',
  'Landing pages for promotions',
  'Simple e-commerce websites',
  'Mobile-friendly / responsive design',
  'Website maintenance & updates',
  'Website optimization (performance & SEO)',
  'Contact forms & integrations (WhatsApp, email)',
] as const;

const WEBSITE_IMAGES: Record<(typeof WEBSITE_SUB_ITEMS)[number], string> = {
  'Business websites':
    'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?q=80&w=600&auto=format&fit=crop',
  'Corporate websites':
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
  'NGO & organization websites':
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop',
  'Landing pages for promotions':
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop',
  'Simple e-commerce websites':
    'https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=600&auto=format&fit=crop',
  'Mobile-friendly / responsive design':
    'https://images.unsplash.com/photo-1555421689-76cb6a5acf86?q=80&w=600&auto=format&fit=crop',
  'Website maintenance & updates':
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=600&auto=format&fit=crop',
  'Website optimization (performance & SEO)':
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
  'Contact forms & integrations (WhatsApp, email)':
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
};

const WebsitesVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {demoUrl && (
        <div className="flex justify-center">
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:brightness-110 rounded-lg"
          >
            Open Live Demo <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      )}
      <p className="text-text-secondary text-sm text-center">
        See it in action – {serviceName}: all services we offer
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {WEBSITE_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            href={`/demos/${slug}`}
            className="group glass-surface rounded-xl p-3 border border-border-subtle text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-video rounded-lg mb-2 flex-shrink-0 overflow-hidden bg-surface-muted">
              <img
                src={WEBSITE_IMAGES[label]}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="text-text-primary text-xs font-medium mt-auto pt-1 line-clamp-3">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WebsitesVisual;
