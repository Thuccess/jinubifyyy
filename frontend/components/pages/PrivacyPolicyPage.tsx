
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { 
    ShieldCheckIcon, 
    InformationCircleIcon, 
    DocumentTextIcon, 
    LockClosedIcon, 
    UserGroupIcon, 
    ClockIcon, 
    CookieIcon,
    EnvelopeIcon 
} from '../icons/Icons';

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Legal Document</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                Privacy Policy
            </h1>
            <p className="mt-5 text-base text-text-secondary max-w-xl">
                Your privacy is important to us. It is Jinubify's policy to respect your privacy regarding any information we may collect from you across our website.
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
                    className="w-full rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
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
                    <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-border-subtle">
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full text-left flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                                        activeSection === section.id
                                            ? 'bg-brand-soft text-brand-primary font-medium'
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
                    <h3 className="text-xs lg:text-sm font-bold text-text-primary uppercase tracking-wider mb-3 lg:mb-4">Table of Contents</h3>
                    <nav className="space-y-1 lg:space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full text-left flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm ${
                                    activeSection === section.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-surface-muted/90 hover:text-text-primary'
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
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary leading-tight">{title}</h2>
            </div>
            <div className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none text-text-secondary leading-relaxed">
                {children}
            </div>
        </div>
    </section>
);

const PrivacyPolicyPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('introduction');

    const sections = useMemo(() => [
        { id: 'introduction', title: 'Introduction', icon: <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'information-collect', title: 'Information We Collect', icon: <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'how-we-use', title: 'How We Use Your Information', icon: <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'log-files', title: 'Log Files', icon: <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'cookies', title: 'Cookies and Web Beacons', icon: <CookieIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'security', title: 'Security of Your Data', icon: <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'children-privacy', title: "Children's Privacy", icon: <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'changes', title: 'Changes to This Policy', icon: <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
        { id: 'contact', title: 'Contact Us', icon: <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
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
                                    icon={<InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Introduction"
                                >
                                    <p className="text-base sm:text-lg font-medium text-text-primary mb-3 sm:mb-4">
                                        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                                    </p>
                                    <p className="text-sm sm:text-base">
                                        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="information-collect"
                                    icon={<DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Information We Collect"
                                >
                                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                                        We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
                                    </p>
                                    <p className="font-semibold text-text-primary mb-2 text-sm sm:text-base">Information you provide to us directly:</p>
                                    <p className="text-sm sm:text-base">
                                        We may ask for certain information such as your username, first and last name, birthdate, phone number, and e-mail address when you register for a Jinubify account, or if you correspond with us.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="how-we-use"
                                    icon={<ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="How We Use Your Information"
                                >
                                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">We use the information we collect in various ways, including to:</p>
                                    <ul className="list-none space-y-2 sm:space-y-3">
                                        <li className="flex items-start gap-2 sm:gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">✓</span>
                                            </span>
                                            <span className="text-sm sm:text-base">Provide, operate, and maintain our website</span>
                                        </li>
                                        <li className="flex items-start gap-2 sm:gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">✓</span>
                                            </span>
                                            <span className="text-sm sm:text-base">Improve, personalize, and expand our website</span>
                                        </li>
                                        <li className="flex items-start gap-2 sm:gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">✓</span>
                                            </span>
                                            <span className="text-sm sm:text-base">Understand and analyze how you use our website</span>
                                        </li>
                                        <li className="flex items-start gap-2 sm:gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">✓</span>
                                            </span>
                                            <span className="text-sm sm:text-base">Develop new products, services, features, and functionality</span>
                                        </li>
                                        <li className="flex items-start gap-2 sm:gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                                                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">✓</span>
                                            </span>
                                            <span className="text-sm sm:text-base">Communicate with you, either directly or through one of our partners</span>
                                        </li>
                                    </ul>
                                </SectionCard>

                                <SectionCard
                                    id="log-files"
                                    icon={<DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Log Files"
                                >
                                    <p className="text-sm sm:text-base">
                                        Jinubify follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="cookies"
                                    icon={<CookieIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Cookies and Web Beacons"
                                >
                                    <p className="text-sm sm:text-base">
                                        Like any other website, Jinubify uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="security"
                                    icon={<LockClosedIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Security of Your Personal Data"
                                >
                                    <p className="text-sm sm:text-base">
                                        The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="children-privacy"
                                    icon={<UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Children's Privacy"
                                >
                                    <p className="text-sm sm:text-base">
                                        Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="changes"
                                    icon={<ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Changes to This Privacy Policy"
                                >
                                    <p className="text-sm sm:text-base">
                                        We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                                    </p>
                                </SectionCard>

                                <SectionCard
                                    id="contact"
                                    icon={<EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                    title="Contact Us"
                                >
                                    <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                                        If you have any questions about this Privacy Policy, you can contact us.
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

export default PrivacyPolicyPage;
