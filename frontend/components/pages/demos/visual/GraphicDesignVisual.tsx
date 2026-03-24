import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';
import SmartImage from '../../../ui/SmartImage';

const GRAPHIC_DESIGN_SUB_ITEMS = [
  'Logo design',
  'Brand identity design (colors, fonts & guidelines)',
  'Brand guidelines',
  'Brand messaging support',
  'Social media graphics',
  'Flyers & posters',
  'Banners & signage',
  'Business cards',
  'Brochures & company profiles',
  'Company profiles & presentations',
  'Image editing & design',
  'Branded merchandise design',
] as const;

const GRAPHIC_DESIGN_IMAGES: Record<(typeof GRAPHIC_DESIGN_SUB_ITEMS)[number], string> = {
  'Logo design':
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=600&auto=format&fit=crop',
  'Brand identity design (colors, fonts & guidelines)':
    'https://images.unsplash.com/photo-1507099985932-87a4520ed1c0?q=80&w=600&auto=format&fit=crop',
  'Brand guidelines':
    'https://images.unsplash.com/photo-1517840933442-d2d1a05edb84?q=80&w=600&auto=format&fit=crop',
  'Brand messaging support':
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop',
  'Social media graphics':
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?q=80&w=600&auto=format&fit=crop',
  'Flyers & posters':
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600&auto=format&fit=crop',
  'Banners & signage':
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=600&auto=format&fit=crop',
  'Business cards':
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=600&auto=format&fit=crop',
  'Brochures & company profiles':
    'https://images.unsplash.com/photo-1519923834699-ef0b7cde4712?q=80&w=600&auto=format&fit=crop',
  'Company profiles & presentations':
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
  'Image editing & design':
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=600&auto=format&fit=crop',
  'Branded merchandise design':
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
};

const GraphicDesignVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {GRAPHIC_DESIGN_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            href={`/demos/${slug}/${labelToSlug(label)}`}
            className="group rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-3 text-center flex flex-col transition-colors hover:border-border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-square bg-[color:var(--surface-muted)] rounded-lg mb-2 flex-shrink-0 overflow-hidden">
              <SmartImage
                src={GRAPHIC_DESIGN_IMAGES[label]}
                alt={label}
                width={600}
                height={600}
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

export default GraphicDesignVisual;
