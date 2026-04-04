import React, { useState, useMemo } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { useNotification } from '../../admin/useNotification';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { SearchIcon, FilterIcon, TrashIcon, EyeIcon } from '../../icons/Icons';
import { useAdminApplications, useUpdateApplicationStatus, useDeleteApplication } from '../../../hooks/useAdmin';

type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | 'all';

interface JobApplication {
  _id: string;
  applicant?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    coverLetter?: string;
    resumeUrl?: string;
  };
  status: ApplicationStatus;
  source?: string;
  adminNotes?: string;
  createdAt: string;
}

const AdminApplicationsPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useAdminApplications({
    page,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
  });
  const updateStatus = useUpdateApplicationStatus();
  const deleteApplication = useDeleteApplication();

  const applications: JobApplication[] = (data?.applications || []) as any;
  const pagination = data?.pagination;

  const handleView = (app: JobApplication) => {
    setSelected(app);
    setDetailOpen(true);
  };

  const handleStatusChange = async (app: JobApplication, nextStatus: ApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({ id: app._id, status: nextStatus });
      showNotification('Status updated', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = (app: JobApplication) => {
    setSelected(app);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteApplication.mutateAsync(selected._id);
      showNotification('Application deleted', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to delete application', 'error');
    } finally {
      setDeleteOpen(false);
      setSelected(null);
      setBulkSelection({});
    }
  };

  const toggleBulk = (id: string) => {
    setBulkSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedIds = useMemo(() => Object.keys(bulkSelection).filter((id) => bulkSelection[id]), [bulkSelection]);

  const handleBulkStatus = async (nextStatus: ApplicationStatus) => {
    if (!selectedIds.length || nextStatus === 'all') return;
    try {
      await Promise.all(
        selectedIds.map((id) => updateStatus.mutateAsync({ id, status: nextStatus }))
      );
      showNotification('Statuses updated', 'success');
      setBulkSelection({});
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to update statuses', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteApplication.mutateAsync(id)));
      showNotification('Applications deleted', 'success');
      setBulkSelection({});
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to delete applications', 'error');
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const statusOptions: ApplicationStatus[] = ['new', 'reviewing', 'shortlisted', 'hired', 'rejected'];

  const renderStatusBadge = (status: ApplicationStatus) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'new':
        return <span className={`${base} bg-brand-soft text-brand-primary`}>New</span>;
      case 'reviewing':
        return <span className={`${base} bg-surface-muted text-text-secondary`}>Reviewing</span>;
      case 'shortlisted':
        return <span className={`${base} bg-surface-muted text-text-secondary`}>Shortlisted</span>;
      case 'hired':
        return <span className={`${base} bg-emerald-100 text-emerald-700`}>Hired</span>;
      case 'rejected':
        return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
      default:
        return <span className={base}>{status}</span>;
    }
  };

  return (
    <AdminLayout title="Applications" subtitle="Manage job applications from the career page">
      <NotificationComponent />

      <div className="space-y-6">
        {/* Overview strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] px-4 py-3 shadow-card">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Total applications</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {data?.pagination?.total ?? applications.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] px-4 py-3 shadow-card">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">New</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {applications.filter((a) => a.status === 'new').length}
            </p>
          </div>
          <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] px-4 py-3 shadow-card">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Shortlisted</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {applications.filter((a) => a.status === 'shortlisted').length}
            </p>
          </div>
        </div>

        {/* Filters + bulk actions */}
        <div className="card-solid rounded-2xl border border-border-card px-4 py-4 sm:px-6 sm:py-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ApplicationStatus);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-border-card bg-[color:var(--surface-card)] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => {
                const value = e.target.value as ApplicationStatus;
                if (value) {
                  handleBulkStatus(value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-2 rounded-lg border border-border-card bg-[color:var(--surface-card)] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
            >
              <option value="">Bulk status...</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  Mark as {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/60 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4" />
              Delete selected
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card-solid bg-[color:var(--surface-card)] border border-border-card rounded-2xl overflow-hidden shadow-card">
          {isLoading ? (
            <div className="p-12 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto mb-4" />
              Loading applications...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-text-secondary">Failed to load applications.</div>
          ) : !applications.length ? (
            <div className="p-12 text-center text-text-secondary">No applications found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[color:var(--surface-muted)] border-b border-border-subtle">
                    <tr>
                      <th className="px-4 py-2 w-10">
                        <input
                          type="checkbox"
                          checked={
                            applications.length > 0 &&
                            applications.every((a) => bulkSelection[a._id])
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const next: Record<string, boolean> = {};
                            if (checked) {
                              applications.forEach((a) => {
                                next[a._id] = true;
                              });
                            }
                            setBulkSelection(next);
                          }}
                        />
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Applicant</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Position</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Date</th>
                      <th className="px-4 py-2 text-right font-medium text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-[color:var(--surface-muted)]/70 transition-colors">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={!!bulkSelection[app._id]}
                            onChange={() => toggleBulk(app._id)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-text-primary">
                            {app.applicant?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {app.applicant?.email}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-text-secondary">
                          {app.applicant?.position || '—'}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(app.status)}
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app, e.target.value as ApplicationStatus)
                              }
                              className="text-xs border border-border-card rounded-md px-1.5 py-0.5 bg-transparent text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-ring"
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(app)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-brand-primary hover:bg-brand-soft"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(app)}
                              className="p-1.5 rounded-md text-xs text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 rounded-md border border-border-card disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 rounded-md border border-border-card disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Application details">
        {selected && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-text-primary">Applicant</h3>
              <p className="text-text-secondary">
                {selected.applicant?.name} • {selected.applicant?.email}
              </p>
              {selected.applicant?.phone && (
                <p className="text-text-secondary">{selected.applicant.phone}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Position</h3>
              <p className="text-text-secondary">{selected.applicant?.position || '—'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Cover letter</h3>
              <p className="text-text-secondary whitespace-pre-line">
                {selected.applicant?.coverLetter || '—'}
              </p>
            </div>
            {selected.applicant?.resumeUrl && (
              <div>
                <h3 className="font-semibold text-text-primary">Resume</h3>
                <a
                  href={selected.applicant.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline break-all"
                >
                  Download CV
                </a>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-text-primary">Admin notes</h3>
              <p className="text-xs text-text-secondary mb-1">
                Update notes when changing status via the API or future UI.
              </p>
              <p className="text-text-secondary whitespace-pre-line">
                {selected.adminNotes || '—'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete application"
        description="Are you sure you want to permanently delete this application? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
};

export default AdminApplicationsPage;

