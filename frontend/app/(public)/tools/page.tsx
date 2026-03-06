import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Tools | Jinubify',
  description: 'Free tools and resources from Jinubify.',
};

export default function Page() {
  return <CmsBasicPage slug="tools" />;
}
