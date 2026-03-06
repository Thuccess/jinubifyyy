import type { Metadata } from 'next';
import IndustriesPage from '@/components/pages/IndustriesPage';

export const metadata: Metadata = {
  title: 'Industries | Jinubify',
  description: 'Industries we serve—e-commerce, professional services, education, nonprofits, startups, and SMEs.',
};

export default function Page() {
  return <IndustriesPage />;
}
