import React, { useMemo, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, EyeIcon, ChevronUpIcon, ChevronDownIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';
import { ImageUrlWithUpload } from '../../ui/ImageUrlWithUpload';
import { useServices, useDemos, useDemoMutations } from '../../../hooks/useServices';
import Link from 'next/link';
import AdminWebsiteDemosPanel from './AdminWebsiteDemosPanel';

interface ImageEntry {
  url: string;
  order: number;
}

interface DemoFormState {
  serviceId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  demoUrl: string;
  repoUrl: string;
  techStack: string;
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
  images: ImageEntry[];
  coverImageUrl: string;
}

type DemosAdminTab = 'website' | 'service';

const AdminDemosPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [adminTab, setAdminTab] = useState<DemosAdminTab>('website');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DemoFormState>({
    serviceId: '',
    title: '',
    slug: '',
    description: '',
    category: '',
    demoUrl: '',
    repoUrl: '',
    techStack: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    images: [],
    coverImageUrl: '',
  });

  const { data: servicesData } = useServices({ active: true });
  const { data: demosData, isLoading, isError } = useDemos();
  const { createDemo, updateDemo, deleteDemo, reorderDemos } = useDemoMutations();

  const demos = demosData?.data || [];

  const filteredDemos = useMemo(
    () =>
      demos.filter((demo: any) => {
        const q = searchQuery.toLowerCase();
        return (
          demo.title.toLowerCase().includes(q) ||
          (demo.service?.title || '').toLowerCase().includes(q) ||
          demo.description.toLowerCase().includes(q)
        );
      }),
    [demos, searchQuery]
  );

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleCreate = () => {
    setFormData({
      serviceId: '',
      title: '',
      slug: '',
      description: '',
      category: '',
      demoUrl: '',
      repoUrl: '',
      techStack: '',
      tags: '',
      isActive: true,
      isFeatured: false,
      images: [],
      coverImageUrl: '',
    });
    setSelectedDemoId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (demo: any) => {
    const images = (demo.images || []).slice().sort((a: ImageEntry, b: ImageEntry) => a.order - b.order);
    setFormData({
      serviceId: demo.service?._id || demo.service,
      title: demo.title,
      slug: demo.slug,
      description: demo.description,
      category: demo.category || '',
      demoUrl: demo.demoUrl || '',
      repoUrl: demo.repoUrl || '',
      techStack: (demo.techStack || []).join(', '),
      tags: (demo.tags || []).join(', '),
      isActive: demo.isActive ?? true,
      isFeatured: demo.isFeatured ?? false,
      images: images.length ? images : [],
      coverImageUrl: demo.coverImageUrl || images[0]?.url || '',
    });
    setSelectedDemoId(demo._id);
    setIsModalOpen(true);
  };

  const handleDelete = (demo: any) => {
    setSelectedDemoId(demo._id);
    setIsDeleteDialogOpen(true);
  };

  const addImage = () => {
    const maxOrder = formData.images.length ? Math.max(...formData.images.map((i) => i.order)) : -1;
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', order: maxOrder + 1 }],
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })),
      coverImageUrl: formData.images[index]?.url === formData.coverImageUrl ? '' : formData.coverImageUrl,
    });
  };

  const updateImageUrl = (index: number, url: string) => {
    const next = formData.images.map((img, i) => (i === index ? { ...img, url } : img));
    setFormData({ ...formData, images: next });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const images = [...formData.images];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= images.length) return;
    [images[index], images[swap]] = [images[swap], images[index]];
    const reordered = images.map((img, i) => ({ ...img, order: i }));
    setFormData({ ...formData, images: reordered });
  };

  const handleSubmit = async () => {
    if (!formData.serviceId || !formData.title.trim() || !formData.description.trim()) {
      showNotification('Service, title, and description are required', 'error');
      return;
    }

    const imagesWithUrls = formData.images
      .map((img, i) => ({ url: img.url.trim(), order: i }))
      .filter((img) => img.url);
    if (imagesWithUrls.length === 0) {
      showNotification('Add at least one image URL', 'error');
      return;
    }

    const payload = {
      service: formData.serviceId,
      title: formData.title.trim(),
      slug: (formData.slug || generateSlug(formData.title)).trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      demoUrl: formData.demoUrl.trim(),
      repoUrl: formData.repoUrl.trim(),
      techStack: formData.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: formData.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      images: imagesWithUrls,
      coverImageUrl: formData.coverImageUrl?.trim() || imagesWithUrls[0]?.url || '',
    };

    try {
      if (selectedDemoId) {
        await updateDemo.mutateAsync({ id: selectedDemoId, data: payload });
        showNotification('Demo updated successfully', 'success');
      } else {
        await createDemo.mutateAsync(payload);
        showNotification('Demo created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedDemoId(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to save demo', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedDemoId) return;
    try {
      await deleteDemo.mutateAsync(selectedDemoId);
      showNotification('Demo deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete demo', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDemoId(null);
    }
  };

  return (
    <>
      <AdminLayout
        title={adminTab === 'website' ? 'Website demos' : 'Service-linked demos'}
        subtitle={
          adminTab === 'website'
            ? 'Showcase templates and live site previews for the public /demos catalog'
            : 'Demos attached to a service (legacy gallery pages)'
        }
        actions={
          adminTab === 'service' ? (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:opacity-90 text-text-inverted rounded-lg text-sm font-medium transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add service demo
            </button>
          ) : null
        }
      >
        <div className="mb-8 flex flex-wrap gap-2 border-b border-border-subtle pb-4">
          <button
            type="button"
            onClick={() => setAdminTab('website')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              adminTab === 'website'
                ? 'bg-brand-primary text-text-inverted'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            Website showcases
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('service')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              adminTab === 'service'
                ? 'bg-brand-primary text-text-inverted'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            Service-linked
          </button>
        </div>

        {adminTab === 'website' ? (
          <AdminWebsiteDemosPanel />
        ) : null}

        {adminTab === 'service' ? (
          <>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search demos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
        </div>

        {/* Demos Table */}
        <div className="bg-surface-card rounded-xl border border-border-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading demos...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-text-muted">Failed to load demos. Please try again.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Demo Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredDemos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        No demos found
                      </td>
                    </tr>
                  ) : (
                    filteredDemos
                      .slice()
                      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                      .map((demo: any, index: number) => (
                      <tr key={demo._id} className="hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-text-primary">
                            {demo.title}
                          </div>
                          <div className="text-sm text-text-muted truncate max-w-md">
                            {demo.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {demo.service?.title || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                          {demo.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          {demo.isFeatured && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-brand-soft text-brand-primary">
                              Featured
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              demo.isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'bg-surface-muted text-text-secondary'
                            }`}
                          >
                            {demo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-text-muted mr-2 select-none">#{index + 1}</span>
                            <Link
                              href={demo.service?.slug ? `/demos/${demo.service.slug}` : '/demos'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                              aria-label="View demo"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={async () => {
                                const ordered = filteredDemos
                                  .slice()
                                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                                const idx = ordered.findIndex((d: any) => d._id === demo._id);
                                if (idx <= 0) return;
                                [ordered[idx - 1], ordered[idx]] = [ordered[idx], ordered[idx - 1]];
                                const orderPayload = ordered.map((d: any, i: number) => ({
                                  id: d._id,
                                  order: i,
                                }));
                                await reorderDemos.mutateAsync(orderPayload);
                              }}
                              disabled={index === 0}
                              className="p-1 text-text-muted hover:text-text-primary disabled:opacity-40 rounded-lg"
                              aria-label="Move up"
                            >
                              <ChevronUpIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const ordered = filteredDemos
                                  .slice()
                                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                                const idx = ordered.findIndex((d: any) => d._id === demo._id);
                                if (idx === -1 || idx >= ordered.length - 1) return;
                                [ordered[idx], ordered[idx + 1]] = [ordered[idx + 1], ordered[idx]];
                                const orderPayload = ordered.map((d: any, i: number) => ({
                                  id: d._id,
                                  order: i,
                                }));
                                await reorderDemos.mutateAsync(orderPayload);
                              }}
                              disabled={index === filteredDemos.length - 1}
                              className="p-1 text-text-muted hover:text-text-primary disabled:opacity-40 rounded-lg"
                              aria-label="Move down"
                            >
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(demo)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                              aria-label="Edit demo"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(demo)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              aria-label="Delete demo"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        ) : null}
      </AdminLayout>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            serviceId: '',
            title: '',
            slug: '',
            description: '',
            category: '',
            demoUrl: '',
            repoUrl: '',
            techStack: '',
            tags: '',
            isActive: true,
            isFeatured: false,
            images: [],
            coverImageUrl: '',
          });
          setSelectedDemoId(null);
        }}
        title={selectedDemoId ? 'Edit Demo' : 'Create New Demo'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Service
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
            >
              <option value="">Select a service</option>
              {(servicesData?.data || []).map((service: any) => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Demo Title
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
              placeholder="Enter demo title"
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
              placeholder="demo-slug"
            />
            <p className="mt-1 text-xs text-text-muted">
              Used in URLs under the selected service, e.g. <code>/demos/service-slug/{formData.slug || 'demo-slug'}</code>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Images (URLs, in order)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Add at least one image. Order determines gallery display.</p>
            {formData.images.map((img, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <div className="flex-1 min-w-0">
                  <ImageUrlWithUpload
                    compact
                    value={img.url}
                    onChange={(url) => updateImageUrl(index, url)}
                    placeholder="https://… or upload"
                  />
                </div>
                <span className="text-xs text-slate-500 w-6 shrink-0">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-40 rounded"
                  aria-label="Move up"
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === formData.images.length - 1}
                  className="p-2 text-text-muted hover:text-text-primary disabled:opacity-40 rounded"
                  aria-label="Move down"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  aria-label="Remove image"
                >
                  <DeleteIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImage}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
            >
              <PlusIcon className="h-4 w-4" /> Add image
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Cover image
            </label>
            <select
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            >
              <option value="">First image in list</option>
              {formData.images.filter((i) => i.url).map((img, i) => (
                <option key={i} value={img.url}>
                  Image #{i + 1} {img.url.length > 40 ? img.url.slice(0, 37) + '...' : img.url}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
              placeholder="Enter demo description"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
                placeholder="e.g. Gallery, Website, Social"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Repo URL (optional)
              </label>
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tech stack (comma-separated)
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
                placeholder="landing-page, ecommerce, NGO"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Demo URL (optional)
            </label>
            <input
              type="text"
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Featured
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded focus:ring-[color:var(--accent-ring)]"
              />
              <span className="text-sm text-text-primary">Highlight this demo on the website</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  serviceId: '',
                  title: '',
                  slug: '',
                  description: '',
                  category: '',
                  demoUrl: '',
                  repoUrl: '',
                  techStack: '',
                  tags: '',
                  isActive: true,
                  isFeatured: false,
                  images: [],
                  coverImageUrl: '',
                });
                setSelectedDemoId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-muted border border-border-card hover:bg-surface-card rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.serviceId || !formData.title || !formData.description || formData.images.filter((i) => i.url.trim()).length === 0}
              className="px-4 py-2 text-sm font-medium text-text-inverted bg-brand-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            >
              {selectedDemoId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDemoId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Demo"
        message="Are you sure you want to delete this demo? This action cannot be undone."
        variant="danger"
      />

      <NotificationComponent />
    </>
  );
};

export default AdminDemosPage;
