import type { Metadata } from 'next';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';

export const metadata: Metadata = {
  title: 'Service | Digital Solutions for South Sudanese Businesses',
  description:
    'Service details from Jinubify, providing website development, mobile apps, branding, digital marketing, printing, and cloud services for South Sudanese businesses across East Africa.',
};

export default function Page() {
  return <ServiceDetailPage />;
}
