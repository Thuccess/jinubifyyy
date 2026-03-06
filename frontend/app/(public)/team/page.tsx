import type { Metadata } from 'next';
import TeamPage from '@/components/pages/TeamPage';

export const metadata: Metadata = {
  title: 'Team | Jinubify',
  description: 'Meet the people behind Jinubify—innovators and problem-solvers building your digital success.',
};

export default function Page() {
  return <TeamPage />;
}
