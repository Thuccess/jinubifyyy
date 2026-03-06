import React from 'react';
import { useCms } from '../../contexts/CmsContext';
import PageSection from '../layout/PageSection';
import { DynamicSectionRenderer, SECTION_IDS } from './sectionRegistry';
import type { CmsSection } from './sectionTypes';

interface CmsPageSectionRendererProps {
  slug: string;
  fallback?: React.ReactNode;
}

export const CmsPageSectionRenderer: React.FC<CmsPageSectionRendererProps> = ({ slug, fallback }) => {
  const { site, isLoading, error } = useCms();

  if (isLoading || error) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  const page = site?.pages?.find((p) => p.slug === slug);
  const rawSections = (page?.sections ?? []) as Array<
    CmsSection & { isVisible?: boolean; status?: string; isDeleted?: boolean }
  >;

  const sections = rawSections
    .filter((s) => s && s.isVisible !== false && s.isDeleted !== true && (s.status === 'published' || !s.status))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!page || sections.length === 0) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  return (
    <>
      {sections.map((section) => {
        const id = SECTION_IDS[section.sectionKey] ?? section.sectionKey;
        return (
          <PageSection key={section._id} id={id}>
            <DynamicSectionRenderer section={section} />
          </PageSection>
        );
      })}
    </>
  );
};

export default CmsPageSectionRenderer;

