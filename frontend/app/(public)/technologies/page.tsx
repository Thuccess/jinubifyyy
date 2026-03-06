import type { Metadata } from 'next';
import TechnologiesPage from '@/components/pages/TechnologiesPage';

export const metadata: Metadata = {
  title: 'Technologies | Jinubify',
  description: 'A modern, pragmatic technology stack—frontend, backend, automation, and brand systems.',
};

export default function Page() {
  return <TechnologiesPage />;
}
