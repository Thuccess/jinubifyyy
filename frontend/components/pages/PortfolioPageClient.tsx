'use client';

import React, { useState, useMemo } from 'react';
import AnimatedSection from '../AnimatedSection';
import { normalizeImageUrl } from '../../utils/image';
import CallToAction from '../sections/CallToAction';
import Lightbox from '@/components/media/Lightbox';
import SmartImage from '@/components/media/SmartImage';

type Project = {
  _id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  category?: string;
};

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Our Work</p>
      <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
        A Showcase of Excellence
      </h1>
      <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
        We take pride in our work. Explore a selection of projects that demonstrate our commitment to
        quality, innovation, and client success.
      </p>
    </div>
  </header>
);

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative block w-full overflow-hidden rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
  >
    <SmartImage
      src={normalizeImageUrl(project.imageUrl || '') || project.imageUrl || ''}
      alt={project.title}
      aspect="4/3"
      rounded="none"
      sizesPreset="gridFour"
      className="rounded-t-lg"
    />
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{project.category}</p>
      <h3 className="mt-2 text-lg font-bold text-text-primary">{project.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{project.description}</p>
    </div>
  </button>
);

interface PortfolioPageClientProps {
  initialProjects: Project[];
}

const PortfolioPageClient: React.FC<PortfolioPageClientProps> = ({ initialProjects }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [projects] = useState<Project[]>(initialProjects);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((item) => {
      (item.tags || []).forEach((tag) => set.add(tag));
    });
    const list = Array.from(set).sort();
    return ['All', ...list];
  }, [projects]);

  const filteredProjects: Project[] = useMemo(() => {
    if (activeCategory === 'All') {
      return projects;
    }
    return projects.filter((item) => (item.tags || []).includes(activeCategory));
  }, [projects, activeCategory]);

  const lightboxItems = useMemo(
    () =>
      filteredProjects.map((p) => ({
        src: normalizeImageUrl(p.imageUrl || '') || p.imageUrl || '',
        alt: p.title,
        title: p.title,
        description: p.description,
      })),
    [filteredProjects],
  );

  const openLightbox = (index: number) => {
    setCurrentProjectIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader />

      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] ${
                  activeCategory === category
                    ? 'bg-brand-primary text-text-inverted'
                    : 'border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-surface-muted/90'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <p className="text-sm">No content available yet.</p>
            </div>
          ) : (
            <AnimatedSection>
              <div
                key={activeCategory}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id || project.title}
                    project={project}
                    onClick={() => openLightbox(index)}
                  />
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>

        <section className="py-16 sm:py-20 lg:py-24" aria-label="Call to action">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <CallToAction />
          </div>
        </section>
      </div>

      <Lightbox
        open={isLightboxOpen && lightboxItems.length > 0}
        onClose={closeLightbox}
        items={lightboxItems}
        index={currentProjectIndex}
        onIndexChange={setCurrentProjectIndex}
      />
    </div>
  );
};

export default PortfolioPageClient;
