import React from 'react';
import { ShieldCheckIcon, ChatBubbleLeftRightIcon } from './icons/Icons';
import type { ServicesContent } from './cms/sectionTypes';

const DEFAULT_ITEMS = [
  { icon: <ShieldCheckIcon className="h-6 w-6 text-text-primary" />, title: "High Quality Services", description: "We provide top-tier, non-drop services with lifetime refills to ensure your social proof is stable and long-lasting." },
  { icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-text-primary" />, title: "24/7 Dedicated Support", description: "Our expert team is always available. With live chat and an integrated ticket system, we're here to help you succeed." },
];

const Services: React.FC<{ content?: ServicesContent }> = ({ content: c }) => {
  const items = (c?.items && c.items.length > 0)
    ? c.items.map((item, i) => ({ icon: DEFAULT_ITEMS[i]?.icon ?? DEFAULT_ITEMS[0].icon, title: item.title, description: item.description }))
    : DEFAULT_ITEMS;
  const title = c?.title ?? "Everything You Need to Succeed";
  const subtitle = c?.subtitle ?? "We've built our platform with a focus on quality, reliability, and unparalleled customer support.";
  return (
    <div className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-base text-text-secondary">
          {subtitle}
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex gap-5 p-6 sm:p-8 rounded-lg border border-border-subtle bg-[color:var(--surface-card)]"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
                {item.icon}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;