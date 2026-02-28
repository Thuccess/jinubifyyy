
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../AnimatedSection';
import { SparklesIcon, HeartIcon, StarIcon, CogIcon, LightBulbIcon, HandshakeIcon } from '../icons/Icons';

// --- Data for the page ---
const differentiators = [
    {
      icon: <CogIcon className="h-8 w-8 text-text-primary" />,
      title: 'Proven Expertise',
      description: 'Our team brings years of industry experience, ensuring every project is guided by deep knowledge and strategic insight.'
    },
    {
      icon: <LightBulbIcon className="h-8 w-8 text-text-primary" />,
      title: 'Technical Innovation',
      description: 'We are committed to leveraging cutting-edge technology and creative thinking to deliver innovative, future-proof solutions.'
    },
    {
      icon: <HandshakeIcon className="h-8 w-8 text-text-primary" />,
      title: 'Client-Centric Focus',
      description: 'Your success is our ultimate metric. We build lasting partnerships focused on delivering measurable results and tangible value.'
    }
];

const coreValues = [
    {
      icon: <SparklesIcon className="h-8 w-8 text-text-primary" />,
      title: 'Accountable to members',
      description: 'We take responsibility for our commitments and deliver on our promises to every team member and partner.'
    },
    {
      icon: <HeartIcon className="h-8 w-8 text-text-primary" />,
      title: 'Customer-centricity',
      description: 'Our clients are our partners. We are deeply committed to understanding and achieving their goals.'
    },
    {
      icon: <StarIcon className="h-8 w-8 text-text-primary" />,
      title: 'Empowering local SMEs',
      description: 'We help small and medium businesses grow with accessible tools and strategies that level the playing field.'
    }
];

const stats = [
    { value: 150, label: 'Projects Completed' },
    { value: 95, label: 'Happy Clients (%)' },
    { value: 10, label: 'Years of Experience' },
    { value: 8, label: 'Team Members' }
];

const whyJinubifyItems = [...differentiators, ...coreValues];

// --- Custom Hooks ---
const useCountUp = (ref: React.RefObject<HTMLElement>, end: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const startTime = performance.now();
                    
                    const animateCount = (timestamp: number) => {
                        const elapsedTime = timestamp - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        const easedProgress = easeOutCubic(progress);

                        const currentNum = Math.floor(easedProgress * (end - start) + start);
                        setCount(currentNum);
                        
                        if (progress < 1) {
                            requestAnimationFrame(animateCount);
                        } else {
                            setCount(end);
                        }
                    };
                    requestAnimationFrame(animateCount);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, end, duration]);

    return count;
};


// --- Subcomponents ---

const AboutHero: React.FC = () => {
    const navigate = useNavigate();
    return (
        <header className="py-16 sm:py-20 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
                    About
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                    Pioneering Digital Excellence
                </h1>
                <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
                    We are a passionate team dedicated to building innovative solutions that empower businesses and individuals in an ever-evolving digital world.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => navigate('/services')}
                        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    >
                        Our Services
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="text-sm font-medium text-text-secondary hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] rounded"
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </header>
    );
};

const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const count = useCountUp(ref, value);
    const displayLabel = label.replace(' (%)', '');
    return (
        <div className="flex flex-col items-center p-8 rounded-lg border border-border-subtle bg-[color:var(--surface-card)]">
            <span ref={ref} className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                {count}{label.includes('%') && '%'}
            </span>
            <span className="mt-2 text-sm font-medium text-text-muted">{displayLabel}</span>
        </div>
    );
};

const ValueItem: React.FC<typeof coreValues[0]> = ({ icon, title, description }) => (
    <li className="flex gap-4 text-left">
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
            {icon}
        </span>
        <div>
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
    </li>
);

// --- Main About Page Component ---

const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in about-page" data-page="about">
      <AboutHero />

      <main>
        {/* Our Story – image left, text right */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="our-story-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-center">
                        <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[360px] rounded-lg overflow-hidden border border-border-subtle bg-[color:var(--surface-card)]">
                            <img loading="lazy" className="w-full h-full object-cover" src="https://picsum.photos/seed/office/600/400" alt="A modern and collaborative office space" />
                        </div>
                        <div>
                            <h2 id="our-story-heading" className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                                Our Story: From a Simple Idea to a Digital Powerhouse
                            </h2>
                            <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                                Founded in 2024, Jinubify was born from a desire to bridge the gap between technology and user experience. We believe that powerful tools should be accessible to everyone, and our mission is to create software that is not only functional but also a joy to use.
                            </p>
                            <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                                Our team of developers, designers, and strategists works collaboratively to bring cutting-edge ideas to life, pushing the boundaries of what&apos;s possible in the digital landscape.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>

        {/* By The Numbers */}
        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="by-the-numbers-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <h2 id="by-the-numbers-heading" className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                        By The Numbers
                    </h2>
                    <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
                        Our track record speaks for itself.
                    </p>
                    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} value={stat.value} label={stat.label} />
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>

        {/* Why Jinubify – two columns: intro left, list with icons right */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="why-jinubify-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        <div className="lg:col-span-5">
                            <h2 id="why-jinubify-heading" className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                                Why Jinubify
                            </h2>
                            <p className="mt-5 text-base text-text-secondary leading-relaxed">
                                We blend expertise with a passion for innovation and the principles that guide our work.
                            </p>
                            <p className="mt-4 text-sm font-semibold text-brand-primary">
                                Expertise, innovation, and accountability.
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <ul className="space-y-6" role="list">
                                {whyJinubifyItems.map((item) => (
                                    <ValueItem key={item.title} {...item} />
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
