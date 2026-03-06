import type { Metadata } from 'next';
import AboutPage from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About | Jinubify',
  description:
    'Learn about Jinubify—our story, values, and the team behind modern digital solutions for businesses.',
};

export default function Page() {
  return <AboutPage />;
}
