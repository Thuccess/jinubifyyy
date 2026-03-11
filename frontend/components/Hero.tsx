'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckIcon, StarIcon, WandIcon, PaperAirplaneIcon } from './icons/Icons';
import Icon from './ui/Icon';
import type { HeroContent } from './cms/sectionTypes';

const chartData = [
  { name: 'Jun', value: 320 },
  { name: 'Jul', value: 540 },
  { name: 'Aug', value: 860 },
  { name: 'Sep', value: 1130 },
  { name: 'Oct', value: 1475 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-surface-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border-subtle">
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-secondary">
            {`New followers: ${new Intl.NumberFormat().format(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
};

const FollowerChart = () => (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              {/* Use accent color with fading opacity via CSS variable */}
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide={true} domain={['dataMin - 100000', 'dataMax + 100000']} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'var(--accent-primary)',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />
          <Area 
            type="monotone"
            dataKey="value"
            stroke="var(--accent-primary)"
            fill="url(#colorUv)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              fill: 'var(--accent-primary)',
              stroke: 'var(--surface-card)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
);


const DEFAULT_HERO: HeroContent = {
  badge: 'Major Update!',
  badgeSub: 'Jinubify v1.0 is now online !',
  heading: "Unlock Explosive Growth with Authentic Social Engagement",
  subheading: "The ultimate toolkit for artists, influencers, and brands to build real communities and dominate social media.",
  ctaText: "Get Started for Free",
  ctaHref: "/contact",
  ratingText: "4.8 / 5",
  ratingSub: "Rating over 500 Reviews",
  bullets: ["Starting at Just $0.001/K", "Non-drop services", "Lifetime Refills", "24/7 Support"],
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
    <div ref={heroRef} className="relative pt-2 pb-16 sm:pt-24 sm:pb-32 lg:pb-40">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_60%)] rounded-full blur-3xl opacity-60 animate-aurora" style={{ animationDirection: 'alternate', animationDuration: '20s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-[radial-gradient(circle_at_bottom_right,var(--accent-soft),transparent_65%)] rounded-full blur-3xl opacity-50 animate-aurora" style={{ animationDirection: 'alternate-reverse', animationDuration: '25s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}></div>
      </div>
      
       {/* Central Wireframe Sphere */}
       <div 
        className="absolute top-[60%] left-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] lg:w-[900px] lg:h-[900px] -translate-x-1/2 -translate-y-1/2 -z-10 transition-transform duration-500 ease-out"
        style={{ transform: 'translate(calc(-50% + var(--x, 0px) * -0.2), calc(-50% + var(--y, 0px) * -0.2))' }}
        >
        <div className="w-full h-full rounded-full border-[1px] border-[color:var(--accent-soft)]/40 animate-spin-slow" style={{ animationDuration: '15s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-[color:var(--accent-soft)]/30 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-[color:var(--accent-soft)]/20 animate-spin-slow" style={{ animationDuration: '25s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Floating cards */}
        <div 
            className="absolute top-0 -left-16 lg:-left-28 hidden lg:block animate-float transition-transform duration-500 ease-out"
            style={{ transform: 'translate(var(--x, 0px), var(--y, 0px))' }}
        >
            <div className="bg-surface-card/80 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-border-subtle ring-1 ring-[color:var(--border-subtle)]/50">
                <div className="flex items-center space-x-2">
                    <Image src="https://picsum.photos/seed/person1/32/32" alt="Client avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                    <p className="text-xs text-text-secondary">New followers this week</p>
                    <span className="text-xs" aria-hidden="true">🎉</span>
                </div>
            </div>
            <div className="mt-4 bg-surface-card/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-border-subtle w-64 ring-1 ring-[color:var(--border-subtle)]/50">
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
                <FollowerChart />
            </div>
        </div>

        <div 
            className="absolute top-12 -right-16 lg:-right-24 hidden lg:block animate-float transition-transform duration-500 ease-out" 
            style={{ animationDelay: '200ms', animationDuration: '7s', transform: 'translate(calc(var(--x, 0px) * -1), calc(var(--y, 0px) * -1))' }}
        >
            <div className="bg-surface-card/60 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border-subtle w-64">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Campaign #1245</p>
                        <div className="flex items-center space-x-2 mt-2">
                             <Image src="https://picsum.photos/seed/person2/32/32" alt="Client avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
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
             <div className="mt-4 bg-surface-card/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-border-subtle w-64 ring-1 ring-[color:var(--border-subtle)]/50">
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
              <div className="bg-surface-card/80 backdrop-blur-sm border border-border-subtle rounded-full px-3 py-1 text-sm inline-flex items-center space-x-2">
                <span className="bg-brand-soft text-brand-primary font-semibold rounded-full px-2 py-0.5 text-xs">{c.badge}</span>
                <span className="text-text-secondary">{c.badgeSub}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-6">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-32 bg-[radial-gradient(circle_at_top,var(--accent-soft)_0,transparent_60%)] opacity-70 blur-3xl"></div>
            <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--text-primary)] to-[color:var(--text-secondary)] pb-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {(c.heading || DEFAULT_HERO.heading)?.split(' with ')[0]}
              {' with '}
              <span className="inline-flex align-middle">
                <Icon icon={WandIcon} size="lg" tone="brand" />
              </span>{' '}
              {(c.heading || DEFAULT_HERO.heading)?.split(' with ')[1] || 'Authentic Social Engagement'}
            </h1>
          </div>
          <p className="mt-4 sm:mt-6 text-lg text-text-secondary animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {c.subheading}
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link
              href={c.ctaHref || '/contact'}
              className="relative overflow-hidden btn-shine btn-primary mt-6 sm:mt-8 group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ring-2 ring-[color:var(--accent-soft)] focus-visible:ring-offset-2"
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
          </div>

          <div className="mt-6 sm:mt-8 flex items-center justify-center space-x-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex -space-x-2">
                <Image src="https://picsum.photos/seed/avatar1/32/32" alt="Satisfied user 1" width={32} height={32} className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[color:var(--bg-primary)]" />
                <Image src="https://picsum.photos/seed/avatar2/32/32" alt="Satisfied user 2" width={32} height={32} className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[color:var(--bg-primary)]" />
                <Image src="https://picsum.photos/seed/avatar3/32/32" alt="Satisfied user 3" width={32} height={32} className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[color:var(--bg-primary)]" />
            </div>
            <div className="flex items-center text-sm">
                <Icon icon={StarIcon} size="sm" tone="muted" />
                <span className="ml-1 font-semibold text-text-primary">{c.ratingText}</span>
                <span className="ml-1 text-text-muted">{c.ratingSub}</span>
            </div>
          </div>

            {c.bullets && c.bullets.length > 0 && (
            <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium text-text-secondary animate-fade-in-up" style={{ animationDelay: '600ms' }}>
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