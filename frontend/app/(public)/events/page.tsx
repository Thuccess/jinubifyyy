import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Events | Jinubify',
  description: 'Webinars and events from Jinubify on digital strategy and technology.',
};

export default function Page() {
  return <CmsBasicPage slug="events" />;
}
