import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Free Audit | Jinubify',
  description: 'Request a free audit from Jinubify.',
};

export default function Page() {
  return <CmsBasicPage slug="free-audit" defaultTitle="Free Audit" />;
}
