import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | Jinubify',
  description: 'How Jinubify uses cookies and similar technologies.',
};

export default function Page() {
  return <CmsBasicPage slug="cookie-policy" defaultTitle="Cookie Policy" />;
}
