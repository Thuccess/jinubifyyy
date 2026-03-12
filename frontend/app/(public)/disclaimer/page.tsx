import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Disclaimer | Jinubify',
  description: 'Legal disclaimer for Jinubify website and services.',
};

export default function Page() {
  return <CmsBasicPage slug="disclaimer" defaultTitle="Disclaimer" />;
}
