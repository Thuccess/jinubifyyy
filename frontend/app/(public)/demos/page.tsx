import type { Metadata } from 'next';
import DemosLandingPage from '@/components/pages/DemosLandingPage';

export const metadata: Metadata = {
  title: 'Demos | Jinubify',
  description: 'Browse website showcases and service demo galleries from Jinubify.',
};

export default function Page() {
  return <DemosLandingPage />;
}
