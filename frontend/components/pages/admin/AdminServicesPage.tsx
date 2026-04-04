import React, { useMemo, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';
import { ImageUrlWithUpload } from '../../ui/ImageUrlWithUpload';
import { useServices, useServiceMutations } from '../../../hooks/useServices';

interface ServiceFormState {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  intro: string;
  bulletsLabel: string;
  bullets: string[];
  category: string;
  icon: string;
  imageUrl: string;
  startingPrice: string;
  isActive: boolean;
  isFeatured: boolean;
  hasDemo: boolean;
  seoTitle: string;
  seoDescription: string;
}

const AdminServicesPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormState>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    intro: '',
    bulletsLabel: '',
    bullets: [],
    category: '',
    icon: '',
    imageUrl: '',
    startingPrice: '',
    isActive: true,
    isFeatured: false,
    hasDemo: false,
    seoTitle: '',
    seoDescription: '',
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data, isLoading, isError } = useServices();
  const { createService, updateService, updateServiceStatus, reorderServices, deleteService } = useServiceMutations();

  const services = (data?.data || []) as any[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s: any) => s.category && set.add(s.category));
    return Array.from(set).sort();
  }, [services]);

  const filteredServices = useMemo(
    () =>
      services.filter((service: any) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          service.title.toLowerCase().includes(q) ||
          (service.description || '').toLowerCase().includes(q) ||
          (service.category || '').toLowerCase().includes(q);
        const matchCategory = !categoryFilter || (service.category || '') === categoryFilter;
        return matchSearch && matchCategory;
      }),
    [services, searchQuery, categoryFilter]
  );

  const handleCreate = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      shortDescription: '',
      intro: '',
      bulletsLabel: '',
      bullets: [],
      category: '',
      icon: '',
      imageUrl: '',
      startingPrice: '',
      isActive: true,
      isFeatured: false,
      hasDemo: false,
      seoTitle: '',
      seoDescription: '',
    });
    setSelectedServiceId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: any) => {
    setFormData({
      title: service.title,
      slug: service.slug,
      description: service.description,
      shortDescription: service.shortDescription ?? '',
      intro: service.intro ?? '',
      bulletsLabel: service.bulletsLabel ?? '',
      bullets: Array.isArray(service.bullets) ? [...service.bullets] : [],
      category: service.category || '',
      icon: service.icon || '',
      imageUrl: service.imageUrl || '',
      startingPrice: service.startingPrice || '',
      isActive: service.isActive ?? true,
      isFeatured: service.isFeatured ?? false,
      hasDemo: service.hasDemo ?? false,
      seoTitle: service.seoTitle ?? '',
      seoDescription: service.seoDescription ?? '',
    });
    setSelectedServiceId(service._id);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (service: any) => {
    try {
      await updateServiceStatus.mutateAsync({ id: service._id, isActive: !service.isActive });
      showNotification(service.isActive ? 'Service disabled' : 'Service enabled', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const sortedServices = useMemo(
    () => [...services].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
    [services]
  );

  const handleMove = async (serviceId: string, direction: 'up' | 'down') => {
    const idx = sortedServices.findIndex((s: any) => s._id === serviceId);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sortedServices.length) return;
    const list = [...sortedServices];
    [list[idx], list[target]] = [list[target], list[idx]];
    const order = list.map((s: any, i) => ({ id: s._id, order: i }));
    try {
      await reorderServices.mutateAsync(order);
      showNotification('Order updated', 'success');
    } catch (e: any) {
      showNotification((e as any).response?.data?.message || 'Failed to reorder', 'error');
    }
  };

  const handleDelete = (service: any) => {
    setSelectedServiceId(service._id);
    setIsDeleteDialogOpen(true);
  };

  // Helper to generate a slug from the title on the client side.
  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSubmit = async () => {
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(),
      intro: formData.intro.trim(),
      bulletsLabel: formData.bulletsLabel.trim(),
      bullets: formData.bullets.map((b) => b.trim()).filter(Boolean),
      hasDemo: formData.hasDemo,
      category: formData.category.trim(),
      icon: formData.icon.trim(),
      imageUrl: formData.imageUrl.trim(),
      startingPrice: formData.startingPrice.trim(),
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      seoTitle: formData.seoTitle.trim(),
      seoDescription: formData.seoDescription.trim(),
    };

    if (!payload.title || !payload.slug || !payload.description) {
      showNotification('Title, slug, and description are required', 'error');
      return;
    }

    try {
      if (selectedServiceId) {
        await updateService.mutateAsync({ id: selectedServiceId, data: payload });
        showNotification('Service updated successfully', 'success');
      } else {
        await createService.mutateAsync(payload as any);
        showNotification('Service created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedServiceId(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to save service', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedServiceId) return;
    try {
      await deleteService.mutateAsync(selectedServiceId);
      showNotification('Service deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete service', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedServiceId(null);
    }
  };

  return (
    <>
      <NotificationComponent />
      <AdminLayout
        title="Services Management"
        subtitle="Manage your service offerings"
        actions={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Service
          </button>
        }
      >
        {/* Search and filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border-card rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] min-w-[160px]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Services Table */}
        <div className="bg-surface-card rounded-xl border border-border-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading services...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-text-muted">Failed to load services. Please try again.</p>
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
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Category
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
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No services found
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service: any) => {
                      const sortedIdx = sortedServices.findIndex((s: any) => s._id === service._id);
                      const canMoveUp = sortedIdx > 0;
                      const canMoveDown = sortedIdx >= 0 && sortedIdx < sortedServices.length - 1;
                      return (
                        <tr key={service._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={!canMoveUp}
                                onClick={() => handleMove(service._id, 'up')}
                                className="p-1 rounded text-slate-500 hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Move up"
                              >
                                <ChevronUpIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={!canMoveDown}
                                onClick={() => handleMove(service._id, 'down')}
                                className="p-1 rounded text-slate-500 hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Move down"
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {service.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                              {service.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {service.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                            {service.category || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.isFeatured ? (
                              <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                                Featured
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(service)}
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                service.isActive
                                  ? 'bg-brand-soft text-brand-primary'
                                  : 'bg-surface-muted text-text-secondary'
                              }`}
                            >
                              {service.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(service)}
                                className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                                aria-label="Edit service"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(service)}
                                className="p-2 text-red-500 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                                aria-label="Delete service"
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            title: '',
            slug: '',
            description: '',
            shortDescription: '',
            intro: '',
            bulletsLabel: '',
            bullets: [],
            category: '',
            icon: '',
            imageUrl: '',
            startingPrice: '',
            isActive: true,
            isFeatured: false,
            hasDemo: false,
            seoTitle: '',
            seoDescription: '',
          });
          setSelectedServiceId(null);
        }}
        title={selectedServiceId ? 'Edit Service' : 'Create New Service'}
        size="md"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Service Name
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
              placeholder="Enter service name"
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
              placeholder="service-name"
            />
            <p className="mt-1 text-xs text-text-muted">
              Used in URLs, e.g. <code>/services/{formData.slug || 'service-name'}</code>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description (required)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Main description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Short description (optional, e.g. for cards)
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="One line summary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Icon (optional, URL or icon name)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="e.g. icon name or URL"
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
              Intro paragraph (for /services page)
            </label>
            <textarea
              value={formData.intro}
              onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Longer intro text shown on the public services page"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Bullets label
            </label>
            <input
              type="text"
              value={formData.bulletsLabel}
              onChange={(e) => setFormData({ ...formData, bulletsLabel: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="e.g. What you get:"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Bullet points
            </label>
            <div className="space-y-2">
              {formData.bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => {
                      const next = [...formData.bullets];
                      next[index] = e.target.value;
                      setFormData({ ...formData, bullets: next });
                    }}
                    className="flex-1 px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
                    placeholder={`Bullet ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        bullets: formData.bullets.filter((_, i) => i !== index),
                      })
                    }
                    className="p-2 text-red-500 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                    aria-label="Remove bullet"
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, bullets: [...formData.bullets, ''] })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-brand-primary hover:bg-brand-soft rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add bullet
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasDemo}
                onChange={(e) => setFormData({ ...formData, hasDemo: e.target.checked })}
                className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
              />
              <span className="text-sm font-medium text-text-primary">Has demo page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
              />
              <span className="text-sm font-medium text-text-primary">Featured on /services</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              SEO title (optional)
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Meta title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              SEO description (optional)
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Meta description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Category (optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Starting Price (optional)
            </label>
            <input
              type="text"
              value={formData.startingPrice}
              onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="e.g. $120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Status
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  title: '',
                  slug: '',
                  description: '',
                  shortDescription: '',
                  intro: '',
                  bulletsLabel: '',
                  bullets: [],
                  category: '',
                  icon: '',
                  imageUrl: '',
                  startingPrice: '',
                  isActive: true,
                  isFeatured: false,
                  hasDemo: false,
                  seoTitle: '',
                  seoDescription: '',
                });
                setSelectedServiceId(null);
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
              {selectedServiceId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedServiceId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="This will soft-delete the service (hide from the public site and admin list). You can restore it later from the database if needed."
        variant="danger"
      />
    </>
  );
};

export default AdminServicesPage;
