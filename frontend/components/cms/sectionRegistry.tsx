import React from 'react';
import Hero from '../Hero';
import Partners from '../Partners';
import HowItWorks from '../HowItWorks';
import Services from '../Services';
import FeaturePanel from '../FeaturePanel';
import Growth from '../Growth';
import Testimonials from '../Testimonials';
import FAQ from '../FAQ';
import type { SectionContent, CmsSection } from './sectionTypes';

export const SECTION_IDS: Record<string, string> = {
  hero: 'home',
  partners: 'partners',
  howItWorks: 'how-it-works',
  services: 'services',
  features: 'features',
  growth: 'growth',
  testimonials: 'testimonials',
  faq: 'faq',
};

const SECTION_REGISTRY: Record<string, React.FC<{ content?: SectionContent }>> = {
  hero: Hero as React.FC<{ content?: SectionContent }>,
  partners: Partners as React.FC<{ content?: SectionContent }>,
  howItWorks: HowItWorks as React.FC<{ content?: SectionContent }>,
  services: Services as React.FC<{ content?: SectionContent }>,
  features: FeaturePanel as React.FC<{ content?: SectionContent }>,
  growth: Growth as React.FC<{ content?: SectionContent }>,
  testimonials: Testimonials as React.FC<{ content?: SectionContent }>,
  faq: FAQ as React.FC<{ content?: SectionContent }>,
};

export function getSectionComponent(sectionKey: string): React.FC<{ content?: SectionContent }> | null {
  return SECTION_REGISTRY[sectionKey] ?? null;
}

interface DynamicSectionRendererProps {
  section: CmsSection;
  className?: string;
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({ section, className }) => {
  const Component = getSectionComponent(section.sectionKey);
  if (!Component) return null;
  return (
    <div className={className} data-section-key={section.sectionKey}>
      <Component content={section.content} />
    </div>
  );
};

export default SECTION_REGISTRY;
