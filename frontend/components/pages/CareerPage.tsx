'use client';

import React, { useEffect, useState } from 'react';
import AnimatedSection from '../AnimatedSection';
import { careerAPI, uploadAPI } from '../../services/api';
import { useNotification } from '../admin/useNotification';

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Join Our Team</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        Careers at Jinubify
      </h1>
      <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
        Help us build modern digital experiences that empower brands and businesses across Africa and beyond.
      </p>
    </div>
  </header>
);

const benefits = [
  {
    title: 'Growth Opportunities',
    body: 'Level up through mentorship, learning programs, and meaningful responsibilities from day one.',
  },
  {
    title: 'Innovative Projects',
    body: 'Work on real products, not just mockups, across web, mobile, automation, and marketing.',
  },
  {
    title: 'Collaborative Culture',
    body: 'Join a small, tight-knit team where ideas are heard, feedback is direct, and wins are shared.',
  },
  {
    title: 'Competitive Rewards',
    body: 'Remote-friendly flexibility, performance-based bonuses, and recognition for impact.',
  },
];

const positions = [
  {
    title: 'Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote / Kampala',
    type: 'Full-time',
    summary:
      'Build and maintain web applications, APIs, and integrations that power Jinubify and our clients.',
  },
  {
    title: 'Digital Marketing Specialist',
    department: 'Growth & Marketing',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Plan, execute, and optimize campaigns across social, search, and performance channels for SMEs.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract / Project-based',
    summary:
      'Design clean, conversion-focused experiences for landing pages, dashboards, and campaigns.',
  },
];

const inputBase =
  'block w-full px-4 py-3 border border-border-subtle rounded-lg shadow-sm hover:border-brand-primary focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card dark:bg-surface-card transition-all text-sm';
const labelBase = 'block text-sm font-medium text-text-primary mb-1';

const CareerPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Careers at Jinubify';
    return () => {
      document.title = previousTitle || 'Jinubify';
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
      const position = String(formData.get('position') || '').trim();
      const coverLetter = String(formData.get('coverLetter') || '').trim();
      let resumeUrl: string | undefined;

      const file = formData.get('cv') as File | null;
      if (file && file.size > 0) {
        // Simple extension of existing validated upload pipeline (image-only). For now
        // we rely on URL-based resumes; file upload can be extended when backend is ready.
        // Here we skip file upload if backend does not support non-image types.
        if (file.type.startsWith('image/')) {
          const uploaded = await uploadAPI.uploadImage(file);
          resumeUrl = uploaded.url;
        } else {
          showNotification('For now, please upload image-based CVs or share a link inside the cover letter.', 'info');
        }
      }

      await careerAPI.apply({
        name,
        email,
        phone,
        position,
        coverLetter,
        resumeUrl,
      });
      form.reset();
      showNotification('Application submitted successfully.', 'success');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Failed to submit application.';
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in career-page" data-page="career">
      <NotificationComponent />
      <PageHeader />

      {/* Why Work With Us */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="why-career-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Why Work With Us</p>
                <h2
                  id="why-career-heading"
                  className="mt-2 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  Grow your career with a modern digital team.
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border-card bg-[color:var(--surface-card)] p-6 flex flex-col gap-3"
                >
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="open-positions-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Open Positions</p>
                <h2
                  id="open-positions-heading"
                  className="mt-2 text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  Roles we&apos;re hiring for.
                </h2>
                <p className="mt-2 text-sm text-text-secondary max-w-xl">
                  These roles are representative. As we grow, we&apos;re always excited to meet strong generalists and
                  specialists.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {positions.map((role) => (
                <div
                  key={role.title}
                  className="rounded-lg border border-border-card bg-[color:var(--surface-card)] p-5 sm:p-6 flex flex-col gap-3 sm:gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                    <h3 className="text-base font-semibold text-text-primary">{role.title}</h3>
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
                      <span>{role.department}</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>{role.location}</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle" />
                      <span>{role.type}</span>
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{role.summary}</p>
                  <div className="mt-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md min-h-[40px] transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Application form */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="application-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] overflow-hidden shadow-card">
              <div className="p-6 sm:p-8 lg:p-10">
                <h2
                  id="application-heading"
                  className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
                >
                  Send us your application
                </h2>
                <p className="mt-2 text-sm text-text-secondary max-w-xl">
                  Share your details and the role you&apos;re interested in. We&apos;ll reach out when there is a strong
                  match.
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
                      <label htmlFor="position" className={labelBase}>
                        Position Applied For
                      </label>
                      <input
                        id="position"
                        name="position"
                        type="text"
                        placeholder="e.g. Full-Stack Developer"
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cv" className={labelBase}>
                      Upload CV (optional)
                    </label>
                    <input
                      id="cv"
                      name="cv"
                      type="file"
                      className="block w-full text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-soft file:text-brand-primary hover:file:bg-surface-muted/90"
                    />
                  </div>
                  <div>
                    <label htmlFor="coverLetter" className={labelBase}>
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={5}
                      className={`${inputBase} resize-none`}
                      placeholder="Tell us why you’d like to work with Jinubify."
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex justify-center px-6 py-3 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-lg shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
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

export default CareerPage;

