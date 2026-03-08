 'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon, QuoteIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';
import Icon from './ui/Icon';
import { testimonialsAPI, type TestimonialItem } from '../services/api';
import { normalizeImageUrl } from '../../utils/image';

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Sanblu Ajiech',
    title: 'Director, Luxorld (Kampala)',
    avatar: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=400&auto=format&fit=crop',
    text: "Their commitment to quality and proactive communication made them a standout partner. Jinubify didn't just deliver a product; they delivered a solution that exceeded our expectations and drove real business results.",
    stars: 5,
  },
  {
    name: 'Sarah Williams',
    title: 'Marketing Director, Creative Minds',
    avatar: 'https://picsum.photos/seed/testimonial2/100/100',
    text: 'Working with the Jinubify team has been a game-changer. Their strategic counseling and expertise in digital marketing led to a 200% increase in our online engagement. Highly recommended!',
    stars: 5,
  },
];

const Testimonials: React.FC<{ content?: Record<string, unknown> }> = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await testimonialsAPI.getList();
        if (!cancelled && res.testimonials?.length) {
          setTestimonials(res.testimonials);
        } else if (!cancelled) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch {
        if (!cancelled) setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const current = testimonials[currentIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (loading || testimonials.length === 0) {
    return (
      <div className="py-16 sm:py-24" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[280px]">
            <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left column: heading, copy, controls */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Social proof
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              From our <span className="underline decoration-[color:var(--accent-primary)] underline-offset-4">community</span>.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              We&apos;re proud to have partnered with amazing businesses. Here&apos;s what they say about working with Jinubify.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="inline-flex items-center rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-text-primary">
                <Icon icon={StarIcon} size="sm" tone="brand" className="mr-1.5" />
                <span>4.9 / 5 average rating</span>
              </div>
              <p className="text-xs text-text-muted">
                Based on {testimonials.length}+ client reviews
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                aria-label="Previous testimonial"
              >
                <Icon icon={ChevronLeftIcon} size="md" tone="primary" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                aria-label="Next testimonial"
              >
                <Icon icon={ChevronRightIcon} size="md" tone="primary" />
              </button>
            </div>
          </div>

          {/* Right column: active testimonial */}
          <div className="relative glass-surface glass-surface--card rounded-3xl border border-border-subtle shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft)/14,transparent_60%)] pointer-events-none" />
            <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col gap-8">
              <Icon icon={QuoteIcon} size="lg" tone="muted" />
              <p className="text-xl sm:text-2xl font-semibold leading-relaxed text-text-primary">
                {current.text}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Image
                  src={normalizeImageUrl(current.avatar || '') || '/logo/logo-light.png'}
                  alt={current.name}
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-surface-card shadow"
                />
                <div>
                  <p className="font-semibold text-text-primary">{current.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{current.title}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: current.stars }).map((_, i) => (
                      <Icon key={i} icon={StarIcon} size="sm" tone="brand" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted">
                {currentIndex + 1} of {testimonials.length} stories
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
