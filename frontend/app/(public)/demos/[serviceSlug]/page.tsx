import type { Metadata } from 'next';
import DemoGalleryPage from '@/components/pages/DemoGalleryPage';

export const metadata: Metadata = {
  title: 'Service Demos | Jinubify',
  description: 'Explore demos and case studies for this service.',
};

export default function Page() {
  return <DemoGalleryPage />;
}
