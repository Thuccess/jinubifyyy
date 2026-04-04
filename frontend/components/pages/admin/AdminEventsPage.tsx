import React, { useMemo, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';
import { ImageUrlWithUpload } from '../../ui/ImageUrlWithUpload';
import { useAdminEvents, useEventMutations } from '../../../hooks/useEvents';

interface EventFormState {
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

const AdminEventsPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormState>({
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

  const { data, isLoading, isError } = useAdminEvents();
  const { createEvent, updateEvent, deleteEvent, reorderEvents } = useEventMutations();

  const events = (data?.data || []) as any[];

  const filteredEvents = useMemo(
    () =>
      events.filter((event: any) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          event.title.toLowerCase().includes(q) ||
          (event.description || '').toLowerCase().includes(q) ||
          (event.tags || []).join(' ').toLowerCase().includes(q);
        const matchStatus = !statusFilter || event.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [events, searchQuery, statusFilter]
  );

  const sortedEvents = useMemo(
    () => [...events].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [events]
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
    setSelectedEventId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setFormData({
      title: event.title || '',
      slug: event.slug || '',
      description: event.description || '',
      content: event.content || '',
      imageUrl: event.imageUrl || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : '',
      status: event.status || 'draft',
      isFeatured: !!event.isFeatured,
    });
    setSelectedEventId(event._id);
    setIsModalOpen(true);
  };

  const handleMove = async (eventId: string, direction: 'up' | 'down') => {
    const idx = sortedEvents.findIndex((e: any) => e._id === eventId);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sortedEvents.length) return;
    const list = [...sortedEvents];
    [list[idx], list[target]] = [list[target], list[idx]];
    const order = list.map((e: any, i) => ({ id: e._id, order: i }));
    try {
      await reorderEvents.mutateAsync(order);
      showNotification('Order updated', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to reorder events', 'error');
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
      if (selectedEventId) {
        await updateEvent.mutateAsync({ id: selectedEventId, payload });
        showNotification('Event updated successfully', 'success');
      } else {
        await createEvent.mutateAsync(payload as any);
        showNotification('Event created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedEventId(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to save event', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;
    try {
      await deleteEvent.mutateAsync(selectedEventId);
      showNotification('Event deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete event', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEventId(null);
    }
  };

  return (
    <>
      <NotificationComponent />
      <AdminLayout
        title="Events"
        subtitle="Manage webinars, workshops, and events"
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Event
          </button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border-card rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] min-w-[160px]"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="bg-surface-card rounded-xl border border-border-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto" />
              <p className="mt-4 text-text-muted">Loading events...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-text-muted">Failed to load events. Please try again.</p>
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
                      Event
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
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event: any) => {
                      const sortedIdx = sortedEvents.findIndex((e: any) => e._id === event._id);
                      const canMoveUp = sortedIdx > 0;
                      const canMoveDown = sortedIdx >= 0 && sortedIdx < sortedEvents.length - 1;
                      return (
                        <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={!canMoveUp}
                                onClick={() => handleMove(event._id, 'up')}
                                className="p-1 rounded text-slate-500 hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Move up"
                              >
                                <ChevronUpIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={!canMoveDown}
                                onClick={() => handleMove(event._id, 'down')}
                                className="p-1 rounded text-slate-500 hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Move down"
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {event.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                              {event.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {event.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                            {event.date ? new Date(event.date).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {event.isFeatured ? (
                              <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                                Featured
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                event.status === 'published'
                                  ? 'bg-brand-soft text-brand-primary'
                                  : 'bg-surface-muted text-text-secondary'
                              }`}
                            >
                              {event.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(event)}
                                className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                                aria-label="Edit event"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedEventId(event._id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-2 text-red-500 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                                aria-label="Delete event"
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
      </AdminLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEventId(null);
        }}
        title={selectedEventId ? 'Edit Event' : 'Create New Event'}
        size="md"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Event title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: formData.slug || generateSlug(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Enter event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: generateSlug(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="event-title"
            />
            <p className="mt-1 text-xs text-text-muted">
              Used in URLs, e.g. <code>/events/{formData.slug || 'event-title'}</code>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Short description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Brief summary shown in the list"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Detailed content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Full event description, agenda, speakers, etc."
            />
          </div>
          <div>
            <ImageUrlWithUpload
              label="Image URL (optional)"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              placeholder="https://… or upload a file"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Date & time
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="webinar, workshop, training"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
              />
              <span className="text-sm font-medium text-text-primary">Feature on events page</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedEventId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-muted border border-border-card hover:bg-surface-card rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description}
              className="px-4 py-2 text-sm font-medium text-text-inverted bg-brand-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            >
              {selectedEventId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEventId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="This will soft-delete the event (hide from the public site and admin list). You can restore it later from the database if needed."
        variant="danger"
      />
    </>
  );
};

export default AdminEventsPage;

