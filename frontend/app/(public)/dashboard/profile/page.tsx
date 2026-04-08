import type { Metadata } from 'next';
import IdentityProfileEditor from '@/components/identity/IdentityProfileEditor';

export const metadata: Metadata = {
  title: 'My Profile | Jinubify',
  description: 'Edit your public profile and preview changes live.',
};

export default function Page() {
  return <IdentityProfileEditor />;
}
