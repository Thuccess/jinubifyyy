import type { Metadata } from 'next';
import DemosSlugRouter from '@/components/pages/demos/DemosSlugRouter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const label = decodeURIComponent(serviceSlug).replace(/-/g, ' ');
  return {
    title: `${label} | Demos | Jinubify`,
    description: 'Explore website demos or service demo galleries from Jinubify.',
  };
}

export default async function Page({ params }: { params: Promise<{ serviceSlug: string }> }) {
  const { serviceSlug } = await params;
  return <DemosSlugRouter slug={serviceSlug} />;
}
