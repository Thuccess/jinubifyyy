import type { Metadata } from 'next';
import ContactPage from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact | Jinubify',
  description: 'Get in touch with Jinubify. We’d love to hear about your project and how we can help.',
};

export default function Page() {
  return <ContactPage />;
}
