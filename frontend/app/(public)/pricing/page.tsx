import type { Metadata } from 'next';
import PricingPage from '@/components/pages/PricingPage';

export const metadata: Metadata = {
  title: 'Pricing | Jinubify',
  description: 'Flexible pricing packages for startups, SMEs, and growing organizations.',
};

export default function Page() {
  return <PricingPage />;
}
