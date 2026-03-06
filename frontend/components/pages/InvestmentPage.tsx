'use client';

import React, { useEffect, useState } from 'react';
import AnimatedSection from '../AnimatedSection';
import { investmentAPI } from '../../services/api';
import { useNotification } from '../admin/useNotification';

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Investment</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        Invest in Jinubify
      </h1>
      <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
        Partner with us to scale a modern digital studio focused on products, strategy, and results for growing
        businesses.
      </p>
    </div>
  </header>
);

const inputBase =
  'block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all text-sm';
const labelBase = 'block text-sm font-medium text-text-primary mb-1';

const InvestmentPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const prev = document.title;
    document.title = 'Invest in Jinubify';
    return () => {
      document.title = prev || 'Jinubify';
    };
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = String(formData.get('fullName') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const country = String(formData.get('country') || '').trim();
      const interestLevel = String(formData.get('interest') || '').trim();
      const investmentRange = String(formData.get('range') || '').trim();
      const message = String(formData.get('message') || '').trim();

      await investmentAPI.inquire({
        name,
        email,
        phone,
        country,
        interestLevel,
        investmentRange,
        message,
      });
      form.reset();
      showNotification('Inquiry submitted successfully.', 'success');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Failed to submit inquiry.';
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in investment-page" data-page="investment">
      <NotificationComponent />
      <PageHeader />

      {/* About the opportunity */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="opportunity-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">About the opportunity</p>
                <h2
                  id="opportunity-heading"
                  className="mt-2 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  A growing studio at the intersection of product, marketing, and technology.
                </h2>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Jinubify combines product thinking, engineering, and performance marketing to help SMEs and organizations
                launch and scale digital initiatives. We operate as a modern, lean studio, with recurring service
                revenue and productized offerings.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Our pipeline spans website projects, automation, social media management, and campaign execution for
                local and regional clients. We focus on measurable outcomes, long-term retainers, and repeat work, not
                one-off gigs.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Investment will accelerate our ability to hire core talent, strengthen our infrastructure, and expand
                into new markets while maintaining a strong operational foundation and disciplined growth.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why invest */}
      <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="why-invest-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Why invest</p>
                <h2
                  id="why-invest-heading"
                  className="mt-2 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  Built for sustainable, technology-enabled growth.
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6">
                <h3 className="text-sm font-semibold text-text-primary">Scalable Business Model</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Productized services and reusable components let us onboard clients efficiently and grow margins over
                  time.
                </p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6">
                <h3 className="text-sm font-semibold text-text-primary">Strong Digital Infrastructure</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Modern tooling, a stable codebase, and cloud-native workflows make our operations resilient and
                  transparent.
                </p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6">
                <h3 className="text-sm font-semibold text-text-primary">Expanding Client Base</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Focus on SMEs, NGOs, and growth-focused teams gives us a large, underserved market with recurring
                  needs.
                </p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6">
                <h3 className="text-sm font-semibold text-text-primary">Leadership Vision</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  A hands-on founder team with blended experience in engineering, design, marketing, and operations.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Investment inquiry form */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="investment-form-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden">
              <div className="p-6 sm:p-8 lg:p-10">
                <h2
                  id="investment-form-heading"
                  className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  Investment inquiry
                </h2>
                <p className="mt-2 text-sm text-text-secondary max-w-xl">
                  Share your details and interest. We will follow up with structured materials and next steps for a
                  deeper conversation.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className={labelBase}>
                        Full Name
                      </label>
                      <input id="fullName" name="fullName" type="text" required className={inputBase} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelBase}>
                        Email
                      </label>
                      <input id="email" name="email" type="email" required className={inputBase} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className={labelBase}>
                        Phone
                      </label>
                      <input id="phone" name="phone" type="tel" className={inputBase} />
                    </div>
                    <div>
                      <label htmlFor="country" className={labelBase}>
                        Country
                      </label>
                      <input id="country" name="country" type="text" className={inputBase} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="interest" className={labelBase}>
                        Investment Interest Level
                      </label>
                      <select id="interest" name="interest" className={inputBase}>
                        <option value="">Select an option</option>
                        <option value="exploring">Exploring opportunities</option>
                        <option value="considering">Actively considering</option>
                        <option value="ready">Ready to move forward</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="range" className={labelBase}>
                        Estimated Investment Range
                      </label>
                      <select id="range" name="range" className={inputBase}>
                        <option value="">Select a range</option>
                        <option value="10k-25k">$10,000 – $25,000</option>
                        <option value="25k-50k">$25,000 – $50,000</option>
                        <option value="50k-100k">$50,000 – $100,000</option>
                        <option value="100k-plus">$100,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelBase}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className={`${inputBase} resize-none`}
                      placeholder="Share your background, experience, or specific questions."
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex justify-center px-6 py-3 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default InvestmentPage;

