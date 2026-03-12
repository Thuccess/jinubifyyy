import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Refund Policy | Jinubify',
  description: 'Jinubify refund and cancellation policy for services and orders.',
};

export default function Page() {
  return <CmsBasicPage slug="refund-policy" defaultTitle="Refund Policy" />;
}
