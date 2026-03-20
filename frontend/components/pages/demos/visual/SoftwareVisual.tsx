import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';

const SOFTWARE_SUB_ITEMS = [
  'Custom web applications',
  'Business management systems',
  'Inventory & POS systems',
  'School management systems',
  'NGO management & data/reporting systems',
  'Booking & service management systems',
  'System integrations & admin panels',
  'Custom admin dashboards / reporting tools',
] as const;

const SOFTWARE_IMAGES: Record<(typeof SOFTWARE_SUB_ITEMS)[number], string> = {
  'Custom web applications':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  'Business management systems':
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600&auto=format&fit=crop',
  'Inventory & POS systems':
    'https://images.unsplash.com/photo-1523287562758-66c7fc58967a?q=80&w=600&auto=format&fit=crop',
  'School management systems':
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=600&auto=format&fit=crop',
  'NGO management & data/reporting systems':
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop',
  'Booking & service management systems':
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  'System integrations & admin panels':
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=600&auto=format&fit=crop',
  'Custom admin dashboards / reporting tools':
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
};

const SoftwareVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {SOFTWARE_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            href={`/demos/${slug}`}
            className="group surface rounded-xl p-3 border border-border-subtle text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-video rounded-lg mb-2 flex-shrink-0 overflow-hidden bg-surface-muted">
              <img
                src={SOFTWARE_IMAGES[label]}
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

export default SoftwareVisual;
