import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoginPage from '@/components/pages/AdminLoginPage';

export const metadata: Metadata = {
  title: 'Admin Login | Jinubify',
  description: 'Sign in to the Jinubify admin dashboard.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary" /></div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
