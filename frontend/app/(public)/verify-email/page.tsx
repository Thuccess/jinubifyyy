import type { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyEmailPage from '@/components/pages/VerifyEmailPage';
import PageSkeleton from '@/components/skeletons/PageSkeleton';

export const metadata: Metadata = {
  title: 'Verify Email | Jinubify',
  description: 'Verify your Jinubify account email address.',
};

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton compact />}>
      <VerifyEmailPage />
    </Suspense>
  );
}

