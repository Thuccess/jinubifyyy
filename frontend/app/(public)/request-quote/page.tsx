import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Request a Quote | Jinubify',
  description: 'Request a custom quote from Jinubify.',
};

export default function Page() {
  return <CmsBasicPage slug="request-quote" defaultTitle="Request a Quote" />;
}
