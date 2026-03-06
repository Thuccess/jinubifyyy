import type { Metadata } from 'next';
import BlogPage from '@/components/pages/BlogPage';

export const metadata: Metadata = {
  title: 'Blog | Jinubify',
  description: 'Insights, tips, and news from the Jinubify team on digital strategy and technology.',
};

export default function Page() {
  return <BlogPage />;
}
