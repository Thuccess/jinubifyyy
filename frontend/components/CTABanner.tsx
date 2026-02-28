import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon } from './icons/Icons';
import AnimatedSection from './AnimatedSection';

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonPath?: string;
}

const CTABanner: React.FC<CTABannerProps> = ({
  title = "Ready to start your project?",
  subtitle = "Let's work together to bring your ideas to life. Contact us today for a free consultation.",
  primaryButtonText = "Contact Us",
  primaryButtonPath = "/contact",
}) => {
  const navigate = useNavigate();

  return (
    <AnimatedSection>
      <div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="relative bg-brand-primary rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl ring-2 ring-brand-ring">
             <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-[color:var(--text-inverted)]/10 rounded-full animate-spin-slow blur-xl" aria-hidden="true"></div>
             <div className="absolute -top-12 -left-16 w-40 h-40 bg-[color:var(--text-inverted)]/10 rounded-full animate-spin-slow blur-xl" style={{ animationDirection: 'reverse' }} aria-hidden="true"></div>
             <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--text-inverted)]/5 to-transparent" aria-hidden="true"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-extrabold text-text-inverted tracking-tight drop-shadow-lg">{title}</h2>
              <p className="mt-2 text-text-inverted/80 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate(primaryButtonPath)}
                  className="group inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-brand-primary bg-surface-card rounded-xl shadow-xl hover:bg-surface-muted/90 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-2xl ring-2 ring-[color:var(--accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-[color:var(--accent-primary)]"
                >
                  {primaryButtonText} <PaperAirplaneIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default CTABanner;