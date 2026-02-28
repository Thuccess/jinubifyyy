import React from 'react';
import AnimatedSection from '../AnimatedSection';

interface PageSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

const PageSection: React.FC<PageSectionProps> = ({ id, children, className }) => {
  return (
    <AnimatedSection>
      <section
        id={id}
        className={`py-12 sm:py-16 lg:py-24 ${className ?? ''}`}
      >
        {children}
      </section>
    </AnimatedSection>
  );
};

export default PageSection;


