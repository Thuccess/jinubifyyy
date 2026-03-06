import type { Metadata } from 'next';
import CompanyProfilePage from '@/components/pages/CompanyProfilePage';

export const metadata: Metadata = {
  title: 'Company Profile | Jinubify',
  description: 'Jinubify company profile and overview.',
};

export default function Page() {
  return <CompanyProfilePage />;
}
