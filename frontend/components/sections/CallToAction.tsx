'use client';

import React from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';

interface CallToActionProps {
  heading?: string;
  bookConsultationLabel?: string;
  requestQuoteLabel?: string;
  className?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  heading = 'Ready to grow your business?',
  bookConsultationLabel = 'Book Consultation',
  requestQuoteLabel = 'Request Quote',
  className = '',
}) => {
  return (
    <AnimatedSection>
      <section
        className={`rounded-2xl border border-border-subtle bg-[color:var(--surface-card)] p-8 sm:p-10 lg:p-12 text-center ${className}`}
        aria-labelledby="cta-heading"
      >
        <h2
          id="cta-heading"
          className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
        >
          {heading}
        </h2>
        <p className="mt-3 text-text-secondary max-w-xl mx-auto">
          Get in touch for a free consultation or a custom quote tailored to your needs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book-consultation"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-text-inverted bg-brand-primary rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            {bookConsultationLabel}
          </Link>
          <Link
            href="/request-quote"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-brand-primary bg-brand-soft rounded-xl hover:bg-brand-soft/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            {requestQuoteLabel}
          </Link>
        </div>
      </section>
    </AnimatedSection>
  );
};

export default CallToAction;
