import type { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services | Website Development & Digital Marketing in East Africa',
  description:
    'Explore Jinubify services including website development, mobile app development, software development, digital marketing, graphic design, social media management, cloud hosting, and printing for businesses across East Africa, including Uganda, Kenya, Tanzania, Rwanda, and South Sudan.',
};

export default function Page() {
  return <ServicesPage />;
}
