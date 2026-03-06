import type { Metadata } from 'next';
import CareerPage from '@/components/pages/CareerPage';

export const metadata: Metadata = {
  title: 'Career | Jinubify',
  description: 'Join the Jinubify team. Explore open positions and apply.',
};

export default function Page() {
  return <CareerPage />;
}
