import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Thank You | Jinubify',
  description: 'Thank you for your submission.',
};

export default function Page() {
  return <CmsBasicPage slug="thank-you" defaultTitle="Thank You" />;
}
