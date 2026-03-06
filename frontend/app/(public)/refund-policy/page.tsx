import type { Metadata } from 'next';
import RefundPolicyPage from '@/components/pages/RefundPolicyPage';

export const metadata: Metadata = {
  title: 'Refund Policy | Jinubify',
  description: 'Jinubify refund and cancellation policy for services and orders.',
};

export default function Page() {
  return <RefundPolicyPage />;
}
