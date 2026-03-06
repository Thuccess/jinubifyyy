'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import AnimatedSection from '../AnimatedSection';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '../icons/Icons';

// --- Data for the page ---
const allProjects = [
  {
    title: 'E-commerce Platform "Vexora"',
    category: 'Web Development',
    description: 'A scalable online store with a custom CMS, designed for a seamless user experience and robust backend management.',
    imageUrl: 'https://picsum.photos/seed/project1/1200/800',
  },
  {
    title: 'Fintech Mobile App "CoinHub"',
    category: 'Mobile App',
    description: 'A secure and intuitive app for managing finances, featuring biometric login and real-time transaction alerts.',
    imageUrl: 'https://picsum.photos/seed/project2/1200/800',
  },
  {
    title: 'Startup Rebranding "Aethera"',
    category: 'Branding',
    description: 'A complete branding package for a tech startup, including logo design, color palette, and brand guidelines.',
    imageUrl: 'https://picsum.photos/seed/project3/1200/800',
  },
  {
    title: 'Global Product Launch Campaign',
    category: 'Marketing',
    description: 'A viral marketing campaign for a consumer product that resulted in a 300% increase in engagement across all platforms.',
    imageUrl: 'https://picsum.photos/seed/project4/1200/800',
  },
  {
    title: 'Enterprise Cloud Migration',
    category: 'IT Solutions',
    description: 'Seamlessly moved a legacy enterprise system for a Fortune 500 company to a modern, scalable cloud infrastructure with zero downtime.',
    imageUrl: 'https://picsum.photos/seed/project5/1200/800',
  },
  {
    title: 'Corporate Culture Showcase Video',
    category: 'Multimedia',
    description: 'An engaging promotional video for a global firm, highlighting their company culture, values, and achievements to attract top talent.',
    imageUrl: 'https://picsum.photos/seed/project6/1200/800',
  },
  {
    title: 'SaaS Platform "Analytica"',
    category: 'Web Development',
    description: 'A complex data analytics dashboard for B2B clients, providing real-time insights and customizable reports.',
    imageUrl: 'https://picsum.photos/seed/project7/1200/800',
  },
  {
    title: 'Animated Explainer Video Series',
    category: 'Multimedia',
    description: 'A series of short, animated videos simplifying complex software features, increasing user adoption by 40%.',
    imageUrl: 'https://picsum.photos/seed/project8/1200/800',
  },
  {
    title: 'Nationwide Network Security Overhaul',
    category: 'IT Solutions',
    description: 'Designed and implemented a comprehensive network security solution for a retail chain across 50+ locations.',
    imageUrl: 'https://picsum.photos/seed/project9/1200/800',
  },
];

const categories = ['All', 'Web Development', 'Multimedia', 'IT Solutions', 'Mobile App', 'Branding', 'Marketing'];


// --- Subcomponents ---

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Our Work</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                A Showcase of Excellence
            </h1>
            <p className="mt-5 text-base text-text-secondary max-w-xl sm:text-lg">
                We take pride in our work. Explore a selection of projects that demonstrate our commitment to quality, innovation, and client success.
            </p>
        </div>
    </header>
);

const ProjectCard: React.FC<{ project: typeof allProjects[0]; onClick: () => void }> = ({ project, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="group relative block w-full text-left rounded-lg overflow-hidden border border-border-subtle bg-[color:var(--surface-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
    >
        <div className="aspect-[4/3] overflow-hidden relative">
            <Image
              src={project.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              className="object-cover"
            />
        </div>
        <div className="p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{project.category}</p>
            <h3 className="mt-2 text-lg font-bold text-text-primary">{project.title}</h3>
            <p className="mt-2 text-sm text-text-secondary line-clamp-2">{project.description}</p>
        </div>
    </button>
);

const Lightbox: React.FC<{
  isOpen: boolean;
  project: typeof allProjects[0];
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
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-contain rounded-xl shadow-2xl ring-2 ring-white/10"
            />
        </div>
        <div className="mt-4 max-w-3xl mx-auto rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6 text-left">
            <h3 id="lightbox-title" className="text-xl font-bold text-text-primary">{project.title}</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">{project.description}</p>
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


// --- Main Portfolio Page Component ---

const PortfolioPage: React.FC = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') {
      return allProjects;
    }
    return allProjects.filter(project => project.category === activeCategory);
  }, [activeCategory]);


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, currentProjectIndex, filteredProjects.length]);


  return (
    <div className="animate-fade-in">
      <PageHeader />

      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex justify-center flex-wrap gap-2">
                {categories.map(category => (
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
            
            <AnimatedSection>
                <div key={activeCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, index) => (
                        <ProjectCard 
                            key={project.title} 
                            project={project}
                            onClick={() => openLightbox(index)}
                        />
                    ))}
                </div>
            </AnimatedSection>
        </div>
      </div>

      {isLightboxOpen && (
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

export default PortfolioPage;