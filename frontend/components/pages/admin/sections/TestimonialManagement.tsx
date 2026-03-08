import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import type { TestimonialItem } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import Modal from '../../../admin/Modal';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import { ImageUrlWithUpload } from '../../../ui/ImageUrlWithUpload';
import { PlusIcon, EditIcon, DeleteIcon, StarIcon } from '../../../icons/Icons';
import Icon from '../../../ui/Icon';

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-[color:var(--border-accent)]';
const labelBase = 'block text-sm font-medium text-text-primary mb-1.5';

interface TestimonialDoc extends TestimonialItem {
  _id: string;
  order?: number;
  isActive?: boolean;
}

const TestimonialManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [list, setList] = useState<TestimonialDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<TestimonialDoc | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    avatar: '',
    text: '',
    stars: 5,
    order: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTestimonials();
      setList((res.testimonials as TestimonialDoc[]) || []);
    } catch (err) {
      console.error('Fetch testimonials error:', err);
      showNotification('Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setFormData({
      name: '',
      title: '',
      avatar: '',
      text: '',
      stars: 5,
      order: list.length,
      isActive: true,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (item: TestimonialDoc) => {
    setSelected(item);
    setFormData({
      name: item.name,
      title: item.title,
      avatar: item.avatar || '',
      text: item.text,
      stars: item.stars ?? 5,
      order: item.order ?? 0,
      isActive: item.isActive !== false,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (item: TestimonialDoc) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected?._id) return;
    try {
      await adminAPI.deleteTestimonial(selected._id);
      showNotification('Testimonial deleted', 'success');
      fetchList();
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      showNotification((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.title.trim()) errors.title = 'Title/position is required';
    if (!formData.text.trim()) errors.text = 'Testimonial text is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        avatar: formData.avatar.trim() || undefined,
        text: formData.text.trim(),
        stars: formData.stars,
        order: formData.order,
        isActive: formData.isActive,
      };
      if (selected) {
        await adminAPI.updateTestimonial(selected._id, payload);
        showNotification('Testimonial updated', 'success');
      } else {
        await adminAPI.createTestimonial(payload);
        showNotification('Testimonial created', 'success');
      }
      setIsFormOpen(false);
      fetchList();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      showNotification(data?.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Home page</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Testimonials</h1>
            <p className="mt-1 text-sm text-text-secondary max-w-xl">
              Manage client testimonials shown in the testimonials section on the home page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 shrink-0 px-5 py-2.5 rounded-xl bg-text-primary text-text-inverted font-medium text-sm shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent-ring)] transition-opacity"
          >
            <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
            Add testimonial
          </button>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
              <p className="mt-4 text-sm text-text-muted">Loading…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--surface-muted)] text-text-muted">
                <StarIcon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">No testimonials yet</h3>
              <p className="mt-1 text-sm text-text-secondary text-center max-w-sm">
                Add testimonials to display on the home page.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text-primary text-text-inverted text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent-ring)]"
              >
                <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                Add testimonial
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle bg-[color:var(--surface-muted)]/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Person</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Stars</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {list.map((item) => (
                    <tr key={item._id} className="hover:bg-[color:var(--surface-muted)]/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name || 'Testimonial author'}
                              className="h-10 w-10 shrink-0 rounded-full object-cover bg-[color:var(--surface-muted)]"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center text-text-muted text-sm font-medium">
                              {(item.name || '?').charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-text-primary">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary hidden sm:table-cell">{item.title}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: item.stars || 5 }).map((_, i) => (
                            <Icon key={i} icon={StarIcon} size="sm" tone="brand" />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            item.isActive !== false ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'bg-text-muted/15 text-text-muted'
                          }`}
                        >
                          {item.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                            aria-label="Edit"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-500 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                            aria-label="Delete"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selected ? 'Edit testimonial' : 'Add testimonial'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={inputBase}
                placeholder="e.g. Jane Doe"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>}
            </div>
            <div>
              <label className={labelBase}>Title / position *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className={inputBase}
                placeholder="e.g. CEO, Company Name"
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.title}</p>}
            </div>
          </div>
          <div>
            <ImageUrlWithUpload
              label="Avatar URL"
              value={formData.avatar}
              onChange={(url) => setFormData((p) => ({ ...p, avatar: url }))}
              placeholder="https://… or upload a file"
            />
          </div>
          <div>
            <label className={labelBase}>Testimonial text *</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData((p) => ({ ...p, text: e.target.value }))}
              className={`${inputBase} min-h-[120px]`}
              placeholder="What they said about working with you…"
              rows={4}
            />
            {formErrors.text && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.text}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Stars (1–5)</label>
              <select
                value={formData.stars}
                onChange={(e) => setFormData((p) => ({ ...p, stars: parseInt(e.target.value, 10) }))}
                className={inputBase}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Display order</label>
              <input
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))}
                className={inputBase}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-border-subtle"
            />
            <label htmlFor="isActive" className="text-sm text-text-primary">
              Show on home page
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 text-sm font-medium btn-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-medium btn-primary rounded-lg disabled:opacity-60"
            >
              {submitting ? 'Saving…' : selected ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete testimonial"
        message={selected ? `Delete "${selected.name}"? This cannot be undone.` : 'Delete this testimonial?'}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default TestimonialManagement;
