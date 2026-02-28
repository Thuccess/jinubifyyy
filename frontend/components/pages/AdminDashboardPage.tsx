import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import DashboardOverview from './admin/sections/DashboardOverview';
import BlogManagement from './admin/sections/BlogManagement';
import ContactManagement from './admin/sections/ContactManagement';
import UserManagement from './admin/sections/UserManagement';
import OrderManagement from './admin/sections/OrderManagement';
import { PlusIcon } from '../icons/Icons';

interface Stats {
  totalUsers: number;
  totalBlogPosts: number;
  totalContacts: number;
  totalOrders: number;
  pendingContacts: number;
  publishedPosts: number;
}

type TabType = 'dashboard' | 'blog' | 'contacts' | 'users' | 'orders';

const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  // Use React Router's navigation helper so dashboard cards and tabs can route
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Determine active tab from route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setActiveTab('dashboard');
    } else if (path === '/admin/blog') {
      setActiveTab('blog');
    } else if (path === '/admin/contacts') {
      setActiveTab('contacts');
    } else if (path === '/admin/users') {
      setActiveTab('users');
    } else if (path === '/admin/orders') {
      setActiveTab('orders');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.stats);
      setError('');
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
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
    };
    const path = sectionMap[section] || '/admin';
    navigate(path);
  };

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'blog':
        return 'Blog Posts';
      case 'contacts':
        return 'Contact Submissions';
      case 'users':
        return 'User Management';
      case 'orders':
        return 'Orders';
      default:
        return 'Dashboard';
    }
  };

  // Get actions based on active tab
  const getActions = () => {
    if (activeTab === 'blog') {
      return (
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-text-inverted hover:opacity-90 rounded-lg text-sm font-medium transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]">
          <PlusIcon className="h-4 w-4" />
          New Post
        </button>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={getPageTitle()}
      subtitle={activeTab === 'dashboard' ? 'Overview of your website' : undefined}
      actions={getActions()}
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-surface-muted border border-border-subtle rounded-xl">
          <p className="text-sm text-text-primary">
            <strong>Note:</strong> <span className="text-text-secondary">{error}. Please log in as an admin to access full functionality.</span>
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      {activeTab === 'dashboard' && (
        <div className="mb-6">
          <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
            <DashboardOverview stats={stats} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'blog' && (
        <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
          <BlogManagement />
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
          <ContactManagement />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
          <UserManagement />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
          <OrderManagement />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
