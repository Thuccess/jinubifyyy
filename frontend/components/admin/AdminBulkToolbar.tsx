'use client';

import React from 'react';

interface AdminBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AdminBulkToolbar: React.FC<AdminBulkToolbarProps> = ({
  selectedCount,
  onClearSelection,
  children,
  className = '',
}) => {
  if (selectedCount === 0) return null;
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-subtle bg-brand-soft/50 rounded-t-xl ${className}`}
    >
      <span className="text-sm font-medium text-text-primary">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClearSelection}
        className="text-sm text-text-secondary hover:text-text-primary"
      >
        Clear selection
      </button>
    </div>
  );
};
