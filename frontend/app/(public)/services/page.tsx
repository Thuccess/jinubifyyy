import type { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services | Website Development & Digital Marketing in South Sudan',
  description:
    'Explore Jinubify services including website development, mobile app development, software development, digital marketing, graphic design, social media management, cloud hosting, and printing for businesses in South Sudan, Uganda, and Kenya.',
};

export default function Page() {
  return <ServicesPage />;
}
