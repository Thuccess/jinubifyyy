import React from 'react';
import { ArrowRightIcon, ChatBubbleLeftRightIcon } from '../../icons/Icons';

interface DefaultVisualPlaceholderProps {
  slug: string;
  demoUrl?: string;
  serviceName: string;
}

const DefaultVisualPlaceholder: React.FC<DefaultVisualPlaceholderProps> = ({
  demoUrl,
  serviceName,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="surface rounded-2xl p-8 sm:p-12 border border-border-subtle min-h-[280px] flex items-center justify-center">
        {demoUrl ? (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-text-inverted bg-brand-primary hover:brightness-110 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Open Live Demo <ArrowRightIcon className="h-5 w-5" />
          </a>
        ) : (
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-text-muted mx-auto mb-4" aria-hidden="true" />
            <p className="text-text-secondary text-sm max-w-md">
              Sample demos, screenshots, or past work for {serviceName} can be added here. Contact us for a custom walkthrough.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultVisualPlaceholder;
