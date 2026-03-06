import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Press & Media | Jinubify',
  description: 'Press and media resources from Jinubify.',
};

export default function Page() {
  return <CmsBasicPage slug="press-media" />;
}
