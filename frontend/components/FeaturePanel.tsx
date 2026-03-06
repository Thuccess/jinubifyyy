import React from 'react';
import Link from 'next/link';
import { PaperAirplaneIcon, WandIcon, ChartBarIcon, CogIcon, ChatBubbleLeftRightIcon } from './icons/Icons';
import type { FeaturePanelContent } from './cms/sectionTypes';

const DEFAULT_FEATURES = [
    {
        icon: <WandIcon className="h-6 w-6 text-text-primary" />,
        name: 'AI-Powered Optimization',
        description: 'Our intelligent algorithms analyze trends to automatically boost your campaigns for maximum impact.'
    },
    {
        icon: <ChartBarIcon className="h-6 w-6 text-text-primary" />,
        name: 'Real-time Analytics',
        description: 'Track your growth with a comprehensive dashboard that provides actionable insights at a glance.'
    },
    {
        icon: <CogIcon className="h-6 w-6 text-text-primary" />,
        name: 'Automated Management',
        description: 'Set your campaigns and let our platform handle the day-to-day, saving you valuable time.'
    },
    {
        icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-text-primary" />,
        name: 'Dedicated 24/7 Support',
        description: 'Our expert team is always available to assist you, ensuring you\'re never left in the dark.'
    },
];

const FeaturePanel: React.FC<{ content?: FeaturePanelContent }> = ({ content: c }) => {
  const items = (c?.items && c.items.length > 0)
    ? c.items.map((item, i) => ({ ...DEFAULT_FEATURES[i] ?? DEFAULT_FEATURES[0], name: item.name, description: item.description }))
    : DEFAULT_FEATURES;
  const eyebrow = c?.eyebrow ?? 'Powerful Features';
  const title = c?.title ?? 'Automate Your Success with AI-Powered Management';
  const subtitle = c?.subtitle ?? "Our intelligent platform analyzes trends and optimizes your campaigns, so you can focus on creating, not managing.";
  const ctaText = c?.ctaText ?? 'Get Started';
  const ctaHref = c?.ctaHref ?? '/contact';
  return (
    <div className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {eyebrow}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                        {title}
                    </h2>
                    <p className="mt-5 text-base text-text-secondary leading-relaxed">
                        {subtitle}
                    </p>
                    <Link
                        href={ctaHref}
                        className="mt-8 inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    >
                        {ctaText} <PaperAirplaneIcon className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {items.map((feature) => (
                    <div
                      key={feature.name}
                      className="p-5 rounded-lg border border-border-subtle bg-[color:var(--surface-card)]"
                    >
                      <span className="flex w-10 h-10 rounded-lg bg-[color:var(--surface-muted)] items-center justify-center [color:var(--text-primary)]" aria-hidden>
                        {feature.icon}
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-text-primary">{feature.name}</h3>
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default FeaturePanel;
