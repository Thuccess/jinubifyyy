import React, { useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { useNotification } from '../../admin/useNotification';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { SearchIcon, FilterIcon, ArrowRightIcon, TrashIcon } from '../../icons/Icons';
import { useAdminInvestors, useUpdateInvestorStage, useDeleteInvestor } from '../../../hooks/useAdmin';

type InvestorStage = 'new' | 'contacted' | 'negotiating' | 'closed-won' | 'closed-lost' | 'all';

interface InvestorInquiry {
  _id: string;
  investor?: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
  interestLevel?: string;
  investmentRange?: string;
  message?: string;
  stage: InvestorStage;
  adminNotes?: string;
  createdAt: string;
}

const AdminInvestorsPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [stageFilter, setStageFilter] = useState<InvestorStage>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<InvestorInquiry | null>(null);

  const { data, isLoading, isError } = useAdminInvestors({
    page,
    limit: 20,
    stage: stageFilter === 'all' ? undefined : stageFilter,
    search: search || undefined,
  });
  const updateStage = useUpdateInvestorStage();
  const deleteInvestor = useDeleteInvestor();

  const investors: InvestorInquiry[] = (data?.investors || []) as any;
  const pagination = data?.pagination;

  const stageOptions: InvestorStage[] = ['new', 'contacted', 'negotiating', 'closed-won', 'closed-lost'];

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderStageBadge = (stage: InvestorStage) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    switch (stage) {
      case 'new':
        return <span className={`${base} bg-brand-soft text-brand-primary`}>New</span>;
      case 'contacted':
        return <span className={`${base} bg-surface-muted text-text-secondary`}>Contacted</span>;
      case 'negotiating':
        return <span className={`${base} bg-amber-100 text-amber-700`}>Negotiating</span>;
      case 'closed-won':
        return <span className={`${base} bg-emerald-100 text-emerald-700`}>Closed won</span>;
      case 'closed-lost':
        return <span className={`${base} bg-red-100 text-red-700`}>Closed lost</span>;
      default:
        return <span className={base}>{stage}</span>;
    }
  };

  const handleStageChange = async (inv: InvestorInquiry, nextStage: InvestorStage) => {
    try {
      await updateStage.mutateAsync({ id: inv._id, stage: nextStage });
      showNotification('Stage updated', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to update stage', 'error');
    }
  };

  const handleExport = () => {
    try {
      const payload = investors.map((inv) => ({
        id: inv._id,
        name: inv.investor?.name,
        email: inv.investor?.email,
        phone: inv.investor?.phone,
        country: inv.investor?.country,
        interestLevel: inv.interestLevel,
        investmentRange: inv.investmentRange,
        stage: inv.stage,
        createdAt: inv.createdAt,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investors-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showNotification('Failed to export investors', 'error');
    }
  };

  const handleDelete = (inv: InvestorInquiry) => {
    setSelected(inv);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteInvestor.mutateAsync(selected._id);
      showNotification('Investor inquiry deleted', 'success');
    } catch (e: any) {
      showNotification(e.response?.data?.message || 'Failed to delete investor', 'error');
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  return (
    <AdminLayout title="Investors" subtitle="Manage investor inquiries and stages">
      <NotificationComponent />

      <div className="space-y-6">
        {/* Filters and actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value as InvestorStage);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
              >
                <option value="all">All stages</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="closed-won">Closed won</option>
                <option value="closed-lost">Closed lost</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={!investors.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-sm font-medium text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50"
          >
            <ArrowRightIcon className="h-4 w-4" />
            Export JSON
          </button>
        </div>

        {/* Table */}
        <div className="bg-[color:var(--surface-card)] border border-border-subtle rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto mb-4" />
              Loading investors...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-text-secondary">Failed to load investors.</div>
          ) : !investors.length ? (
            <div className="p-12 text-center text-text-secondary">No investor inquiries found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[color:var(--surface-muted)] border-b border-border-subtle">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Investor</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Interest</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Stage</th>
                      <th className="px-4 py-2 text-left font-medium text-text-muted">Date</th>
                      <th className="px-4 py-2 text-right font-medium text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {investors.map((inv) => (
                      <tr key={inv._id} className="hover:bg-[color:var(--surface-muted)]/70 transition-colors">
                        <td className="px-4 py-2">
                          <div className="font-medium text-text-primary">
                            {inv.investor?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {inv.investor?.email}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {inv.investor?.country}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-text-secondary">
                          <div>{inv.interestLevel || '—'}</div>
                          <div className="text-xs text-text-muted">
                            {inv.investmentRange || ''}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {renderStageBadge(inv.stage)}
                            <select
                              value={inv.stage}
                              onChange={(e) =>
                                handleStageChange(inv, e.target.value as InvestorStage)
                              }
                              className="text-xs border border-border-subtle rounded-md px-1.5 py-0.5 bg-transparent text-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-ring"
                            >
                              {stageOptions.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(inv)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
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
                      className="px-3 py-1 rounded-md border border-border-subtle disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 rounded-md border border-border-subtle disabled:opacity-50"
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

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete investor inquiry"
        description="Are you sure you want to delete this investor inquiry? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
};

export default AdminInvestorsPage;

