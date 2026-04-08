'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useIdentityAccess() {
  const { currentUser } = useAuth();
  const status = (currentUser?.status as string | undefined) || 'pending';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const canEditIdentity = !isRejected;
  return { status, isRejected, isPending, isApproved, canEditIdentity, currentUser };
}
