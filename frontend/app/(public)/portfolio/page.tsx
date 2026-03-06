import type { Metadata } from 'next';
import PortfolioPage from '@/components/pages/PortfolioPage';

export const metadata: Metadata = {
  title: 'Portfolio | Jinubify',
  description: 'A showcase of our work—web development, branding, and digital marketing projects.',
};

export default function Page() {
  return <PortfolioPage />;
}
