'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import AnimatedSection from '../AnimatedSection';
import { normalizeImageUrl } from '../../utils/image';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '../icons/Icons';
import CallToAction from '../sections/CallToAction';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Our Work</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        A Showcase of Excellence
      </h1>
      <p className="mt-5 text-base text-text-secondary max-w-xl sm:text-lg">
        We take pride in our work. Explore a selection of projects that demonstrate our commitment
        to quality, innovation, and client success.
      </p>
    </div>
  </header>
);

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative block w-full text-left rounded-lg overflow-hidden border border-border-subtle bg-[color:var(--surface-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
  >
    <div className="aspect-[4/3] overflow-hidden relative">
      <Image
        src={normalizeImageUrl(project.imageUrl) || '/logo/logo-light.png'}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        loading="lazy"
        className="object-cover"
      />
    </div>
    <div className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {project.category}
      </p>
      <h3 className="mt-2 text-lg font-bold text-text-primary">{project.title}</h3>
      <p className="mt-2 text-sm text-text-secondary line-clamp-2">{project.description}</p>
    </div>
  </button>
);

const Lightbox: React.FC<{
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ isOpen, project, onClose, onNext, onPrev }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center p-4 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-1 -right-1 z-20 p-3 text-text-inverted bg-text-primary/80 rounded-full hover:opacity-90 transition-all shadow-xl hover:scale-110 ring-2 ring-[color:var(--border-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label="Close lightbox"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        <div className="relative w-full aspect-video max-h-[75vh]">
          <Image
            src={normalizeImageUrl(project.imageUrl) || '/logo/logo-light.png'}
            alt={project.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-contain rounded-xl shadow-2xl ring-2 ring-white/10"
          />
        </div>
        <div className="mt-4 max-w-3xl mx-auto rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6 text-left">
          <h3 id="lightbox-title" className="text-xl font-bold text-text-primary">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white bg-slate-800/80 rounded-full hover:bg-slate-700/90 transition-all shadow-xl hover:scale-110 ring-2 ring-white/10"
        aria-label="Previous project"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-text-inverted bg-text-primary/80 rounded-full hover:opacity-90 transition-all shadow-xl hover:scale-110 ring-2 ring-[color:var(--border-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
        aria-label="Next project"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

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

  const openLightbox = (index: number) => {
    setCurrentProjectIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const goToNextProject = () => {
    setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % filteredProjects.length);
  };

  const goToPrevProject = () => {
    setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + filteredProjects.length) % filteredProjects.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') {
        goToNextProject();
      } else if (e.key === 'ArrowLeft') {
        goToPrevProject();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, goToNextProject, goToPrevProject]);

  return (
    <div className="animate-fade-in">
      <PageHeader />

      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex justify-center flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] ${
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CallToAction />
          </div>
        </section>
      </div>

      {isLightboxOpen && filteredProjects[currentProjectIndex] && (
        <Lightbox
          isOpen={isLightboxOpen}
          project={filteredProjects[currentProjectIndex]}
          onClose={closeLightbox}
          onNext={goToNextProject}
          onPrev={goToPrevProject}
        />
      )}
    </div>
  );
};

export default PortfolioPageClient;

