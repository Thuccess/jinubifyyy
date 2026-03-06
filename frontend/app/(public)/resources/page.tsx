import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Resources | Jinubify',
  description: 'Tools, templates, and playbooks to help you move from idea to execution.',
};

export default function Page() {
  return <CmsBasicPage slug="resources" />;
}
