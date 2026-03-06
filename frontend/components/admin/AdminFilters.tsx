'use client';

import React from 'react';

interface AdminFiltersProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({ children, className = '' }) => (
  <div
    className={`flex flex-wrap items-center gap-3 p-4 border-b border-border-subtle bg-[color:var(--surface-muted)]/30 ${className}`}
  >
    {children}
  </div>
);
