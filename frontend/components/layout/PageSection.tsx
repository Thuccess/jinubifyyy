import React from 'react';
import AnimatedSection from '../AnimatedSection';

interface PageSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

const PageSection: React.FC<PageSectionProps> = ({ id, children, className }) => {
  const basePadding =
    id === 'home'
      ? 'pt-2 sm:pt-8 lg:pt-14 pb-6 sm:pb-10 lg:pb-16'
      : 'py-8 sm:py-14 lg:py-24';

  return (
    <AnimatedSection>
      <section
        id={id}
        className={`${basePadding} ${className ?? ''}`}
      >
        {children}
      </section>
    </AnimatedSection>
  );
};

export default PageSection;


