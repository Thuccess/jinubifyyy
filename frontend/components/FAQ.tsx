'use client';

import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from './icons/Icons';
import Icon from './ui/Icon';

const faqData = [
  {
    question: 'What makes your services high-quality?',
    answer:
      'We use a combination of AI-powered analytics and real user networks to ensure that the engagement you receive is from authentic-looking profiles, relevant to your niche. This helps maintain your account\'s credibility while boosting its visibility.',
  },
  {
    question: 'Are the followers and likes from real people?',
    answer:
      'Our services provide followers and engagement from high-quality profiles that appear authentic. While they are primarily for social proof, they are designed to be indistinguishable from real users to protect and enhance your online reputation.',
  },
  {
    question: 'How long does it take to see results?',
    answer:
      'Results are often visible within minutes of placing an order. Our system is designed for rapid delivery, so you can see your social proof increase almost instantly. For larger orders, we may drip-feed the engagement to ensure it looks natural.',
  },
  {
    question: 'Is using SMM Spot safe for my social media accounts?',
    answer:
      'Absolutely. We prioritize your account\'s safety. Our methods comply with the terms of service of all major social media platforms. We never ask for your password, and our processes are designed to be discreet and secure.',
  },
  {
    question: 'What happens if my follower or like count drops?',
    answer:
      'We stand by the quality of our services. Many of our services come with a "Non-drop" guarantee and lifetime refills. If you experience a drop in numbers, our 24/7 support team is here to help and will refill your order free of charge.',
  },
];

const FAQ: React.FC<{ content?: Record<string, unknown> }> = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Got Questions?
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 max-w-xl text-base text-text-secondary">
          Find answers to common questions. Can't find what you need? Contact our support team.
        </p>
        <div className="mt-12 max-w-3xl">
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left p-4 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-ring)] hover:bg-surface-muted/90 transition-colors duration-300 ease-out rounded-lg"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <span className="text-md font-semibold text-text-primary">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    {openIndex === index ? (
                      <Icon icon={MinusIcon} size="sm" tone="brand" />
                    ) : (
                      <Icon icon={PlusIcon} size="sm" tone="muted" />
                    )}
                  </span>
                </button>
                <div 
                  id={`faq-content-${index}`}
                  className={`overflow-hidden transition-max-height duration-500 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-text-secondary text-sm">
                        {faq.answer}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;