import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ serviceSlug: string; demoSlug: string }>;
}) {
  const { serviceSlug } = await params;
  redirect(`/demos/${serviceSlug}`);
}
