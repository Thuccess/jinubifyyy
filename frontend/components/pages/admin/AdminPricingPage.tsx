import React, { useMemo, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';
import { useServices, usePricingPackages, usePricingMutations } from '../../../hooks/useServices';

interface PackageFormState {
  serviceId: string;
  name: string;
  price: string;
  description: string;
  ctaText: string;
  billingPeriod: 'monthly' | 'one-time' | 'custom';
  features: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
}

const AdminPricingPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageFormState>({
    serviceId: '',
    name: '',
    price: '',
    description: '',
    ctaText: '',
    billingPeriod: 'custom',
    features: '',
    isFeatured: false,
    isActive: true,
    order: 0,
  });

  const { data: servicesData, isLoading: servicesLoading } = useServices({ active: true });
  const { data: pricingData, isLoading: pricingLoading, isError: pricingError } = usePricingPackages();
  const { createPackage, updatePackage, deletePackage, seedDefaultPricing } = usePricingMutations();

  const packages = pricingData?.data || [];

  const filteredPackages = useMemo(
    () =>
      packages.filter((pkg: any) => {
        const q = searchQuery.toLowerCase();
        return (
          pkg.name.toLowerCase().includes(q) ||
          (pkg.service?.title || '').toLowerCase().includes(q)
        );
      }),
    [packages, searchQuery]
  );

  const handleCreate = () => {
    setFormData({
      serviceId: '',
      name: '',
      price: '',
      description: '',
      ctaText: '',
      billingPeriod: 'custom',
      features: '',
      isFeatured: false,
      isActive: true,
      order: 0,
    });
    setSelectedPackageId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: any) => {
    setFormData({
      serviceId: pkg.service?._id || pkg.service,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description || '',
      ctaText: pkg.ctaText || '',
      billingPeriod: pkg.billingPeriod || 'custom',
      features: (pkg.features || []).join('\n'),
      isFeatured: !!pkg.isFeatured,
      isActive: pkg.isActive ?? true,
      order: pkg.order ?? 0,
    });
    setSelectedPackageId(pkg._id);
    setIsModalOpen(true);
  };

  const handleDelete = (pkg: any) => {
    setSelectedPackageId(pkg._id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    const featureList =
      formData.features
        ?.split('\n')
        .map((f) => f.trim())
        .filter(Boolean) || [];

    if (!formData.serviceId || !formData.name.trim() || !formData.price.trim()) {
      showNotification('Service, name, and price are required', 'error');
      return;
    }

    const payload = {
      service: formData.serviceId,
      name: formData.name.trim(),
      price: formData.price.trim(),
      description: formData.description.trim(),
      ctaText: formData.ctaText.trim(),
      billingPeriod: formData.billingPeriod,
      features: featureList,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      order: formData.order,
    };

    try {
      if (selectedPackageId) {
        await updatePackage.mutateAsync({ id: selectedPackageId, data: payload });
        showNotification('Package updated successfully', 'success');
      } else {
        await createPackage.mutateAsync(payload);
        showNotification('Package created successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedPackageId(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to save package', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedPackageId) return;
    try {
      await deletePackage.mutateAsync(selectedPackageId);
      showNotification('Package deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete package', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPackageId(null);
    }
  };

  return (
    <>
      <AdminLayout
        title="Pricing & Packages"
        subtitle="Manage service packages and pricing"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => seedDefaultPricing.mutateAsync().then((r) => {
                const msg = r.created + r.updated === 0 && r.skipped?.length
                  ? 'No packages created. Import default services first (Admin → Services).'
                  : `Imported: ${r.created} created, ${r.updated} updated.`;
                showNotification(msg, r.created + r.updated > 0 ? 'success' : 'error');
              }).catch((e: any) => showNotification(e.response?.data?.message || 'Import failed', 'error'))}
              disabled={seedDefaultPricing.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-surface-muted/80 text-text-primary border border-border-card rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {seedDefaultPricing.isPending ? 'Importing…' : 'Import default pricing'}
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add Package
            </button>
          </div>
        }
      >
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-surface-card rounded-xl border border-border-card shadow-sm overflow-hidden">
          {pricingLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading packages...</p>
            </div>
          ) : pricingError ? (
            <div className="p-12 text-center">
              <p className="text-text-muted">Failed to load packages. Please try again.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Features
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
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                        No packages found
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map((pkg: any) => (
                      <tr key={pkg._id} className="hover:bg-surface-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {pkg.name}
                            </span>
                            {pkg.isFeatured && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-brand-soft text-brand-primary rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {pkg.service?.title || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {pkg.price}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {pkg.billingPeriod || 'custom'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {(pkg.features || []).length} features
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              pkg.isActive
                                ? 'bg-brand-soft text-brand-primary'
                                : 'bg-surface-muted text-text-secondary'
                            }`}
                          >
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(pkg)}
                              className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                              aria-label="Edit package"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg)}
                              className="p-2 text-text-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                              aria-label="Delete package"
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
      </AdminLayout>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            serviceId: '',
            name: '',
            price: '',
            description: '',
            ctaText: '',
            billingPeriod: 'custom',
            features: '',
            isFeatured: false,
            isActive: true,
            order: 0,
          });
          setSelectedPackageId(null);
        }}
        title={selectedPackageId ? 'Edit Package' : 'Create New Package'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Service
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            >
              <option value="">Select a service</option>
              {(servicesData?.data || []).map((service: any) => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
            {!servicesLoading && (servicesData?.data || []).length === 0 && (
              <p className="mt-1 text-xs text-text-muted">
                No services found. Create a service first to attach packages.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Package Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
              placeholder="e.g., Starter Package"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Price
              </label>
              <input
              type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
              placeholder="e.g. $120 or from $1,200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Billing Period
              </label>
              <select
                value={formData.billingPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, billingPeriod: e.target.value as 'monthly' | 'one-time' | 'custom' })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="one-time">One-time</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Short Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Brief summary shown on the pricing card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              CTA Button Text
            </label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="e.g. Get Started, Choose Package"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Features (one per line)
            </label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-brand-primary border-border-subtle rounded focus:ring-[color:var(--accent-ring)]"
              />
              <span className="text-sm text-text-primary">Mark as Featured</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  serviceId: '',
                  name: '',
                  price: '',
              description: '',
              ctaText: '',
                  billingPeriod: 'custom',
                  features: '',
                  isFeatured: false,
                  isActive: true,
                  order: 0,
                });
                setSelectedPackageId(null);
              }}
              className="px-4 py-2 text-sm font-medium btn-secondary rounded-lg focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.serviceId || !formData.name || !formData.price}
              className="px-4 py-2 text-sm font-medium btn-primary rounded-lg focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {selectedPackageId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPackageId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        variant="danger"
      />

      <NotificationComponent />
    </>
  );
};

export default AdminPricingPage;
