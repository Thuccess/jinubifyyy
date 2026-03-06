import type { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services | Jinubify',
  description:
    'Explore digital marketing, branding, web development, and design services offered by Jinubify.',
};

export default function Page() {
  return <ServicesPage />;
}
