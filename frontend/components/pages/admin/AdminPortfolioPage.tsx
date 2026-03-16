import React, { useMemo, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';
import { ImageUrlWithUpload } from '../../ui/ImageUrlWithUpload';
import { useAdminPortfolio, usePortfolioMutations } from '../../../hooks/usePortfolio';

interface PortfolioFormState {
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  date: string;
  tags: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
}

const AdminPortfolioPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormState>({
    title: '',
    slug: '',
    description: '',
    content: '',
    imageUrl: '',
    date: '',
    tags: '',
    status: 'draft',
    isFeatured: false,
  });

  const { data, isLoading, isError } = useAdminPortfolio();
  const { createPortfolio, updatePortfolio, deletePortfolio, reorderPortfolio } = usePortfolioMutations();

  const items = (data?.data || []) as any[];

  const filteredItems = useMemo(
    () =>
      items.filter((item: any) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          item.title.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.tags || []).join(' ').toLowerCase().includes(q);
        const matchStatus = !statusFilter || item.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [items, searchQuery, statusFilter]
  );

  const sortedItems = useMemo(
    () => [...items].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [items]
  );

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const openCreateModal = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      imageUrl: '',
      date: '',
      tags: '',
      status: 'draft',
      isFeatured: false,
    });
    setSelectedId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      description: item.description || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      date: item.date ? new Date(item.date).toISOString().slice(0, 16) : '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      status: item.status || 'draft',
      isFeatured: !!item.isFeatured,
    });
    setSelectedId(item._id);
    setIsModalOpen(true);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = sortedItems.findIndex((i: any) => i._id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sortedItems.length) return;
    const list = [...sortedItems];
    [list[idx], list[target]] = [list[target], list[idx]];
    const order = list.map((i: any, index) => ({ id: i._id, order: index }));
    try {
      await reorderPortfolio.mutateAsync(order);
      showNotification('Order updated', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to reorder portfolio items', 'error');
    }
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title.trim(),
      slug: (formData.slug.trim() || generateSlug(formData.title)).toLowerCase(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl.trim(),
      date: formData.date ? new Date(formData.date).toISOString() : undefined,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: formData.status,
      isFeatured: formData.isFeatured,
    };

    if (!payload.title || !payload.slug || !payload.description) {
      showNotification('Title, slug, and description are required', 'error');
      return;
    }

    try {
      if (selectedId) {
        await updatePortfolio.mutateAsync({ id: selectedId, payload });
        showNotification('Portfolio item updated successfully', 'success');
      } else {
        await createPortfolio.mutateAsync(payload as any);
        showNotification('Portfolio item created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedId(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to save portfolio item', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deletePortfolio.mutateAsync(selectedId);
      showNotification('Portfolio item deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete portfolio item', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      <NotificationComponent />
      <AdminLayout
        title="Portfolio"
        subtitle="Manage portfolio projects shown on the public site"
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add portfolio item
          </button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search portfolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] min-w-[160px]"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto" />
              <p className="mt-4 text-text-muted">Loading portfolio...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-text-muted">Failed to load portfolio items. Please try again.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No portfolio items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item: any) => {
                      const sortedIdx = sortedItems.findIndex((i: any) => i._id === item._id);
                      const canMoveUp = sortedIdx > 0;
                      const canMoveDown = sortedIdx >= 0 && sortedIdx < sortedItems.length - 1;
                      return (
                        <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={!canMoveUp}
                                onClick={() => handleMove(item._id, 'up')}
                                className="inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface-card p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-default"
                              >
                                <ChevronUpIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={!canMoveDown}
                                onClick={() => handleMove(item._id, 'down')}
                                className="inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface-card p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-default"
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700">
                                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {item.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.isFeatured ? (
                              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                                Featured
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900/60 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.status === 'published' ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900/60 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1 rounded-md border border-border-subtle px-2 py-1 text-xs text-text-primary hover:bg-surface-muted"
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(item._id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="ml-2 inline-flex items-center gap-1 rounded-md border border-red-200 dark:border-red-800 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <DeleteIcon className="h-3.5 w-3.5" />
                              Delete
                            </button>
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
      </AdminLayout>

      <Modal
        isOpen={isModalOpen}
        title={selectedId ? 'Edit portfolio item' : 'Add portfolio item'}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="auto-generated from title if left empty"
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">Short description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted">Detailed content (optional)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted">Image</label>
              <ImageUrlWithUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted">Date</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              />
              <label className="mt-3 block text-xs font-medium text-text-muted">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as PortfolioFormState['status'] }))
                }
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
              />
              <label htmlFor="isFeatured" className="text-xs font-medium text-text-primary">
                Mark as featured
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted/90"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted shadow-sm hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))]"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete portfolio item"
        description="Are you sure you want to delete this portfolio item? You can no longer display it on the public site."
        confirmLabel="Delete"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default AdminPortfolioPage;

