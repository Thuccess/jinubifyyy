'use client';

import React from 'react';
import { MediaAssetItem, MediaCard } from './MediaCard';

interface MediaGridProps {
  items: MediaAssetItem[];
  onDelete: (id: string) => Promise<void> | void;
  onUpdateTags: (id: string, tags: string[]) => Promise<void> | void;
  onCopyUrl?: (url: string) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ items, onDelete, onUpdateTags, onCopyUrl }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-sm text-text-secondary">No media assets found. Upload an image to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <MediaCard
          key={item._id}
          item={item}
          onDelete={onDelete}
          onUpdateTags={onUpdateTags}
          onCopyUrl={onCopyUrl}
        />
      ))}
    </div>
  );
};

export default MediaGrid;

