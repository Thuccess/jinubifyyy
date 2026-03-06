import type { Metadata } from 'next';
import DemosLandingPage from '@/components/pages/DemosLandingPage';

export const metadata: Metadata = {
  title: 'Demos | Jinubify',
  description: 'Explore service demos and case studies from Jinubify.',
};

export default function Page() {
  return <DemosLandingPage />;
}
