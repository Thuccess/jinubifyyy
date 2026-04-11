'use client';

import React, { useMemo, useState } from 'react';
import Modal from '@/components/admin/Modal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import DemoForm from '@/components/admin/DemoForm';
import { useNotification } from '@/components/admin/useNotification';
import { useWebsiteDemosAdmin, useDemoMutations } from '@/hooks/useServices';
import type { WebsiteDemo } from '@/types/websiteDemo';
import { normalizeImageUrl } from '@/utils/image';
import { EditIcon, DeleteIcon, SearchIcon, StarIcon } from '@/components/icons/Icons';

const AdminWebsiteDemosPanel: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WebsiteDemo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useWebsiteDemosAdmin();
  const { createDemo, updateDemo, deleteDemo, updateDemoFeatured } = useDemoMutations();
  const [saving, setSaving] = useState(false);

  const rows = (data?.data || []) as WebsiteDemo[];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.slug || '').toLowerCase().includes(q) ||
        (d.category || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (d: WebsiteDemo) => {
    setEditing(d);
    setModalOpen(true);
  };

  const handleFormSubmit = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing?._id) {
        await updateDemo.mutateAsync({ id: editing._id, data: payload });
        showNotification('Demo updated', 'success');
      } else {
        await createDemo.mutateAsync(payload);
        showNotification('Demo created', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      await refetch();
    } catch (e: any) {
      showNotification(e?.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDemo.mutateAsync(deleteId);
      showNotification('Demo deleted', 'success');
      await refetch();
    } catch (e: any) {
      showNotification(e?.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleFeatured = async (d: WebsiteDemo) => {
    try {
      await updateDemoFeatured.mutateAsync({ id: d._id, isFeatured: !d.isFeatured });
      showNotification('Featured updated', 'success');
      await refetch();
    } catch (e: any) {
      showNotification(e?.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search website demos…"
            className="w-full rounded-lg border border-border-subtle bg-surface-card py-2 pl-10 pr-3 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90"
        >
          New website demo
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-card bg-surface-card shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted">Loading…</div>
        ) : isError ? (
          <div className="p-12 text-center text-text-muted">Failed to load.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-surface-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Thumb
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                      No website demos yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    const thumb = normalizeImageUrl(d.thumbnail || '') || d.thumbnail;
                    return (
                      <tr key={d._id} className="hover:bg-surface-muted/40">
                        <td className="px-4 py-3">
                          <div className="h-14 w-20 overflow-hidden rounded-lg border border-border-subtle bg-surface-muted">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary">{d.title}</div>
                          <div className="text-xs text-text-muted">/{d.slug}</div>
                          <div className="mt-1 text-xs text-text-muted">
                            {typeof d.views === 'number' ? `${d.views} views` : ''}
                            {typeof d.clicks === 'number' ? ` · ${d.clicks} clicks` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{d.category || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                                d.visibility === 'hidden'
                                  ? 'bg-surface-muted text-text-secondary'
                                  : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                              }`}
                            >
                              {d.visibility === 'hidden' ? 'Hidden' : 'Listed'}
                            </span>
                            <span
                              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                                d.isActive
                                  ? 'bg-blue-500/10 text-blue-800 dark:text-blue-300'
                                  : 'bg-surface-muted text-text-secondary'
                              }`}
                            >
                              {d.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggleFeatured(d)}
                              className={`rounded-lg p-2 transition ${
                                d.isFeatured
                                  ? 'text-amber-600 bg-amber-500/10'
                                  : 'text-text-muted hover:bg-surface-muted'
                              }`}
                              title="Toggle featured"
                              aria-label="Toggle featured"
                            >
                              <StarIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(d)}
                              className="rounded-lg p-2 text-blue-600 hover:bg-surface-muted dark:text-blue-400"
                              aria-label="Edit"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(d._id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-500/10"
                              aria-label="Delete"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit website demo' : 'New website demo'}
        size="xl"
      >
        <DemoForm
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          loading={saving || createDemo.isPending || updateDemo.isPending}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete demo"
        message="Remove this website demo? It will be hidden from the catalog."
        variant="danger"
      />

      <NotificationComponent />
    </>
  );
};

export default AdminWebsiteDemosPanel;
