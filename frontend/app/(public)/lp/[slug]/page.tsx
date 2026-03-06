import type { Metadata } from 'next';
import CmsBasicPage from '@/components/pages/CmsBasicPage';

export const metadata: Metadata = {
  title: 'Landing Page | Jinubify',
  description: 'Jinubify landing page.',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsBasicPage slug={slug} defaultTitle="Landing Page" />;
}
