import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Newsletter | Jinubify',
  description: 'Subscribe to the Jinubify newsletter.',
};

export default function Page() {
  return <CmsBasicPage slug="newsletter" />;
}
