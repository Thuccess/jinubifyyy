import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Book a Consultation | Jinubify',
  description: 'Schedule a consultation with the Jinubify team.',
};

export default function Page() {
  return <CmsBasicPage slug="book-consultation" defaultTitle="Book a Consultation" />;
}
