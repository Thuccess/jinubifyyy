import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Jinubify',
  description: 'How Jinubify collects, uses, and protects your personal information.',
};

export default function Page() {
  return <CmsBasicPage slug="privacy-policy" defaultTitle="Privacy Policy" />;
}
