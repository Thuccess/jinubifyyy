'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import DashboardOverview from './admin/sections/DashboardOverview';

interface Stats {
  totalUsers: number;
  totalBlogPosts: number;
  totalContacts: number;
  totalOrders: number;
  totalTestimonials?: number;
  pendingContacts: number;
  publishedPosts: number;
  totalApplications?: number;
  newApplications?: number;
  totalInvestors?: number;
  newInvestors?: number;
}

const AdminDashboardPage: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.stats);
      setError('');
    } catch (err: unknown) {
      console.error('Error fetching admin stats:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to load admin dashboard';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (section: string) => {
    const sectionMap: Record<string, string> = {
      dashboard: '/admin',
      services: '/admin/services',
      blog: '/admin/blog',
      contacts: '/admin/contacts',
      users: '/admin/users',
      orders: '/admin/orders',
      testimonials: '/admin/testimonials',
      about: '/admin/about',
      team: '/admin/team',
      applications: '/admin/applications',
      investors: '/admin/investors',
    };
    const path = sectionMap[section] || '/admin';
    router.push(path);
  };

  if (loading && !stats) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your website"
    >
      {error && (
        <div className="mb-6 p-4 bg-surface-muted border border-border-subtle rounded-xl">
          <p className="text-sm text-text-primary">
            <strong>Note:</strong>{' '}
            <span className="text-text-secondary">{error} Please log in as an admin to access full functionality.</span>
          </p>
        </div>
      )}

      <div className="mb-6">
        <div className="card-solid rounded-2xl overflow-hidden">
          <DashboardOverview stats={stats} onNavigate={handleNavigate} />
        </div>
      </div>

      {/* Activity preview: link to full activity page */}
      <div className="card-solid rounded-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Recent activity</h2>
          <a
            href="/admin/activity"
            className="text-sm font-medium text-brand-primary hover:opacity-90"
          >
            View all activity →
          </a>
        </div>
        <p className="text-sm text-text-secondary">
          View and filter all admin activity on the <a href="/admin/activity" className="text-brand-primary hover:underline">Activity</a> page.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
