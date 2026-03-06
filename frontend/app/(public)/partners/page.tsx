import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Partners | Jinubify',
  description: 'Jinubify partners and ecosystem.',
};

export default function Page() {
  return <CmsBasicPage slug="partners" />;
}
