import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';
import SmartImage from '../../../ui/SmartImage';

const CLOUD_HOSTING_SUB_ITEMS = [
  'Website hosting setup',
  'Domain registration support',
  'Cloud storage setup',
  'Email hosting & workspace setup (Google Workspace)',
  'Server configuration',
  'Data backup solutions',
  'Basic security setup (backups, HTTPS, basic hardening)',
] as const;

const CLOUD_HOSTING_IMAGES: Record<(typeof CLOUD_HOSTING_SUB_ITEMS)[number], string> = {
  'Website hosting setup':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  'Domain registration support':
    'https://images.unsplash.com/photo-1525373698358-041e3a460346?q=80&w=600&auto=format&fit=crop',
  'Cloud storage setup':
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop',
  'Email hosting & workspace setup (Google Workspace)':
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
  'Server configuration':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  'Data backup solutions':
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
  'Basic security setup (backups, HTTPS, basic hardening)':
    'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=600&auto=format&fit=crop',
};

const CloudHostingVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {CLOUD_HOSTING_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            href={`/demos/${slug}`}
            className="group surface rounded-xl p-3 border border-border-card text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-video rounded-lg mb-2 flex-shrink-0 overflow-hidden bg-surface-muted">
              <SmartImage
                src={CLOUD_HOSTING_IMAGES[label]}
                alt={label}
                width={600}
                height={340}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

export default CloudHostingVisual;
