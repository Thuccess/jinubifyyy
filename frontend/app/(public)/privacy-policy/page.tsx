import type { Metadata } from 'next';
import PrivacyPolicyPage from '@/components/pages/PrivacyPolicyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Jinubify',
  description: 'How Jinubify collects, uses, and protects your personal information.',
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
