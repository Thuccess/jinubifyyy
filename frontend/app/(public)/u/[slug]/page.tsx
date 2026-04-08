import { Suspense } from 'react';
import ProfileCardPage from '@/components/pages/ProfileCardPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-text-muted text-sm">Loading…</div>
      }
    >
      <ProfileCardPage />
    </Suspense>
  );
}
