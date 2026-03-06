 'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AnimatedSection from '../../AnimatedSection';
import { MegaphoneIcon, CheckIcon, ArrowRightIcon } from '../../icons/Icons';

const DigitalMarketingDemo: React.FC = () => {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 shadow-lg">
                <MegaphoneIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white">
                Digital Marketing
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-600 dark:text-slate-400">
              Drive traffic, increase conversions, and grow your business with comprehensive digital marketing solutions
            </p>
          </div>
        </div>
      </div>

      {/* Service Overview */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl mb-6">
                Who It's For
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Ideal for businesses and organizations in Juba, South Sudan, and beyond that want to increase their online visibility, attract more customers, and drive measurable results through strategic digital marketing campaigns.
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl mb-6 mt-12">
                What Problem It Solves
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Many businesses struggle with low website traffic, poor search engine rankings, and ineffective online advertising. Our digital marketing services help you reach the right audience, improve your online presence, and convert visitors into customers through proven strategies and tactics.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Key Features */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
                Key Features & Benefits
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                'SEO optimization to improve search rankings',
                'Google & Facebook Ads management',
                'Email marketing campaigns',
                'Content marketing strategy',
                'Analytics and performance tracking'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <CheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{feature}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Visual Demo Section */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Strategic digital marketing that drives real business results
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 sm:p-12 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <MegaphoneIcon className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Demo content placeholder - Add screenshots or examples here
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Example Use Cases */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
                Perfect For
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: 'Small & Medium Enterprises',
                  description: 'SMEs looking to expand their customer base and increase online sales through targeted marketing campaigns.'
                },
                {
                  title: 'NGOs & Non-Profits',
                  description: 'Organizations that need to raise awareness, attract donors, and engage supporters through digital channels.'
                },
                {
                  title: 'Startups & Growing Businesses',
                  description: 'New businesses that want to establish their brand and reach their target market quickly and effectively.'
                }
              ].map((useCase, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 sm:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                  Ready to Grow Your Business?
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                  Let's discuss how our digital marketing services can help you reach more customers and drive conversions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/contact')}
                    className="group inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Request a Quote
                    <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => router.push('/contact')}
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

    </div>
  );
};

export default DigitalMarketingDemo;
