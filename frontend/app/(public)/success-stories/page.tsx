import type { Metadata } from 'next';
import SuccessStoriesPage from '@/components/pages/SuccessStoriesPage';

export const metadata: Metadata = {
  title: 'Success Stories | Jinubify',
  description: 'Work that moves the needle—case studies and outcomes from Jinubify engagements.',
};

export default function Page() {
  return <SuccessStoriesPage />;
}
