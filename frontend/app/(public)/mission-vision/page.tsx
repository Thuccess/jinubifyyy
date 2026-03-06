import type { Metadata } from 'next';
import MissionVisionPage from '@/components/pages/MissionVisionPage';

export const metadata: Metadata = {
  title: 'Mission & Vision | Jinubify',
  description: 'Jinubify mission, vision, and values.',
};

export default function Page() {
  return <MissionVisionPage />;
}
