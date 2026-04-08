import type { Metadata } from 'next';
import IdentitySocialLinks from '@/components/identity/IdentitySocialLinks';

export const metadata: Metadata = {
  title: 'Social Links | Jinubify',
  description: 'Manage social links on your public profile.',
};

export default function Page() {
  return <IdentitySocialLinks />;
}
