import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../../icons/Icons';
import type { DemoVisualProps } from './types';
import { labelToSlug } from './slugify';

const SOCIAL_MEDIA_SUB_ITEMS = [
  'Facebook page management',
  'Instagram page management',
  'WhatsApp Business setup',
  'Content planning & scheduling',
  'Post design & captions',
  'Social media posters & flyers',
  'Audience engagement',
  'Page optimization',
  'Performance analytics',
  'Social media captions & copywriting',
] as const;

const SOCIAL_MEDIA_IMAGES: Record<(typeof SOCIAL_MEDIA_SUB_ITEMS)[number], string> = {
  'Facebook page management': '/demo-images/social/social-facebook-page-management.jpg',
  'Instagram page management': '/demo-images/social/social-instagram-page-management.jpg',
  'WhatsApp Business setup': '/demo-images/social/social-whatsapp-business-setup.jpg',
  'Content planning & scheduling': '/demo-images/social/social-content-planning-scheduling.jpg',
  'Post design & captions': '/demo-images/social/social-post-design-captions.jpg',
  'Social media posters & flyers': '/demo-images/social/social-posters-flyers.jpg',
  'Audience engagement': '/demo-images/social/social-audience-engagement.jpg',
  'Page optimization': '/demo-images/social/social-page-optimization.jpg',
  'Performance analytics': '/demo-images/social/social-performance-analytics.jpg',
  'Social media captions & copywriting': '/demo-images/social/social-captions-copywriting.jpg',
};

const SocialMediaVisual: React.FC<DemoVisualProps> = ({ slug, demoUrl, serviceName }) => {
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
        {SOCIAL_MEDIA_SUB_ITEMS.map((label, i) => (
          <Link
            key={i}
            to={`/demos/${slug}/${labelToSlug(label)}`}
            className="group glass-surface rounded-xl p-3 border border-border-subtle text-center flex flex-col transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            <div className="aspect-square rounded-lg mb-2 overflow-hidden flex-shrink-0 bg-surface-muted">
              <img
                src={SOCIAL_MEDIA_IMAGES[label]}
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

export default SocialMediaVisual;
