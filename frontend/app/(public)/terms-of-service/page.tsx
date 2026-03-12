import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Terms of Service | Jinubify',
  description: 'Terms and conditions for using Jinubify services and website.',
};

export default function Page() {
  return <CmsBasicPage slug="terms-of-service" defaultTitle="Terms of Service" />;
}
