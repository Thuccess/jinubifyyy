import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Home | Jinubify',
  description:
    'Jinubify delivers modern digital solutions—web development, branding, and digital marketing—to help businesses grow.',
};

export default function Page() {
  return <HomePage />;
}
