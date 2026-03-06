import type { Metadata } from 'next';
import UserDashboardPage from '@/components/pages/UserDashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard | Jinubify',
  description: 'Your Jinubify user dashboard.',
};

export default function Page() {
  return <UserDashboardPage />;
}
