
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { 
    DocumentTextIcon, 
    InformationCircleIcon, 
    ScaleIcon, 
    LinkIcon, 
    ExclamationTriangleIcon, 
    ClockIcon,
    EnvelopeIcon,
    ShieldCheckIcon
} from '../icons/Icons';

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Legal Document</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                Terms of Service
            </h1>
            <p className="mt-5 text-base text-text-secondary max-w-xl">
                Please read our terms carefully before using our services. Your access to and use of the service is conditioned on your acceptance of and compliance with these Terms.
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <ClockIcon className="w-4 h-4 flex-shrink-0" aria-hidden />
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                behavior: 'smooth'
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
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Table of Contents</h3>
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
                    <h3 className="text-xs lg:text-sm font-bold text-text-primary uppercase tracking-wider mb-3 lg:mb-4">Table of Contents</h3>
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
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary leading-tight">{title}</h2>
            </div>
            <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none text-text-secondary leading-relaxed">
                {children}
            </div>
        </div>
    </section>
);

const TermsOfServicePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('introduction');

    const sections = useMemo(() => [
        { id: 'introduction', title: 'Introduction', icon: <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'accounts', title: 'Accounts', icon: <ShieldCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'intellectual-property', title: 'Intellectual Property', icon: <DocumentTextIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'links', title: 'Links To Other Websites', icon: <LinkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'termination', title: 'Termination', icon: <ExclamationTriangleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'limitation', title: 'Limitation Of Liability', icon: <ScaleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'governing-law', title: 'Governing Law', icon: <ScaleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'changes', title: 'Changes', icon: <ClockIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
        { id: 'contact', title: 'Contact Us', icon: <EnvelopeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
    ], []);

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
                                    icon={<InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Introduction"
                                >
                                    <p className="text-base sm:text-lg font-medium text-text-primary mb-3 sm:mb-4">
                                        Welcome to Jinubify! These terms and conditions outline the rules and regulations for the use of Jinubify's Website, located at jinubify.com.
                                    </p>
                                    <p className="text-sm sm:text-base">
                                        By accessing this website we assume you accept these terms and conditions. Do not continue to use Jinubify if you do not agree to take all of the terms and conditions stated on this page.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="accounts"
                                    icon={<ShieldCheckIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Accounts"
                                >
                                    <p className="text-sm sm:text-base">
                                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="intellectual-property"
                                    icon={<DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Intellectual Property"
                                >
                                    <p className="text-sm sm:text-base">
                                        The Service and its original content, features and functionality are and will remain the exclusive property of Jinubify and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="links"
                                    icon={<LinkIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Links To Other Web Sites"
                                >
                                    <p className="text-sm sm:text-base">
                                        Our Service may contain links to third-party web sites or services that are not owned or controlled by Jinubify. Jinubify has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="termination"
                                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Termination"
                                >
                                    <p className="text-sm sm:text-base">
                                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="limitation"
                                    icon={<ScaleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Limitation Of Liability"
                                >
                                    <p className="text-sm sm:text-base">
                                        In no event shall Jinubify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="governing-law"
                                    icon={<ScaleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Governing Law"
                                >
                                    <p className="text-sm sm:text-base">
                                        These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="changes"
                                    icon={<ClockIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Changes"
                                >
                                    <p className="text-sm sm:text-base">
                                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="contact"
                                    icon={<EnvelopeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                                    title="Contact Us"
                                >
                                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                                        If you have any questions about these Terms, please contact us.
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

export default TermsOfServicePage;
