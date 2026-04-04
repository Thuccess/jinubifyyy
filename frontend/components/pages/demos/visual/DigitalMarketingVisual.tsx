import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';
import SmartImage from '../../../ui/SmartImage';

const DIGITAL_MARKETING_SUB_ITEMS = [
  'Facebook Ads',
  'Google Ads',
  'Lead generation campaigns',
  'Marketing strategy planning',
  'Conversion optimization',
  'Analytics & reporting',
  'Search Engine Optimization (SEO)',
  'Local SEO',
  'Google Business Profile setup',
] as const;

const DIGITAL_MARKETING_IMAGES: Record<(typeof DIGITAL_MARKETING_SUB_ITEMS)[number], string> = {
  'Facebook Ads':
    'https://images.unsplash.com/photo-1555421689-76cb6a5acf86?q=80&w=600&auto=format&fit=crop',
  'Google Ads':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  'Lead generation campaigns':
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=600&auto=format&fit=crop',
  'Marketing strategy planning':
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop',
  'Conversion optimization':
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop',
  'Analytics & reporting':
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
  'Search Engine Optimization (SEO)':
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600&auto=format&fit=crop',
  'Local SEO':
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=600&auto=format&fit=crop',
  'Google Business Profile setup':
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};

const DigitalMarketingVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {DIGITAL_MARKETING_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            href={`/demos/${slug}`}
            className="group surface rounded-xl p-3 border border-border-card text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-video rounded-lg mb-2 flex-shrink-0 overflow-hidden bg-surface-muted">
              <SmartImage
                src={DIGITAL_MARKETING_IMAGES[label]}
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

export default DigitalMarketingVisual;
