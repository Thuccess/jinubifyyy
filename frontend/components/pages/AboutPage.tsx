 'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/NextImage';
import AnimatedSection from '../AnimatedSection';
import { SparklesIcon, HeartIcon, StarIcon, CogIcon, LightBulbIcon, HandshakeIcon } from '../icons/Icons';
import { aboutAPI } from '../../services/api';
import type { AboutPagePayload } from '../../services/api';
import { normalizeImageUrl } from '../../utils/image';
import SkeletonBlock from '../skeletons/SkeletonBlock';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  CogIcon,
  LightBulbIcon,
  HandshakeIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
};

const defaultContent: AboutPagePayload = {
  hero: {
    eyebrow: 'About',
    heading: 'Pioneering Digital Excellence',
    subtitle: 'We are a passionate team dedicated to building innovative solutions that empower businesses and individuals in an ever-evolving digital world.',
    primaryCtaText: 'Our Services',
    primaryCtaLink: '/services',
    secondaryCtaText: 'Contact Us',
    secondaryCtaLink: '/contact',
  },
  ourStory: {
    heading: 'Our Story: From a Simple Idea to a Digital Powerhouse',
    imageUrl: 'https://picsum.photos/seed/office/600/400',
    paragraph1: 'Founded in 2024, Jinubify was born from a desire to bridge the gap between technology and user experience. We believe that powerful tools should be accessible to everyone, and our mission is to create software that is not only functional but also a joy to use.',
    paragraph2: "Our team of developers, designers, and strategists works collaboratively to bring cutting-edge ideas to life, pushing the boundaries of what's possible in the digital landscape.",
  },
  stats: {
    heading: 'By The Numbers',
    subtext: 'Our track record speaks for itself.',
    items: [
      { value: 150, label: 'Projects Completed' },
      { value: 95, label: 'Happy Clients (%)' },
      { value: 10, label: 'Years of Experience' },
      { value: 8, label: 'Team Members' },
    ],
  },
  whyJinubify: {
    heading: 'Why Jinubify',
    intro: 'We blend expertise with a passion for innovation and the principles that guide our work.',
    tagline: 'Expertise, innovation, and accountability.',
    differentiators: [
      { iconKey: 'CogIcon', title: 'Proven Expertise', description: 'Our team brings years of industry experience, ensuring every project is guided by deep knowledge and strategic insight.' },
      { iconKey: 'LightBulbIcon', title: 'Technical Innovation', description: 'We are committed to leveraging cutting-edge technology and creative thinking to deliver innovative, future-proof solutions.' },
      { iconKey: 'HandshakeIcon', title: 'Client-Centric Focus', description: 'Your success is our ultimate metric. We build lasting partnerships focused on delivering measurable results and tangible value.' },
    ],
    coreValues: [
      { iconKey: 'SparklesIcon', title: 'Accountable to members', description: 'We take responsibility for our commitments and deliver on our promises to every team member and partner.' },
      { iconKey: 'HeartIcon', title: 'Customer-centricity', description: 'Our clients are our partners. We are deeply committed to understanding and achieving their goals.' },
      { iconKey: 'StarIcon', title: 'Empowering local SMEs', description: 'We help small and medium businesses grow with accessible tools and strategies that level the playing field.' },
    ],
  },
};

const useCountUp = (ref: React.RefObject<HTMLElement>, end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = 0;
          const startTime = performance.now();
          const animateCount = (timestamp: number) => {
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const currentNum = Math.floor(easedProgress * (end - start) + start);
            setCount(currentNum);
            if (progress < 1) requestAnimationFrame(animateCount);
            else setCount(end);
          };
          requestAnimationFrame(animateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [ref, end, duration]);
  return count;
};

const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useCountUp(ref, value);
  const displayLabel = label.replace(' (%)', '');
  return (
    <div className="flex flex-col items-center p-8 rounded-lg border border-border-card bg-[color:var(--surface-card)] shadow-card">
      <span ref={ref} className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
        {count}{label.includes('%') && '%'}
      </span>
      <span className="mt-2 text-sm font-medium text-text-muted">{displayLabel}</span>
    </div>
  );
};

const ValueItem: React.FC<{ iconKey: string; title: string; description: string }> = ({ iconKey, title, description }) => {
  const IconComponent = ICON_MAP[iconKey] || StarIcon;
  return (
    <li className="flex gap-4 text-left">
      <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
        <IconComponent className="h-8 w-8 text-text-primary" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </li>
  );
};

const AboutPage: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState<AboutPagePayload>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await aboutAPI.get();
        if (!cancelled && res) {
          setContent({
            hero: res.hero ?? defaultContent.hero,
            ourStory: res.ourStory ?? defaultContent.ourStory,
            stats: res.stats ?? defaultContent.stats,
            whyJinubify: res.whyJinubify ?? defaultContent.whyJinubify,
          });
        }
      } catch {
        if (!cancelled) setContent(defaultContent);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SkeletonBlock className="h-8 w-52" rounded="full" />
        <SkeletonBlock className="mt-3 h-4 w-80" rounded="full" />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonBlock className="h-72 w-full" rounded="xl" />
          <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
            <SkeletonBlock className="h-5 w-40" rounded="full" />
            <SkeletonBlock className="mt-4 h-3 w-full" rounded="full" />
            <SkeletonBlock className="mt-2 h-3 w-5/6" rounded="full" />
            <SkeletonBlock className="mt-6 h-3 w-full" rounded="full" />
            <SkeletonBlock className="mt-2 h-3 w-4/5" rounded="full" />
          </div>
        </div>
      </div>
    );
  }

  const hero = content.hero ?? defaultContent.hero!;
  const ourStory = content.ourStory ?? defaultContent.ourStory!;
  const stats = content.stats ?? defaultContent.stats!;
  const whyJinubify = content.whyJinubify ?? defaultContent.whyJinubify!;
  const valueItems = [...(whyJinubify.differentiators || []), ...(whyJinubify.coreValues || [])];

  return (
    <div className="animate-fade-in about-page" data-page="about">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            {hero.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            {hero.heading}
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push(hero.primaryCtaLink || '/services')}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              {hero.primaryCtaText || 'Our Services'}
            </button>
            <button
              onClick={() => router.push(hero.secondaryCtaLink || '/contact')}
              className="text-sm font-medium text-text-secondary hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] rounded"
            >
              {hero.secondaryCtaText || 'Contact Us'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="our-story-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-center">
                <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[360px] rounded-lg overflow-hidden border border-border-card bg-[color:var(--surface-card)] shadow-card">
                  <Image
                    src={normalizeImageUrl(ourStory.imageUrl || 'https://picsum.photos/seed/office/600/400')}
                    alt="A modern and collaborative office space"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 id="our-story-heading" className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                    {ourStory.heading}
                  </h2>
                  <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                    {ourStory.paragraph1}
                  </p>
                  <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                    {ourStory.paragraph2}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="by-the-numbers-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 id="by-the-numbers-heading" className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                {stats.heading}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
                {stats.subtext}
              </p>
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {(stats.items || []).map((stat) => (
                  <StatCard key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="why-jinubify-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <h2 id="why-jinubify-heading" className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                    {whyJinubify.heading}
                  </h2>
                  <p className="mt-5 text-base text-text-secondary leading-relaxed">
                    {whyJinubify.intro}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-brand-primary">
                    {whyJinubify.tagline}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <ul className="space-y-6" role="list">
                    {valueItems.map((item, i) => (
                      <ValueItem key={`${item.iconKey}-${i}-${item.title}`} iconKey={item.iconKey} title={item.title} description={item.description} />
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
