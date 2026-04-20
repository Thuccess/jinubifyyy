'use client';

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
import { useCms } from '../../contexts/CmsContext';
import { CmsPageSectionRenderer } from '../cms/CmsPageSectionRenderer';

const FALLBACK_SECTIONS = (
  <>
    <PageSection id="home">
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
  const hasSections = Array.isArray(homePage?.sections) && homePage.sections.length > 0;

  if (!hasSections) {
    return <>{FALLBACK_SECTIONS}</>;
  }

  return <CmsPageSectionRenderer slug="home" fallback={FALLBACK_SECTIONS} />;
};

export default HomePage;