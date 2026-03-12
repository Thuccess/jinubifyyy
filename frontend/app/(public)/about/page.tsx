import type { Metadata } from 'next';
import AboutPage from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About | Jinubify',
  description:
    'Jinubify is a digital solutions company helping South Sudanese entrepreneurs, startups, NGOs, and organizations across East Africa grow through modern technology, branding, marketing, and practical business tools.',
};

export default function Page() {
  return <AboutPage />;
}
