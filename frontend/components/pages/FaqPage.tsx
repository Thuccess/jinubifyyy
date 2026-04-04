`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { PlusIcon, MinusIcon } from '../icons/Icons';

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: 'What is Jinubify and who is it for?',
    answer:
      'Jinubify is a digital partner for growing businesses, founders, and teams who want to use technology strategically—not just tactically. We help you plan, design, and deliver digital products, marketing assets, and systems that support real business outcomes.',
  },
  {
    question: 'What kinds of services do you offer?',
    answer:
      'We work across strategy, design, engineering, and growth: from product discovery and roadmapping, to web and app development, branding, content, and ongoing optimisation. Visit the Services page for a full breakdown, or reach out if you are unsure where your needs fit.',
  },
  {
    question: 'Do you only work with large organisations?',
    answer:
      'No. A core part of our mission is empowering local SMEs and growing companies. We design our engagements to be right-sized for your context—starting small when needed and scaling as we build trust and results together.',
  },
  {
    question: 'How do projects typically start?',
    answer:
      'Most collaborations begin with a focused discovery call or consultation. We clarify your goals, constraints, and timelines, then propose a roadmap or engagement model that fits. From there, we co-create milestones and stay transparent about progress.',
  },
  {
    question: 'Can you work with our existing team?',
    answer:
      'Yes. We often partner with in-house teams, agencies, or freelancers—either as an extension of your capacity or as a specialist partner in specific areas such as architecture, product strategy, or delivery.',
  },
  {
    question: 'How do you measure success?',
    answer:
      'We start by defining what success looks like for you: revenue, engagement, activation, retention, operational savings, or other metrics. We then anchor our work—and how we report back—on those agreed outcomes.',
  },
];

const FaqItemRow: React.FC<{ item: FaqItem }> = ({ item }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border border-border-card rounded-xl bg-[color:var(--surface-card)] shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
      >
        <span className="text-sm sm:text-base font-semibold text-text-primary">{item.question}</span>
        <span aria-hidden className="flex-shrink-0">
          {open ? (
            <MinusIcon className="h-5 w-5 text-text-muted" />
          ) : (
            <PlusIcon className="h-5 w-5 text-text-muted" />
          )}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-text-secondary leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
};

const FaqPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="faq">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Help & Support
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            Answers to the questions we are asked most often about working with Jinubify. If you do not
            see what you are looking for, you can always reach out directly.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section aria-label="Frequently asked questions">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="space-y-3 sm:space-y-4">
                {faqs.map((item) => (
                  <FaqItemRow key={item.question} item={item} />
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="mt-12 rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 text-center shadow-card">
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
                  Still have a question?
                </h2>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
                  If something is unclear or you want to discuss a specific idea, just send us a message
                  through the contact page. We are happy to help you figure out the next best step.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FaqPage;

