'use client';

import React from 'react';
import { SearchIcon, FilterIcon } from '../../icons/Icons';

interface MediaFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  sort: 'createdAt-asc' | 'createdAt-desc';
  onSortChange: (value: 'createdAt-asc' | 'createdAt-desc') => void;
  onApply?: () => void;
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  search,
  onSearchChange,
  tag,
  onTagChange,
  sort,
  onSortChange,
  onApply,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border-subtle bg-[color:var(--surface-muted)]/30">
      <div className="relative flex-1 min-w-[180px]">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="search"
          placeholder="Search by filename"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Filter by tag"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
        />
        <div className="flex items-center gap-1">
          <FilterIcon className="h-4 w-4 text-text-muted" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as 'createdAt-asc' | 'createdAt-desc')}
            className="px-2.5 py-2 text-xs rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
          </select>
        </div>
      </div>
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90"
        >
          Apply
        </button>
      )}
    </div>
  );
};

export default MediaFilters;

