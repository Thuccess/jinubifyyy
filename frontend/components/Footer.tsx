 'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TwitterIcon, InstagramIcon, YouTubeIcon, FacebookIcon, WhatsAppIcon } from './icons/Socials';
import { PaperAirplaneIcon, CogIcon } from './icons/Icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCms } from '../contexts/CmsContext';
import type { Theme } from '../types';

interface FooterProps {
    currentUser?: {
        name: string;
        photoURL: string;
        role?: string;
    } | null;
}

const Logo: React.FC<{ theme: Theme }> = ({ theme }) => (
    <div className="flex items-center relative h-7 sm:h-8 md:h-9 lg:h-10 w-auto">
      <Image
        src={theme === 'dark' ? '/logo/logo-light.png' : '/logo/logo-dark.png'}
        alt="Jinubify Logo"
        width={160}
        height={40}
        className="object-contain object-left h-full w-auto transition-[height] duration-200"
      />
    </div>
);

const Footer: React.FC<FooterProps> = ({ currentUser }) => {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const { site } = useCms();

    useEffect(() => {
        setMounted(true);
    }, []);
    const settings = site?.siteSettings ?? {};
    const footerTagline = (settings.footerTagline as string) ?? "Modern solutions for your business needs. Empowering brands to grow their social media presence with cutting-edge strategies and tools.";
    const ctaEyebrow = (settings.footerCtaEyebrow as string) ?? 'Start today';
    const ctaHeading = (settings.footerCtaHeading as string) ?? 'Ready to Amplify Your Presence?';
    const ctaBody = (settings.footerCtaBody as string) ?? 'Join Jinubify today and start your journey towards unparalleled social media growth.';
    const ctaButtonText = (settings.footerCtaButtonText as string) ?? 'Get Started Free';

    const socialLinks = [
        { name: 'X', href: '#', icon: <TwitterIcon className="w-5 h-5" /> },
        { name: 'Instagram', href: '#', icon: <InstagramIcon className="w-5 h-5" /> },
        { name: 'YouTube', href: '#', icon: <YouTubeIcon className="w-5 h-5" /> },
        { name: 'Facebook', href: '#', icon: <FacebookIcon className="w-5 h-5" /> },
        { name: 'WhatsApp', href: '#', icon: <WhatsAppIcon className="w-5 h-5" /> },
    ];

    const footerLinks = {
        Explore: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Services', path: '/services' },
            { name: 'Demos & Case Studies', path: '/demos' },
            { name: 'Portfolio', path: '/portfolio' },
            { name: 'Industries We Serve', path: '/industries' },
            { name: 'Technologies We Use', path: '/technologies' },
            { name: 'Success Stories', path: '/success-stories' },
        ],
        Company: [
            { name: 'Our Team', path: '/team' },
            { name: 'Mission & Vision', path: '/mission-vision' },
            { name: 'Partners', path: '/partners' },
            { name: 'Career', path: '/career' },
            { name: 'Investment', path: '/investment' },
            { name: 'Company Profile', path: '/company-profile' },
            { name: 'Press / Media', path: '/press-media' },
            { name: 'Contact', path: '/contact' },
            { name: 'FAQ', path: '/faq' },
            ...(mounted && currentUser ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
            { name: 'Admin', path: '/admin' },
        ],
        Resources: [
            { name: 'Blog', path: '/blog' },
            { name: 'Resources', path: '/resources' },
            { name: 'Guides / Knowledge Base', path: '/guides' },
            { name: 'Webinars & Events', path: '/events' },
            { name: 'Free Tools', path: '/tools' },
            { name: 'Newsletter', path: '/newsletter' },
        ],
        Legal: [
            { name: 'Privacy Policy', path: '/privacy-policy' },
            { name: 'Terms & Conditions', path: '/terms-of-service' },
            { name: 'Cookie Policy', path: '/cookie-policy' },
            { name: 'Refund Policy', path: '/refund-policy' },
            { name: 'Disclaimer', path: '/disclaimer' },
        ],
    };

    return (
        <footer className="glass-surface glass-surface--bar rounded-none border-t border-[color:var(--glass-border)]">
             <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {/* CTA Section – uses --cta-* vars for tuned light/dark mode */}
                <div
                    className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-inset bg-[color:var(--cta-bg)] transition-colors duration-300"
                    style={{ minHeight: '12rem', boxShadow: '0 25px 50px -12px var(--cta-glow)' }}
                >
                    <div className="absolute inset-0 ring-1 ring-inset ring-[color:var(--cta-ring)] pointer-events-none rounded-3xl" aria-hidden="true" />
                    {/* Decorative background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--cta-bg)] via-[color:var(--cta-bg)] to-transparent" aria-hidden="true" />
                    <div className="absolute -bottom-20 -right-16 w-64 h-64 bg-[color:var(--cta-glow)] rounded-full blur-3xl" aria-hidden="true" />
                    <div className="absolute -top-16 -left-20 w-48 h-48 bg-[color:var(--cta-glow)] rounded-full blur-3xl opacity-80" style={{ animationDirection: 'reverse' }} aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-black/5" aria-hidden="true" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8 md:gap-10 p-8 sm:p-10 md:p-12 lg:p-14">
                        <div className="flex-1 max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--cta-eyebrow)' }}>
                                Start today
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--cta-heading)' }}>
                                Ready to Amplify Your Presence?
                            </h2>
                            <p className="mt-4 text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: 'var(--cta-body)' }}>
                                Join Jinubify today and start your journey towards unparalleled social media growth.
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="flex-shrink-0 group inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-[color:var(--cta-bg)] bg-[color:var(--cta-btn-bg)] hover:bg-[color:var(--cta-btn-hover)]"
                            style={{ color: 'var(--cta-btn-text)' }}
                        >
                            Get Started Free
                            <PaperAirplaneIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Main Footer */}
                <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
                    {/* Brand block */}
                    <div className="lg:col-span-5 flex flex-col">
                        <Link href="/" className="inline-block" aria-label="Jinubify Home">
                            <Logo theme={theme} />
                        </Link>
                        <p className="mt-5 text-text-secondary text-base leading-relaxed max-w-sm">
                            {footerTagline}
                        </p>
                        <div className="mt-6 flex gap-4" aria-label="Social links">
                            {socialLinks.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-text-muted hover:text-brand-primary transition-colors duration-200 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                                    aria-label={`Jinubify on ${item.name}`}
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <nav className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10" aria-label="Footer navigation">
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div key={heading}>
                                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                                    {heading}
                                </h3>
                                <ul role="list" className="space-y-3">
                                    {links.map((item: { name: string; path: string }) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.path}
                                                className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)] rounded"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 pt-8 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-muted order-2 sm:order-1">
                        &copy; {new Date().getFullYear()} Jinubify, Inc. All rights reserved.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 order-1 sm:order-2">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-brand-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 rounded"
                        >
                            <CogIcon className="h-4 w-4" aria-hidden />
                            Admin
                        </Link>
                        <span className="text-sm text-text-muted" aria-hidden="true">
                            Made with ❤️ for your success
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;