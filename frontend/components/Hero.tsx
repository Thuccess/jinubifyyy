'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from '@/components/NextImage';
import { AvatarMedia } from '@/components/media/AvatarMedia';
import dynamic from 'next/dynamic';
import { CheckIcon, StarIcon, WandIcon, PaperAirplaneIcon } from './icons/Icons';
import Icon from './ui/Icon';
import type { HeroContent } from './cms/sectionTypes';

const HeroChart = dynamic(() => import('./HeroChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-24 rounded-lg bg-surface-muted animate-pulse" aria-hidden="true" />
  ),
});


const DEFAULT_HERO: HeroContent = {
  badge: 'Digital solutions for growth',
  badgeSub: 'Serving businesses across East Africa.',
  heading: 'Digital Solutions for Businesses Across East Africa',
  subheading:
    'Jinubify helps startups, SMEs, and organizations build powerful brands, modern websites, mobile apps, and marketing systems that attract customers and drive growth.',
  ctaText: 'Request a Quote',
  ctaHref: '/request-quote',
  ratingText: '4.8 / 5',
  ratingSub: 'Rating over 500 Reviews',
  bullets: ['Technology & Software', 'Branding & Printing', 'Digital Marketing', 'Business Growth Support'],
};

const Hero: React.FC<{ content?: HeroContent }> = ({ content: cmsContent }) => {
    const heroRef = useRef<HTMLDivElement>(null);
    const c = cmsContent && Object.keys(cmsContent).length > 0 ? { ...DEFAULT_HERO, ...cmsContent } : DEFAULT_HERO;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPercent = (clientX / innerWidth) - 0.5;
            const yPercent = (clientY / innerHeight) - 0.5;
            
            heroRef.current.style.setProperty('--x', `${xPercent * 30}px`);
            heroRef.current.style.setProperty('--y', `${yPercent * 30}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

  return (
    <div
      ref={heroRef}
      className="relative flex pt-6 pb-6 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12 min-h-[calc(100vh-8rem)]"
    >
      {/* Background Elements (gradients + circle lines, clipped with overflow-hidden) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_60%)] rounded-full blur-0 opacity-60 animate-aurora" style={{ animationDirection: 'alternate', animationDuration: '20s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-[radial-gradient(circle_at_bottom_right,var(--accent-soft),transparent_65%)] rounded-full blur-0 opacity-50 animate-aurora" style={{ animationDirection: 'alternate-reverse', animationDuration: '25s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}></div>

        {/* Central Wireframe Sphere – overflow clipped by parent */}
        <div
          className="absolute top-[55%] left-1/2 w-[420px] h-[420px] sm:w-[640px] sm:h-[640px] lg:w-[820px] lg:h-[820px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out"
          style={{ transform: 'translate(calc(-50% + var(--x, 0px) * -0.2), calc(-50% + var(--y, 0px) * -0.2))' }}
        >
          <div className="w-full h-full rounded-full border-[1px] border-[color:var(--accent-soft)]/40 animate-spin-slow" style={{ animationDuration: '15s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-[color:var(--accent-soft)]/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-[color:var(--accent-soft)]/20 animate-spin-slow" style={{ animationDuration: '25s' }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        
        {/* Floating cards */}
        <div 
            className="absolute top-0 -left-16 lg:-left-28 hidden lg:block animate-float transition-transform duration-500 ease-out"
            style={{ transform: 'translate(var(--x, 0px), var(--y, 0px))' }}
        >
            <div className="card-solid p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                    <AvatarMedia
                      name="Client"
                      src="https://picsum.photos/seed/person1/32/32"
                      alt="Client avatar"
                      size={32}
                      showRing={false}
                    />
                    <p className="text-xs text-text-secondary">New followers this week</p>
                    <span className="text-xs" aria-hidden="true">🎉</span>
                </div>
            </div>
            <div className="mt-4 card-solid p-4 rounded-2xl w-64">
                <p className="text-xs text-text-muted">Net followers (last 90 days)</p>
                <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold text-text-primary">+1,475</p>
                    <p className="text-xs font-semibold text-brand-primary">+12%</p>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mt-2">
                    <span>Active campaigns</span>
                    <span>8 live</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-[linear-gradient(to_right,var(--accent-soft),var(--accent-primary))]" style={{width: '65%'}}></div>
                </div>
                <HeroChart />
            </div>
        </div>

        <div 
            className="absolute top-12 -right-16 lg:-right-24 hidden lg:block animate-float transition-transform duration-500 ease-out" 
            style={{ animationDelay: '200ms', animationDuration: '7s', transform: 'translate(calc(var(--x, 0px) * -1), calc(var(--y, 0px) * -1))' }}
        >
            <div className="card-solid p-4 rounded-2xl w-64">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Campaign #1245</p>
                        <div className="flex items-center space-x-2 mt-2">
                             <AvatarMedia
                               name="Premium client"
                               src="https://picsum.photos/seed/person2/32/32"
                               alt="Client avatar"
                               size={32}
                               showRing={false}
                             />
                             <div>
                                 <p className="text-xs font-semibold text-text-primary">delarestuale</p>
                                 <p className="text-xs text-text-muted">Premium client</p>
                             </div>
                        </div>
                    </div>
                     <span className="text-xs bg-brand-soft text-brand-primary font-medium px-2 py-0.5 rounded-full">In progress</span>
                </div>
                <div className="mt-3 text-xs text-text-muted">3 of 5 goals completed</div>
                <div className="w-full bg-surface-muted rounded-full h-1 mt-1">
                    <div className="h-1 rounded-full bg-[color:var(--accent-primary)]" style={{width: '60%'}}></div>
                </div>
            </div>
             <div className="mt-4 card-solid p-4 rounded-2xl w-64">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-text-primary">Local clothing brand</p>
                    <span className="text-xs" aria-hidden="true">📈</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Monthly reach</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-text-primary">120K</p>
                    <p className="text-sm font-semibold text-brand-primary">+10%</p>
                </div>
            </div>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-center">
              <div className="bg-[color:var(--surface-card)] border border-border-subtle rounded-full px-3 py-1 text-sm inline-flex items-center space-x-2">
                <span className="bg-brand-soft text-brand-primary font-semibold rounded-full px-2 py-0.5 text-xs">{c.badge}</span>
                <span className="text-text-secondary">{c.badgeSub}</span>
              </div>
            </div>
          </div>

          <div className="relative hero-gap-heading">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-32 bg-[radial-gradient(circle_at_top,var(--accent-soft)_0,transparent_60%)] opacity-70 blur-0"></div>
            <h1
              className="relative hero-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--text-primary)] to-[color:var(--text-secondary)] pb-2 animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              {c.heading || DEFAULT_HERO.heading}{' '}
              <span className="inline-flex align-middle">
                <Icon icon={WandIcon} size="lg" tone="brand" />
              </span>
            </h1>
          </div>
          <p
            className="hero-subheading text-text-secondary animate-fade-in-up hero-gap-after-heading"
            style={{ animationDelay: '300ms' }}
          >
            {c.subheading}
          </p>
          <div className="animate-fade-in-up hero-gap-after-cta" style={{ animationDelay: '400ms' }}>
            <Link
              href={c.ctaHref || '/request-quote'}
              className="relative overflow-hidden btn-shine btn-primary group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ring-2 ring-[color:var(--accent-soft)] focus-visible:ring-offset-2"
            >
              {c.ctaText}{' '}
              <span className="ml-2 inline-flex">
                <Icon
                  icon={PaperAirplaneIcon}
                  size="sm"
                  tone="inverted"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
            <Link
              href="/services"
              className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl btn-secondary"
            >
              Explore Services
            </Link>
            <Link
              href="/demos"
              className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl btn-secondary"
            >
              View Demos
            </Link>
            <p className="mt-3 text-sm text-text-secondary">
              Serving businesses across East Africa, including Uganda, Kenya, Tanzania, Rwanda, and South Sudan.
            </p>
          </div>

          <div
            className="hero-gap-after-cta flex items-center justify-center space-x-2 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex -space-x-2">
                <AvatarMedia name="User one" src="https://picsum.photos/seed/avatar1/32/32" alt="Satisfied user 1" size={32} className="inline-block ring-2 ring-[color:var(--bg-primary)]" />
                <AvatarMedia name="User two" src="https://picsum.photos/seed/avatar2/32/32" alt="Satisfied user 2" size={32} className="inline-block ring-2 ring-[color:var(--bg-primary)]" />
                <AvatarMedia name="User three" src="https://picsum.photos/seed/avatar3/32/32" alt="Satisfied user 3" size={32} className="inline-block ring-2 ring-[color:var(--bg-primary)]" />
            </div>
            <div className="flex items-center text-sm">
                <Icon icon={StarIcon} size="sm" tone="muted" />
                <span className="ml-1 font-semibold text-text-primary">{c.ratingText}</span>
                <span className="ml-1 text-text-muted">{c.ratingSub}</span>
            </div>
          </div>

          {c.bullets && c.bullets.length > 0 && (
            <div
              className="hero-gap-section grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium text-text-secondary animate-fade-in-up"
              style={{ animationDelay: '600ms' }}
            >
              {c.bullets.map((bullet, i) => (
                <div key={i} className="relative group flex items-center justify-center">
                  <Icon icon={CheckIcon} size="sm" tone="brand" className="mr-2" />
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;