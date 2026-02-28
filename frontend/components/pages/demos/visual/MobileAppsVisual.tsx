import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';

const MOBILE_APP_SUB_ITEMS = [
  'Android app development',
  'iOS app development',
  'Cross-platform apps',
  'App UI/UX design',
  'App updates & maintenance',
  'App performance optimization',
] as const;

const MOBILE_APP_IMAGES: Record<(typeof MOBILE_APP_SUB_ITEMS)[number], string> = {
  'Android app development':
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
  'iOS app development':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  'Cross-platform apps':
    'https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=600&auto=format&fit=crop',
  'App UI/UX design':
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600&auto=format&fit=crop',
  'App updates & maintenance':
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop',
  'App performance optimization':
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=600&auto=format&fit=crop',
};

const MobileAppsVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {MOBILE_APP_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            to={`/demos/${slug}/${labelToSlug(label)}`}
            className="group glass-surface rounded-xl p-3 border border-border-subtle text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-[9/16] rounded-lg mb-2 flex-shrink-0 max-w-[120px] mx-auto w-full overflow-hidden bg-surface-muted">
              <img
                src={MOBILE_APP_IMAGES[label]}
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

export default MobileAppsVisual;
