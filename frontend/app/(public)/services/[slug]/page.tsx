import type { Metadata } from 'next';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';

export const metadata: Metadata = {
  title: 'Service | Digital Solutions for Businesses Across East Africa',
  description:
    'Service details from Jinubify, providing website development, mobile apps, branding, digital marketing, printing, and cloud services for businesses across East Africa, including Uganda, Kenya, Tanzania, Rwanda, and South Sudan.',
};

export default function Page() {
  return <ServiceDetailPage />;
}
