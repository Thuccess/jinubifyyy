import React from 'react';
import { HowItWorksIcon1, HowItWorksIcon2, HowItWorksIcon3 } from './icons/Icons';
import type { HowItWorksContent } from './cms/sectionTypes';

const DEFAULT_STEPS = [
  { icon: <HowItWorksIcon1 />, title: 'Signup for free!', description: 'Get a 100% free account' },
  { icon: <HowItWorksIcon2 />, title: 'Find Your Service', description: 'Browse our extensive list' },
  { icon: <HowItWorksIcon3 />, title: 'Select & Order!', description: 'See results instantly' },
];

const HowItWorks: React.FC<{ content?: HowItWorksContent }> = ({ content: c }) => {
  const steps = (c?.steps && c.steps.length > 0)
    ? c.steps.map((s, i) => ({ ...DEFAULT_STEPS[i] || { icon: <HowItWorksIcon1 />, title: '', description: '' }, title: s.title, description: s.description }))
    : DEFAULT_STEPS;
  const eyebrow = c?.eyebrow ?? 'How it works';
  const title = c?.title ?? 'Launch Your Social Growth in 3 Steps';
  const subtitle = c?.subtitle ?? 'Go from zero to hero with our streamlined, powerful SMM platform.';

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-base text-text-secondary">
          {subtitle}
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 card-solid"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
                {step.icon}
              </span>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;