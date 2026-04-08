import type { Metadata } from 'next';
import IdentityAnalytics from '@/components/identity/IdentityAnalytics';

export const metadata: Metadata = {
  title: 'Analytics | Jinubify',
  description: 'Profile views, scans, and link performance.',
};

export default function Page() {
  return <IdentityAnalytics />;
}
