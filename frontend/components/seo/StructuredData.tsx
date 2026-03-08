import React from 'react';

export interface StructuredDataProps {
  /** One or more JSON-LD schema objects. Will be stringified and injected as script. */
  data: object | object[];
}

/**
 * Injects JSON-LD structured data for SEO (Organization, Article, Service, etc.).
 * Renders a script tag that search engines can read.
 */
const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  const json = Array.isArray(data) ? data : [data];
  const scriptContent = JSON.stringify(json.length === 1 ? json[0] : json);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
};

export default StructuredData;
