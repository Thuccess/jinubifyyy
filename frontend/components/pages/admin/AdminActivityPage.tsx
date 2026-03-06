'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { adminAPI } from '../../../services/api';
import { SearchIcon } from '../../icons/Icons';

interface ActivityItem {
  _id: string;
  user: { name: string; email: string } | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string;
  timestamp: string;
}

const ITEMS_PER_PAGE = 20;

const AdminActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: {
        page: number;
        limit: number;
        user?: string;
        entityType?: string;
        dateFrom?: string;
        dateTo?: string;
      } = { page, limit: ITEMS_PER_PAGE };
      if (userSearch.trim()) params.user = userSearch.trim();
      if (entityTypeFilter.trim()) params.entityType = entityTypeFilter.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await adminAPI.getActivity(params);
      setActivities(data.activities);
      setTotalPages(data.pagination.pages);
    } catch (err: unknown) {
      console.error('Fetch activity error:', err);
      setError('Failed to load activity log');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [page, userSearch, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <AdminLayout title="Activity" subtitle="View admin activity log">
      <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border-subtle bg-[color:var(--surface-muted)]/30 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by user name or email"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          >
            <option value="">All entity types</option>
            <option value="blog">Blog</option>
            <option value="order">Order</option>
            <option value="user">User</option>
            <option value="service">Service</option>
            <option value="contact">Contact</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            title="To date"
          />
          <button
            type="button"
            onClick={() => setPage(1)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90"
          >
            Apply
          </button>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
            <p className="mt-4 text-sm text-text-muted">Loading activity…</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-sm text-text-secondary">No activity found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle bg-[color:var(--surface-muted)]/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Action</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">Entity</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {activities.map((a) => (
                    <tr key={a._id} className="hover:bg-[color:var(--surface-muted)]/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-text-primary">
                        {a.user ? `${a.user.name} (${a.user.email})` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-primary">{a.action}</td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary hidden md:table-cell">
                        {a.entityType || '—'}
                        {a.entityId ? ` · ${String(a.entityId).slice(0, 8)}` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary max-w-xs truncate" title={a.description}>
                        {a.description}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-muted whitespace-nowrap">{formatDate(a.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border-subtle bg-[color:var(--surface-muted)]/30">
                <p className="text-sm text-text-muted">
                  Page <span className="font-medium text-text-primary">{page}</span> of{' '}
                  <span className="font-medium text-text-primary">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivityPage;
