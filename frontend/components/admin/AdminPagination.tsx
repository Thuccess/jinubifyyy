'use client';

import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  className = '',
}) => {
  if (totalPages <= 1) return null;
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 border-t border-border-subtle bg-[color:var(--surface-muted)]/30 ${className}`}
    >
      <p className="text-sm text-text-muted">
        Page <span className="font-medium text-text-primary">{currentPage}</span> of{' '}
        <span className="font-medium text-text-primary">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};
