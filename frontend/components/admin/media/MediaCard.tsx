'use client';

import React, { useState } from 'react';
import Image from '@/components/NextImage';
import { getImageUrl } from '../../../utils/getImageUrl';
import { TrashIcon } from '../../icons/Icons';

export interface MediaAssetItem {
  _id: string;
  filename: string;
  url: string;
  tags: string[];
  usedBy: Array<{ entityType: string; entityId: string }>;
  usageCount: number;
  createdAt: string;
}

interface MediaCardProps {
  item: MediaAssetItem;
  onDelete: (id: string) => Promise<void> | void;
  onUpdateTags: (id: string, tags: string[]) => Promise<void> | void;
  onCopyUrl?: (url: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onDelete, onUpdateTags, onCopyUrl }) => {
  const [localTags, setLocalTags] = useState<string[]>(item.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [savingTags, setSavingTags] = useState(false);
  const usageCount = item.usageCount ?? (item.usedBy ? item.usedBy.length : 0);

  const handleAddTag = async () => {
    const value = tagInput.trim();
    if (!value) return;
    const tags = Array.from(new Set([...localTags, value]));
    setLocalTags(tags);
    setTagInput('');
    setSavingTags(true);
    try {
      await onUpdateTags(item._id, tags);
    } finally {
      setSavingTags(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    const tags = localTags.filter((t) => t !== tag);
    setLocalTags(tags);
    setSavingTags(true);
    try {
      await onUpdateTags(item._id, tags);
    } finally {
      setSavingTags(false);
    }
  };

  const handleCopy = () => {
    if (onCopyUrl) {
      onCopyUrl(item.url);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url).catch(() => undefined);
    }
  };

  const formattedDate = (() => {
    try {
      return new Date(item.createdAt).toLocaleString();
    } catch {
      return item.createdAt;
    }
  })();

  const normalizedUrl = getImageUrl(item.url || item.filename);

  return (
    <div className="flex flex-col rounded-xl border border-border-card bg-[color:var(--surface-card)] overflow-hidden shadow-card">
      <div className="relative aspect-[4/3] bg-[color:var(--surface-muted)]">
        {normalizedUrl ? (
          <Image
            src={normalizedUrl}
            alt={item.filename}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 240px, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs">
            No preview
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate" title={item.filename}>
              {item.filename}
            </p>
            <p className="text-xs text-text-muted truncate">{formattedDate}</p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Delete media"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Used in{' '}
            <span className="font-semibold text-text-primary">
              {usageCount}
            </span>{' '}
            {usageCount === 1 ? 'place' : 'places'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] font-medium text-brand-primary hover:opacity-90"
          >
            Copy URL
          </button>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {localTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color:var(--accent-soft)] text-[11px] text-text-primary"
            >
              <span>#{tag}</span>
              <span className="text-xs">×</span>
            </button>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-2 py-1 text-xs rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-ring)]"
          />
          <button
            type="button"
            disabled={savingTags || !tagInput.trim()}
            onClick={handleAddTag}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;

