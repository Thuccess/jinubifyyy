'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '../../layout/admin/AdminLayout';
import { adminAPI } from '../../../services/api';
import type { AnalyticsData } from './AdminAnalyticsCharts';

const AdminAnalyticsCharts = dynamic(() => import('./AdminAnalyticsCharts'), { ssr: false });

const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminAPI.getAnalytics(days);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load analytics');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading && !data) {
    return (
      <AdminLayout title="Analytics" subtitle="Traffic, leads, and conversions">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-border-subtle border-t-brand-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Analytics" subtitle="Traffic, leads, and conversions">
        <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-8 text-center shadow-card">
          <p className="text-text-secondary">{error || 'No data available.'}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" subtitle="Traffic, leads, and conversions">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Period:
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-border-card bg-[color:var(--surface-card)] px-3 py-2 text-text-primary"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
        <AdminAnalyticsCharts data={data} />
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
