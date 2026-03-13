import type { Metadata } from 'next';
import BlogPage from '@/components/pages/BlogPage';

export const metadata: Metadata = {
  title: 'Blog | Digital Growth Tips for Businesses Across East Africa',
  description:
    'Articles from Jinubify on website development, digital marketing, branding, and technology for entrepreneurs and organizations across East Africa, including Uganda, Kenya, Tanzania, Rwanda, and South Sudan.',
};

export default function Page() {
  return <BlogPage />;
}
