import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Order | Jinubify',
  description: 'Place an order with Jinubify.',
};

export default function Page() {
  return <CmsBasicPage slug="order" />;
}
