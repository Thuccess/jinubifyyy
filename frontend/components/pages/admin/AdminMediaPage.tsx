'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { adminAPI } from '../../../services/api';
import { useNotification } from '../../admin/useNotification';
import MediaGrid from '../../admin/media/MediaGrid';
import type { MediaAssetItem } from '../../admin/media/MediaCard';
import MediaFilters from '../../admin/media/MediaFilters';
import MediaUploader from '../../admin/media/MediaUploader';
import { AdminPagination } from '../../admin/AdminPagination';

const PAGE_SIZE = 24;

const AdminMediaPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<'createdAt-asc' | 'createdAt-desc'>('createdAt-desc');

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getMedia({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        tag: tag.trim() || undefined,
        sort,
      });
      setItems(data.media as MediaAssetItem[]);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to load media';
      showNotification(message, 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, tag, sort, showNotification]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteMedia(id);
      showNotification('Media deleted', 'success');
      // Refresh current page
      loadMedia();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete media';
      showNotification(message, 'error');
    }
  };

  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      await adminAPI.updateMediaTags(id, tags);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update tags';
      showNotification(message, 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => showNotification('URL copied to clipboard', 'success'))
        .catch(() => showNotification('Failed to copy URL', 'error'));
    }
  };

  const handleFiltersApply = () => {
    setPage(1);
    loadMedia();
  };

  return (
    <AdminLayout title="Media Library" subtitle="Manage uploaded images across the site">
      <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
        <MediaFilters
          search={search}
          onSearchChange={setSearch}
          tag={tag}
          onTagChange={setTag}
          sort={sort}
          onSortChange={setSort}
          onApply={handleFiltersApply}
        />
        <div className="px-4 py-4 border-b border-border-subtle bg-[color:var(--surface-card)]/60">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Upload</h2>
          <p className="text-xs text-text-secondary mb-3">
            Upload new images once and reuse them across blog posts, services, and other content.
          </p>
          <MediaUploader onUploadComplete={() => loadMedia()} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
            <p className="mt-4 text-sm text-text-muted">Loading media…</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-4">
              <MediaGrid
                items={items}
                onDelete={handleDelete}
                onUpdateTags={handleUpdateTags}
                onCopyUrl={handleCopyUrl}
              />
            </div>
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </div>
      <NotificationComponent />
    </AdminLayout>
  );
};

export default AdminMediaPage;

