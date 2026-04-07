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
      : 'py-10 sm:py-16 lg:py-[5.5rem]';

  return (
    <AnimatedSection>
      <section
        id={id}
        className={`scroll-mt-20 sm:scroll-mt-24 ${basePadding} ${className ?? ''}`}
      >
        {children}
      </section>
    </AnimatedSection>
  );
};

export default PageSection;


