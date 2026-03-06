 'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import { useCms } from '../../contexts/CmsContext';

interface CmsBasicPageProps {
  slug?: string;
  dynamicFromParam?: boolean;
  eyebrow?: string;
  defaultTitle?: string;
  defaultIntro?: string;
}

export const CmsBasicPage: React.FC<CmsBasicPageProps> = ({
  slug,
  dynamicFromParam = false,
  eyebrow,
  defaultTitle,
  defaultIntro,
}) => {
  const { site, isLoading, error } = useCms();
  const params = useParams();
  const paramSlug = params?.slug as string | undefined;
  const pathname = usePathname();

  const effectiveSlug = useMemo(() => {
    if (dynamicFromParam && paramSlug) return paramSlug.toLowerCase();
    if (slug) return slug.toLowerCase();
    const path = (pathname || '').replace(/^\/+/, '').split('/')[0] || '';
    return path.toLowerCase();
  }, [slug, dynamicFromParam, paramSlug, pathname]);

  const page = site?.pages?.find((p) => p.slug.toLowerCase() === effectiveSlug);
  const title = page?.title || defaultTitle || '';
  const intro = page?.metaDescription || defaultIntro || '';
  const sections = page?.sections ?? [];

  const fallbackSections =
    sections.length === 0
      ? (() => {
          switch (effectiveSlug) {
            case 'guides':
              return [
                {
                  _id: 'guides-overview',
                  sectionKey: 'guides_overview',
                  content: {
                    heading: 'Strategic guides for every growth stage',
                    body:
                      'Explore practical, no-nonsense guides that walk you through how to plan, launch, and scale your digital initiatives with confidence. Each guide is written to be immediately actionable, using real-world patterns we apply with our own clients.',
                  },
                },
                {
                  _id: 'guides-getting-started',
                  sectionKey: 'guides_getting_started',
                  content: {
                    heading: 'Getting started with Jinubify',
                    body:
                      'Not sure where to begin? Start with our foundational guides on discovery, roadmapping, and prioritisation. Learn how we approach product thinking, what to validate before you invest, and how to align stakeholders around a clear delivery plan.',
                  },
                },
                {
                  _id: 'guides-deep-dives',
                  sectionKey: 'guides_deep_dives',
                  content: {
                    heading: 'Deep dives into key capabilities',
                    body:
                      'Go beyond the surface with guides on topics like modern web architectures, data-informed decision making, experimentation, and post-launch optimisation. These pieces are designed for founders, product leaders, and technical decision-makers who want to understand the trade-offs behind each option.',
                  },
                },
              ];
            case 'resources':
              return [
                {
                  _id: 'resources-library',
                  sectionKey: 'resources_library',
                  content: {
                    heading: 'A curated library of tools and templates',
                    body:
                      'Access checklists, worksheets, and reference materials that help you move from idea to execution faster. Use these resources with your team to clarify requirements, map dependencies, and avoid the common pitfalls that slow down delivery.',
                  },
                },
                {
                  _id: 'resources-for-teams',
                  sectionKey: 'resources_for_teams',
                  content: {
                    heading: 'Resources for product, design, and engineering teams',
                    body:
                      'We provide practical artefacts you can drop straight into your workflows: discovery question sets, handover templates, experimentation logs, and more. They are intentionally lightweight, so your team can adapt them to your own context without friction.',
                  },
                },
                {
                  _id: 'resources-how-to-use',
                  sectionKey: 'resources_how_to_use',
                  content: {
                    heading: 'How to use this resource hub',
                    body:
                      'Browse by topic, share links with your colleagues, and incorporate the most relevant pieces into your own documentation. If you work with Jinubify as a partner, we will reference specific resources here as part of our engagement together.',
                  },
                },
              ];
            case 'tools':
              return [
                {
                  _id: 'tools-overview',
                  sectionKey: 'tools_overview',
                  content: {
                    heading: 'Practical tools to support better decisions',
                    body:
                      'This section highlights simple evaluators, calculators, and decision frameworks that make complex topics easier to navigate. The goal is not to replace your judgement, but to give you a clearer view of trade-offs before you commit.',
                  },
                },
                {
                  _id: 'tools-product',
                  sectionKey: 'tools_product',
                  content: {
                    heading: 'Product and roadmap tools',
                    body:
                      'Use our lightweight scoring models and prioritisation grids to align stakeholders on what to ship next. These tools are designed to be workshop-friendly and understandable by both technical and non-technical team members.',
                  },
                },
                {
                  _id: 'tools-technical',
                  sectionKey: 'tools_technical',
                  content: {
                    heading: 'Technical assessment tools',
                    body:
                      'Leverage structured questionnaires and checklists to assess architecture health, scalability, observability, and delivery readiness. They help you identify where to invest first and how to phase improvements over time.',
                  },
                },
              ];
            case 'events':
              return [
                {
                  _id: 'events-overview',
                  sectionKey: 'events_overview',
                  content: {
                    heading: 'Live sessions, workshops, and conversations',
                    body:
                      'Join Jinubify at upcoming events where we share practical insights, walk through real case studies, and answer your questions live. Whether online or in person, our focus is always on clarity, pragmatism, and real value for your team.',
                  },
                },
                {
                  _id: 'events-types',
                  sectionKey: 'events_types',
                  content: {
                    heading: 'What kind of events we run',
                    body:
                      'From focused AMAs and office hours to deep-dive workshops, we design each event to be interactive and implementation-focused. Expect honest discussions about what works, what does not, and how to adapt patterns to your own organisation.',
                  },
                },
                {
                  _id: 'events-stay-informed',
                  sectionKey: 'events_stay_informed',
                  content: {
                    heading: 'Stay informed about new events',
                    body:
                      'We keep this page up to date as new dates are confirmed. You can also subscribe to our newsletter or follow our social channels to be notified when we announce new sessions that are relevant to your role and industry.',
                  },
                },
              ];
            default:
              return [];
          }
        })()
      : [];

  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    document.title = `${title} – Jinubify`;
    if (metaDescription) {
      metaDescription.content = intro || defaultIntro || '';
    } else if (intro || defaultIntro) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = intro || defaultIntro || '';
      document.head.appendChild(meta);
    }

    const canonicalUrl = `${window.location.origin}${pathname}`;
    if (linkCanonical) {
      linkCanonical.href = canonicalUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }

    return () => {
      document.title = previousTitle || 'Jinubify';
    };
  }, [title, intro, defaultIntro, pathname]);

  return (
    <div className="animate-fade-in">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
              {intro}
            </p>
          )}
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="py-12 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto mb-4" />
              Loading content...
            </div>
          )}
          {!isLoading && error && (
            <div className="py-12 text-center text-text-secondary">
              <p className="text-sm">
                We couldn&apos;t load this page&apos;s content right now. Please try again later.
              </p>
            </div>
          )}
          {!isLoading && !error && sections.length > 0 && (
            <div className="space-y-8">
              {sections.map((section) => {
                const content = section.content || {};
                const heading =
                  (content.heading as string) ||
                  (content.title as string) ||
                  (section.sectionKey as string);
                const body =
                  (content.body as string) ||
                  (content.text as string) ||
                  (content.description as string) ||
                  '';

                return (
                  <AnimatedSection key={section._id}>
                    <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                      {heading && (
                        <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                          {heading}
                        </h2>
                      )}
                      {body && (
                        <p className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                          {body}
                        </p>
                      )}
                    </section>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
          {!isLoading && !error && sections.length === 0 && fallbackSections.length > 0 && (
            <div className="space-y-8">
              {fallbackSections.map((section) => {
                const content = section.content as { heading?: string; title?: string; body?: string; text?: string; description?: string };
                const heading =
                  (content.heading || '') ||
                  (content.title || '') ||
                  (section.sectionKey || '');
                const body =
                  (content.body || '') ||
                  (content.text || '') ||
                  (content.description || '') ||
                  '';

                return (
                  <AnimatedSection key={section._id}>
                    <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                      {heading && (
                        <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                          {heading}
                        </h2>
                      )}
                      {body && (
                        <p className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                          {body}
                        </p>
                      )}
                    </section>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CmsBasicPage;

