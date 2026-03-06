'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  DocumentTextIcon,
  ScaleIcon,
  ClockIcon,
  EnvelopeIcon,
} from '../icons/Icons';

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Legal Document
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        Disclaimer
      </h1>
      <p className="mt-5 text-base text-text-secondary max-w-xl">
        The information on this website is provided for general informational purposes only and is
        not intended as professional advice of any kind. Please read this disclaimer carefully
        before using our website, products, or services.
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
          className="w-full rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
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
          <div className="mt-2 rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                    activeSection === section.id
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium'
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
        <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-4 lg:p-6">
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
    <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-4 sm:p-6 md:p-8">
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

const DisclaimerPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = useMemo(
    () => [
      {
        id: 'introduction',
        title: 'Introduction',
        icon: <InformationCircleIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'no-professional-advice',
        title: 'No Professional Advice',
        icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'no-guarantees',
        title: 'No Guarantees or Warranties',
        icon: <DocumentTextIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'information-accuracy',
        title: 'Information Accuracy and Completeness',
        icon: <InformationCircleIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'third-party-content',
        title: 'Third-Party Content and Services',
        icon: <LinkIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'external-links',
        title: 'External Links',
        icon: <LinkIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'limitation-of-liability',
        title: 'Limitation of Liability',
        icon: <ScaleIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'affiliate-disclosure',
        title: 'Affiliates and Partnerships',
        icon: <DocumentTextIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'changes',
        title: 'Changes to This Disclaimer',
        icon: <ClockIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
      },
      {
        id: 'contact',
        title: 'Contact Us',
        icon: <EnvelopeIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />,
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
                    <InformationCircleIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  }
                  title="Introduction"
                >
                  <p className="text-base sm:text-lg font-medium text-text-primary mb-3 sm:mb-4">
                    This Disclaimer outlines important limitations and clarifications regarding how
                    you should interpret and use the information provided by Jinubify on this
                    website and through our related products and services.
                  </p>
                  <p className="text-sm sm:text-base">
                    By accessing or using this website, you agree that you have read, understood,
                    and agree to be bound by this Disclaimer in addition to our Terms of Service and
                    Privacy Policy. If you do not agree, you should discontinue use of the website
                    and our services.
                  </p>
                </SectionCard>

                <SectionCard
                  id="no-professional-advice"
                  icon={
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  }
                  title="No Professional Advice"
                >
                  <p className="text-sm sm:text-base">
                    All content made available by Jinubify, including but not limited to articles,
                    guides, case studies, templates, examples, and recommendations, is provided for
                    general informational and educational purposes only.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Nothing on this website constitutes, or is intended to constitute, legal,
                    financial, tax, medical, or any other type of professional advice. You should
                    not rely on any information presented here as a substitute for consulting with
                    appropriately qualified professionals who are familiar with your specific
                    circumstances.
                  </p>
                </SectionCard>

                <SectionCard
                  id="no-guarantees"
                  icon={
                    <DocumentTextIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  }
                  title="No Guarantees or Warranties"
                >
                  <p className="text-sm sm:text-base">
                    While we make reasonable efforts to share accurate, practical, and
                    experience-based insights, Jinubify makes no representations, warranties, or
                    guarantees, express or implied, regarding the results you may achieve by
                    applying any information, strategies, or recommendations from this website.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Any examples of past outcomes, case studies, testimonials, or scenarios
                    described are illustrative only. They are not guarantees that you or your
                    organization will achieve similar results, as outcomes depend on numerous
                    factors beyond our knowledge or control.
                  </p>
                </SectionCard>

                <SectionCard
                  id="information-accuracy"
                  icon={
                    <InformationCircleIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  }
                  title="Information Accuracy and Completeness"
                >
                  <p className="text-sm sm:text-base">
                    The content on this website is provided on an &quot;as is&quot; and
                    &quot;as available&quot; basis. Although we aim to keep information current,
                    accurate, and useful, we do not warrant that the content is complete, reliable,
                    up to date, or free from errors or omissions.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Information may be updated, corrected, or removed at any time without notice.
                    You are responsible for independently verifying any information that is
                    important to your decisions before acting on it.
                  </p>
                </SectionCard>

                <SectionCard
                  id="third-party-content"
                  icon={<LinkIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />}
                  title="Third-Party Content and Services"
                >
                  <p className="text-sm sm:text-base">
                    From time to time, our content may reference or integrate tools, platforms,
                    libraries, services, or materials provided by third parties. Any such
                    references are provided for your convenience and do not constitute an
                    endorsement or recommendation by Jinubify unless explicitly stated.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Jinubify does not control and is not responsible or liable for any
                    third-party content, products, services, or actions. Your use of any
                    third-party offering is solely between you and the applicable third party and
                    is governed by their own terms, policies, and practices.
                  </p>
                </SectionCard>

                <SectionCard
                  id="external-links"
                  icon={<LinkIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />}
                  title="External Links"
                >
                  <p className="text-sm sm:text-base">
                    This website may contain links to external websites that are not maintained or
                    controlled by Jinubify. These links are provided solely as a convenience to
                    you and do not imply any approval, monitoring, or endorsement of the content on
                    those websites.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Jinubify is not responsible for the content, policies, or practices of any
                    external sites and will not be liable for any loss or damage that may arise
                    from your use of them. You access any third-party websites at your own risk.
                  </p>
                </SectionCard>

                <SectionCard
                  id="limitation-of-liability"
                  icon={<ScaleIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />}
                  title="Limitation of Liability"
                >
                  <p className="text-sm sm:text-base">
                    To the fullest extent permitted by applicable law, Jinubify, its directors,
                    employees, partners, agents, and affiliates shall not be liable for any
                    indirect, incidental, special, consequential, or punitive damages, or any loss
                    of profits, revenues, data, or goodwill arising out of or in connection with
                    your access to or use of this website, its content, or any linked resources.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    This limitation applies whether the alleged liability is based on contract,
                    negligence, strict liability, or any other legal theory, even if we have been
                    advised of the possibility of such damage.
                  </p>
                </SectionCard>

                <SectionCard
                  id="affiliate-disclosure"
                  icon={
                    <DocumentTextIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  }
                  title="Affiliates and Partnerships"
                >
                  <p className="text-sm sm:text-base">
                    Jinubify may, now or in the future, maintain relationships with selected
                    partners, vendors, or platforms. In some cases, we may receive compensation,
                    referral fees, or other benefits if you choose to engage with those third
                    parties through links or references on this website.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Any such relationships are disclosed in a manner consistent with applicable
                    regulations and guidelines. We always aim to share recommendations that are
                    based on relevance and practical value, regardless of any potential commercial
                    relationship.
                  </p>
                </SectionCard>

                <SectionCard
                  id="changes"
                  icon={<ClockIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />}
                  title="Changes to This Disclaimer"
                >
                  <p className="text-sm sm:text-base">
                    We may update or revise this Disclaimer from time to time to reflect changes in
                    our practices, services, or applicable laws. Any changes will be posted on this
                    page with an updated &quot;Last updated&quot; date at the top of the document.
                  </p>
                  <p className="mt-3 text-sm sm:text-base">
                    Your continued use of the website after any changes become effective will
                    constitute your acknowledgment of the updated Disclaimer and your agreement to
                    be bound by it.
                  </p>
                </SectionCard>

                <SectionCard
                  id="contact"
                  icon={<EnvelopeIcon className="w-6 h-6 text-amber-700 dark:text-amber-300" />}
                  title="Contact Us"
                >
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                    If you have any questions or concerns about this Disclaimer, or how it applies
                    to your use of Jinubify&apos;s website and services, please contact us.
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

export default DisclaimerPage;

