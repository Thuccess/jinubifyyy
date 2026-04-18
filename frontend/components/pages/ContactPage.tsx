'use client';

import React, { useState } from 'react';
import AnimatedSection from '../AnimatedSection';
import { TwitterIcon, FacebookIcon, LinkedInIcon, TikTokIcon } from '../icons/Socials';
import { MapPinIcon, EnvelopeIcon, PhoneIcon } from '../icons/Icons';
import { contactAPI } from '../../services/api';
import { useSocialLinks } from '../../hooks/useSocialLinks';
import { mergeCompanySocials } from '@/config/companySocialLinks';

// --- Subcomponents ---

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Get In Touch</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                Let's Build Something Great
            </h1>
            <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
                Have a question, a project idea, or just want to say hello? We'd love to hear from you.
            </p>
        </div>
    </header>
);


const ContactForm: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');
        
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const subject = formData.get('subject') as string;
            const message = formData.get('message') as string;

            await contactAPI.submitContact({
                name,
                email,
                subject,
                message,
            });
            
            setStatus('success');
            (e.target as HTMLFormElement).reset();

            setTimeout(() => setStatus('idle'), 7000);
        } catch (error: any) {
            console.error("Failed to submit contact form:", error);
            setStatus('error');
            setErrorMessage(
                error.response?.data?.message || 
                error.response?.data?.errors?.[0]?.msg ||
                'Failed to send message. Please try again later.'
            );
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 5000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                    <input type="text" name="name" id="name" required className="block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
                    <input type="email" name="email" id="email" required className="block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all" />
                </div>
            </div>
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">Subject</label>
                    <input type="text" name="subject" id="subject" required className="block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">Message</label>
                    <textarea id="message" name="message" rows={5} required className="block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all"></textarea>
            </div>
            <div>
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full btn-contrast-mode btn-contrast-mode--compact border border-transparent focus-visible:ring-offset-2"
                >
                    {status === 'submitting' ? 'Preparing Message...' : 'Send Message'}
                </button>
            </div>
            <div role="status" aria-live="polite" className="h-5">
                {status === 'success' && <p className="text-sm text-center text-brand-primary">Thank you! Your message has been sent successfully. We'll get back to you soon.</p>}
                {status === 'error' && <p className="text-sm text-center text-text-primary">{errorMessage || 'Something went wrong. Please try again later.'}</p>}
            </div>
        </form>
    );
};

const InfoItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[color:var(--surface-card)] border border-border-card flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
            {icon}
        </span>
        <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <div className="mt-1">{children}</div>
        </div>
    </div>
);

// --- Main Contact Page Component ---

const ContactPage: React.FC = () => {
  const { socials } = useSocialLinks();
  const merged = mergeCompanySocials(socials);

  const socialLinks = [
    { name: 'TikTok', href: merged.tiktok, icon: <TikTokIcon className="w-5 h-5" /> },
    { name: 'Facebook', href: merged.facebook, icon: <FacebookIcon className="w-5 h-5" /> },
    { name: 'LinkedIn', href: merged.linkedin, icon: <LinkedInIcon className="w-5 h-5" /> },
    { name: 'X', href: merged.twitter, icon: <TwitterIcon className="w-5 h-5" /> },
  ].filter((l) => Boolean(l.href));

  return (
    <div className="animate-fade-in">
      <PageHeader />
      
      <section className="py-16 sm:py-20 lg:py-24" aria-label="Contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
                <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] overflow-hidden shadow-card">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-6 sm:p-8 lg:p-10">
                            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">Send us a Message</h2>
                            <p className="mt-2 text-sm text-text-secondary">Fill out the form and our team will get back to you within 24 hours.</p>
                            <div className="mt-8">
                                <ContactForm />
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 lg:p-10 bg-[color:var(--bg-secondary)] border-t lg:border-t-0 lg:border-l border-border-subtle space-y-6">
                            <InfoItem icon={<MapPinIcon className="w-5 h-5 text-text-primary" />} title="Our Location">
                                <p className="text-sm text-text-secondary">Kampala, Uganda</p>
                            </InfoItem>
                            <InfoItem icon={<EnvelopeIcon className="w-5 h-5 text-text-primary" />} title="Email Us">
                                <a href="mailto:jinubify1@gmail.com" className="text-sm text-text-secondary hover:text-brand-primary">jinubify1@gmail.com</a>
                            </InfoItem>
                            <InfoItem icon={<PhoneIcon className="w-5 h-5 text-text-primary" />} title="Call or WhatsApp">
                                <a href="tel:+256766211792" className="text-sm text-text-secondary hover:text-brand-primary">+256 766 211792</a>
                            </InfoItem>
                            <div className="pt-6 border-t border-border-subtle">
                                <h3 className="text-sm font-semibold text-text-primary">Follow Us</h3>
                                <div className="mt-3 flex gap-4">
                                    {socialLinks.map((link) => (
                                      <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-text-muted hover:text-brand-primary transition-colors"
                                        aria-label={`Follow us on ${link.name}`}
                                      >
                                        {link.icon}
                                      </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;