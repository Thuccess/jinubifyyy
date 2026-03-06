import type { Metadata } from 'next';
import InvestmentPage from '@/components/pages/InvestmentPage';

export const metadata: Metadata = {
  title: 'Investment | Jinubify',
  description: 'Investment and partnership opportunities with Jinubify.',
};

export default function Page() {
  return <InvestmentPage />;
}
