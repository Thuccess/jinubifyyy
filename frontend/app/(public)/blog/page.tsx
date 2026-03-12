import type { Metadata } from 'next';
import BlogPage from '@/components/pages/BlogPage';

export const metadata: Metadata = {
  title: 'Blog | Digital Growth Tips for South Sudanese Businesses',
  description:
    'Articles from Jinubify on website development, digital marketing, branding, and technology for South Sudanese entrepreneurs and organizations across East Africa.',
};

export default function Page() {
  return <BlogPage />;
}
