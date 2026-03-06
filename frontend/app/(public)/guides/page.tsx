import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Guides | Jinubify',
  description: 'Practical guides for modern teams on strategy, design, and delivery.',
};

export default function Page() {
  return <CmsBasicPage slug="guides" />;
}
