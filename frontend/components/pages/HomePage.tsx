import React from 'react';
import Hero from '../Hero';
import Partners from '../Partners';
import HowItWorks from '../HowItWorks';
import FeaturePanel from '../FeaturePanel';
import Growth from '../Growth';
import Services from '../Services';
import Testimonials from '../Testimonials';
import FAQ from '../FAQ';
import PageSection from '../layout/PageSection';
import { DynamicSectionRenderer, SECTION_IDS } from '../cms/sectionRegistry';
import { useCms } from '../../contexts/CmsContext';
import type { CmsSection } from '../cms/sectionTypes';

const FALLBACK_SECTIONS = (
  <>
    <PageSection id="home" className="pt-8 lg:pt-12">
      <Hero />
    </PageSection>
    <PageSection id="partners">
      <Partners />
    </PageSection>
    <PageSection id="how-it-works">
      <HowItWorks />
    </PageSection>
    <PageSection id="services">
      <Services />
    </PageSection>
    <PageSection id="features">
      <FeaturePanel />
    </PageSection>
    <PageSection id="growth">
      <Growth />
    </PageSection>
    <PageSection id="testimonials">
      <Testimonials />
    </PageSection>
    <PageSection id="faq" className="pb-20">
      <FAQ />
    </PageSection>
  </>
);

const HomePage: React.FC = () => {
  const { site } = useCms();
  const homePage = site?.pages?.find((p) => p.slug === 'home');
  const sections = (homePage?.sections ?? []) as CmsSection[];
  const sortedSections = sections.length > 0 ? [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

  if (sortedSections.length === 0) {
    return <>{FALLBACK_SECTIONS}</>;
  }

  return (
    <>
      {sortedSections.map((section) => {
        const id = SECTION_IDS[section.sectionKey] ?? section.sectionKey;
        const className = section.sectionKey === 'hero' ? 'pt-8 lg:pt-12' : section.sectionKey === 'faq' ? 'pb-20' : undefined;
        return (
          <PageSection key={section._id} id={id} className={className}>
            <DynamicSectionRenderer section={section} />
          </PageSection>
        );
      })}
    </>
  );
};

export default HomePage;