import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';

const PRINTING_SUB_ITEMS = [
  'Business cards',
  'Flyers',
  'Posters',
  'Banners (indoor & outdoor)',
  'Brochures',
  'Stickers & labels',
  'Branded merchandise (T-shirts, mugs, caps)',
  'Event & promotional materials',
] as const;

const PRINTING_IMAGES: Record<(typeof PRINTING_SUB_ITEMS)[number], string> = {
  'Business cards':
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=600&auto=format&fit=crop',
  Flyers:
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop',
  Posters:
    'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop',
  'Banners (indoor & outdoor)':
    'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=600&auto=format&fit=crop',
  Brochures:
    'https://images.unsplash.com/photo-1519923834699-ef0b7cde4712?q=80&w=600&auto=format&fit=crop',
  'Stickers & labels':
    'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?q=80&w=600&auto=format&fit=crop',
  'Branded merchandise (T-shirts, mugs, caps)':
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
  'Event & promotional materials':
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=600&auto=format&fit=crop',
};

const PrintingVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        See it in action – {serviceName}: all product types we offer
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {PRINTING_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            to={`/demos/${slug}/${labelToSlug(label)}`}
            className="group glass-surface rounded-xl p-3 border border-border-subtle text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-[3/4] rounded-lg mb-2 flex-shrink-0 overflow-hidden bg-surface-muted">
              <img
                src={PRINTING_IMAGES[label]}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="text-text-primary text-xs font-medium mt-auto pt-1 line-clamp-2">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PrintingVisual;
