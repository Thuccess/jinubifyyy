'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const canAccessAdmin = currentUser && ['editor', 'admin', 'super_admin'].includes(currentUser.role);
    if (!currentUser || !canAccessAdmin) {
      const next = pathname ? `/admin/login?next=${encodeURIComponent(pathname)}` : '/admin/login';
      router.replace(next);
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent"
            aria-hidden
          />
          <p className="text-sm text-text-secondary">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !['editor', 'admin', 'super_admin'].includes(currentUser.role)) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
