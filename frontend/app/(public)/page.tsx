import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import StructuredData from '@/components/seo/StructuredData';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Home | Jinubify',
  description:
    'Jinubify delivers modern digital solutions—web development, branding, and digital marketing—to help businesses grow.',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: siteConfig.logo,
  description: siteConfig.description,
  ...(siteConfig.sameAs.length > 0 && { sameAs: siteConfig.sameAs }),
};

export default function Page() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <HomePage />
    </>
  );
}
