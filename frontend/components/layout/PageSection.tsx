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
      ? 'pt-4 sm:pt-10 lg:pt-16 pb-10 sm:pb-16 lg:pb-24'
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


