import type { Metadata } from 'next';
import DisclaimerPage from '@/components/pages/DisclaimerPage';

export const metadata: Metadata = {
  title: 'Disclaimer | Jinubify',
  description: 'Legal disclaimer for Jinubify website and services.',
};

export default function Page() {
  return <DisclaimerPage />;
}
