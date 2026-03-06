import type { Metadata } from 'next';
import TermsOfServicePage from '@/components/pages/TermsOfServicePage';

export const metadata: Metadata = {
  title: 'Terms of Service | Jinubify',
  description: 'Terms and conditions for using Jinubify services and website.',
};

export default function Page() {
  return <TermsOfServicePage />;
}
