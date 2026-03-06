import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'FAQ | Jinubify',
  description: 'Frequently asked questions about Jinubify services and processes.',
};

export default function Page() {
  return <CmsBasicPage slug="faq" />;
}
