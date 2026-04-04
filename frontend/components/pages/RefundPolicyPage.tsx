'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  ClockIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from '../icons/Icons';

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Legal Document
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        Refund Policy
      </h1>
      <p className="mt-5 text-base text-text-secondary max-w-xl">
        This Refund Policy explains when and how you may be eligible to receive a refund for
        payments made to Jinubify. Please review it carefully before purchasing or renewing any
        services.
      </p>
      <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <ClockIcon className="w-4 h-4 flex-shrink-0" aria-hidden />
        Last updated:{' '}
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  </header>
);

interface TableOfContentsProps {
  sections: Array<{ id: string; title: string; icon: React.ReactNode }>;
  activeSection: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile TOC */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-border-card bg-[color:var(--surface-card)] p-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
        >
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Table of Contents
          </h3>
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-2 rounded-lg border border-border-card bg-[color:var(--surface-card)] p-4 shadow-card">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                    activeSection === section.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5">{section.icon}</span>
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop TOC */}
      <div className="sticky top-20 sm:top-24 hidden lg:block">
        <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] p-4 lg:p-6 shadow-card">
          <h3 className="text-xs lg:text-sm font-bold text-text-primary uppercase tracking-wider mb-3 lg:mb-4">
            Table of Contents
          </h3>
          <nav className="space-y-1 lg:space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm ${
                  activeSection === section.id
                    ? 'bg-brand-soft text-brand-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary'
                }`}
              >
                <span className="flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5">{section.icon}</span>
                <span className="truncate">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

interface SectionCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ id, icon, title, children }) => (
  <section id={id} className="scroll-mt-20 sm:scroll-mt-24 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
    <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 md:p-8 shadow-card">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 pb-3 sm:pb-4 border-b border-border-subtle">
        <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6">{icon}</div>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary leading-tight">
          {title}
        </h2>
      </div>
      <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none text-text-secondary leading-relaxed">
        {children}
      </div>
    </div>
  </section>
);

const RefundPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = useMemo(
    () => [
      {
        id: 'introduction',
        title: 'Introduction',
        icon: <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'eligibility',
        title: 'Eligibility for Refunds',
        icon: <ScaleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'timeframes',
        title: 'Request Timeframes',
        icon: <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'conditions',
        title: 'Conditions for Approval',
        icon: <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'non-refundable',
        title: 'Non-Refundable Items',
        icon: <ExclamationTriangleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'process',
        title: 'How to Request a Refund',
        icon: <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'evaluation',
        title: 'Evaluation & Resolution',
        icon: <ScaleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'method',
        title: 'Refund Method & Timelines',
        icon: <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'chargebacks',
        title: 'Chargebacks & Disputes',
        icon: <ExclamationTriangleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'changes',
        title: 'Changes to This Refund Policy',
        icon: <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'contact',
        title: 'Contact Us',
        icon: <EnvelopeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
    ],
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="animate-fade-in bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <PageHeader />
      <main className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <TableOfContents sections={sections} activeSection={activeSection} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatedSection>
                <SectionCard
                  id="introduction"
                  icon={
                    <InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  }
                  title="Introduction"
                >
                  <p className="text-base sm:text-lg font-medium text-text-primary mb-3 sm:mb-4">
                    This Refund Policy explains how Jinubify approaches refund requests for our
                    digital products, services, and engagements. It is designed to be transparent
                    and fair to both our clients and our team.
                  </p>
                  <p className="text-sm sm:text-base">
                    By purchasing or using any paid service from Jinubify, you agree that you have
                    read, understood, and agree to be bound by this Refund Policy, in addition to
                    our Terms of Service and Privacy Policy.
                  </p>
                </SectionCard>

                <SectionCard
                  id="eligibility"
                  icon={<ScaleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Eligibility for Refunds"
                >
                  <p className="text-sm sm:text-base">
                    Refund eligibility depends on the nature of the service or product purchased.
                    In general, refunds may be considered for:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm sm:text-base">
                    <li>• subscription-based services billed on a recurring basis;</li>
                    <li>• one-time digital services or packages that have not yet been fully delivered;</li>
                    <li>• accidental or duplicate payments made for the same service.</li>
                  </ul>
                  <p className="mt-3 text-sm sm:text-base">
                    Some offerings may have specific refund terms communicated at the time of
                    purchase. Where those terms differ from this policy, the specific terms will
                    prevail.
                  </p>
                </SectionCard>

                <SectionCard
                  id="timeframes"
                  icon={<ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Request Timeframes"
                >
                  <p className="text-sm sm:text-base">
                    To be considered, refund requests must generally be submitted within a
                    reasonable timeframe from the date of purchase or renewal. Unless otherwise
                    stated in a specific offer:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm sm:text-base">
                    <li>• subscription renewals are typically reviewable within a short window after billing;</li>
                    <li>• one-time service fees are typically reviewable prior to substantial work being completed.</li>
                  </ul>
                  <p className="mt-3 text-sm sm:text-base">
                    We may decline refund requests submitted long after the original transaction
                    date, especially where services have already been fully delivered or consumed.
                  </p>
                </SectionCard>

                <SectionCard
                  id="conditions"
                  icon={
                    <DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  }
                  title="Conditions for Approval"
                >
                  <p className="text-sm sm:text-base">
                    Refunds are not automatic. We evaluate each request based on the context and
                    may approve a refund where, for example:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm sm:text-base">
                    <li>• the service was not delivered as described due to an issue on our side;</li>
                    <li>• a technical problem prevented you from accessing or using the service and could not be resolved;</li>
                    <li>• a billing error, such as a duplicate charge, occurred.</li>
                  </ul>
                  <p className="mt-3 text-sm sm:text-base">
                    We may request additional information to understand the situation and may offer
                    alternatives such as service credits or adjustments where appropriate.
                  </p>
                </SectionCard>

                <SectionCard
                  id="non-refundable"
                  icon={
                    <ExclamationTriangleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  }
                  title="Non-Refundable Items"
                >
                  <p className="text-sm sm:text-base">
                    Certain fees and services are generally non-refundable, including but not
                    limited to:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm sm:text-base">
                    <li>• work that has already been completed or delivered as agreed;</li>
                    <li>• bespoke or custom development work that cannot be reused;</li>
                    <li>• third-party costs, licences, or advertising spend paid on your behalf;</li>
                    <li>• instances where you choose to discontinue a project for reasons unrelated to our performance.</li>
                  </ul>
                  <p className="mt-3 text-sm sm:text-base">
                    Where possible, we will communicate any non-refundable elements before you
                    commit to a purchase or engagement.
                  </p>
                </SectionCard>

                <SectionCard
                  id="process"
                  icon={
                    <InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  }
                  title="How to Request a Refund"
                >
                  <p className="text-sm sm:text-base">
                    If you believe you are eligible for a refund, please contact us as soon as
                    possible with the following information:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm sm:text-base">
                    <li>• your full name and contact details;</li>
                    <li>• the email address associated with your account or purchase;</li>
                    <li>• the invoice number, order ID, or other proof of payment;</li>
                    <li>• a brief description of the issue and why you are requesting a refund.</li>
                  </ul>
                  <p className="mt-3 text-sm sm:text-base">
                    This information helps us review your request quickly and accurately.
                  </p>
                </SectionCard>

                <SectionCard
                  id="evaluation"
                  icon={<ScaleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Evaluation & Resolution"
                >
                  <p className="text-sm sm:text-base">
                    Once we receive your refund request, we will acknowledge it and conduct an
                    internal review. In most cases, we aim to provide an initial response within a
                    reasonable number of business days.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    During this review, we may contact you for clarifications or additional
                    context. After our assessment, we will inform you of the outcome and any next
                    steps, which may include a refund, partial refund, service credit, or an
                    explanation of why a refund cannot be granted.
                  </p>
                </SectionCard>

                <SectionCard
                  id="method"
                  icon={<ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Refund Method & Timelines"
                >
                  <p className="text-sm sm:text-base">
                    Approved refunds are typically processed using the same payment method that was
                    used for the original transaction, where technically feasible.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Once processed on our side, it may take additional time for your bank, card
                    issuer, or payment provider to post the funds to your account. These external
                    processing times are outside of our control.
                  </p>
                </SectionCard>

                <SectionCard
                  id="chargebacks"
                  icon={
                    <ExclamationTriangleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  }
                  title="Chargebacks & Disputes"
                >
                  <p className="text-sm sm:text-base">
                    If you initiate a chargeback or payment dispute with your bank or payment
                    provider, we may suspend access to your account or services while the matter is
                    investigated.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    We strongly encourage you to contact us first to attempt to resolve any billing
                    or service concerns directly. In many cases, we can address issues more quickly
                    and constructively this way.
                  </p>
                </SectionCard>

                <SectionCard
                  id="changes"
                  icon={<ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Changes to This Refund Policy"
                >
                  <p className="text-sm sm:text-base">
                    We may update this Refund Policy from time to time to reflect changes in our
                    services, business practices, or applicable laws. Any changes will be posted on
                    this page with an updated &quot;Last updated&quot; date at the top.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Your continued use of our services after any changes become effective
                    constitutes your acceptance of the updated policy.
                  </p>
                </SectionCard>

                <SectionCard
                  id="contact"
                  icon={<EnvelopeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  title="Contact Us"
                >
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                    If you have any questions about this Refund Policy or would like to request a
                    refund, please reach out to us and we will do our best to help.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-text-inverted bg-brand-primary hover:opacity-90 text-sm sm:text-base font-semibold rounded-md"
                  >
                    <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contact Us
                  </Link>
                </SectionCard>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicyPage;

