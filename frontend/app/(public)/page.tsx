import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import StructuredData from '@/components/seo/StructuredData';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Jinubify | Digital Solutions for Businesses Across East Africa',
  description:
    'Jinubify provides website development, mobile apps, branding, digital marketing, printing, and cloud services for businesses across East Africa, including Uganda, Kenya, Tanzania, Rwanda, and South Sudan.',
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
