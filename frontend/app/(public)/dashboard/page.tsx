import type { Metadata } from 'next';
import IdentityOverview from '@/components/identity/IdentityOverview';

export const metadata: Metadata = {
  title: 'Overview | Jinubify',
  description: 'Your public identity overview and quick actions.',
};

export default function Page() {
  return <IdentityOverview />;
}
