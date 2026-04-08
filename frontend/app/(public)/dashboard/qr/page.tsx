import type { Metadata } from 'next';
import IdentityQrPage from '@/components/identity/IdentityQrPage';

export const metadata: Metadata = {
  title: 'QR Code | Jinubify',
  description: 'Your profile QR code — share and download.',
};

export default function Page() {
  return <IdentityQrPage />;
}
