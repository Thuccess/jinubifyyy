import type { Metadata } from 'next';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';

export const metadata: Metadata = {
  title: 'Service | Jinubify',
  description: 'Service details and offerings from Jinubify.',
};

export default function Page() {
  return <ServiceDetailPage />;
}
