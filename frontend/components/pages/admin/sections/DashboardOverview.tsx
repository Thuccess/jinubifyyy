import React from 'react';
import { UserCircleIcon, EnvelopeIcon, ShoppingBagIcon, PostsIcon, ArrowRightIcon, CodeBracketIcon, TestimonialsIcon, DocumentTextIcon, TeamIcon, CurrencyDollarIcon } from '../../../icons/Icons';
import Card from '../../../ui/Card';
import Icon from '../../../ui/Icon';

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

interface DashboardOverviewProps {
  stats: Stats | null;
  onNavigate: (section: string) => void;
}

const StatCard: React.FC<{ 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, onClick }) => (
  <Card
    onClick={onClick}
    className={`group ${onClick ? 'cursor-pointer' : ''}`}
    size="md"
    hover={onClick ? 'lift' : 'none'}
    variant="subtle"
  >
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    {onClick && (
      <div className="mt-4 flex items-center text-sm text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>View details</span>
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </div>
    )}
  </Card>
);

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Services"
          // For now this is derived from the static services list in the
          // Services page. When a backend endpoint exists, replace this with
          // a real value from the API.
          value={6}
          icon={<Icon icon={CodeBracketIcon} size="md" tone="inverted" />}
          color="bg-brand-primary"
          onClick={() => onNavigate('services')}
        />
        <StatCard
          title="Total Leads"
          value={stats?.totalContacts || 0}
          icon={<Icon icon={EnvelopeIcon} size="md" tone="inverted" />}
          color="bg-brand-primary"
          onClick={() => onNavigate('contacts')}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<Icon icon={ShoppingBagIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          title="Total Blog Posts"
          value={stats?.totalBlogPosts || 0}
          icon={<Icon icon={PostsIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('blog')}
        />
        <StatCard
          title="Pending Contacts"
          value={stats?.pendingContacts || 0}
          icon={<Icon icon={EnvelopeIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('contacts')}
        />
        <StatCard
          title="Published Posts"
          value={stats?.publishedPosts || 0}
          icon={<Icon icon={PostsIcon} size="md" tone="inverted" />}
          color="bg-brand-primary"
          onClick={() => onNavigate('blog')}
        />
        <StatCard
          title="Testimonials"
          value={stats?.totalTestimonials ?? 0}
          icon={<Icon icon={TestimonialsIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('testimonials')}
        />
        <StatCard
          title="Applications"
          value={`${stats?.totalApplications ?? 0} total · ${stats?.newApplications ?? 0} new`}
          icon={<Icon icon={UserCircleIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('applications')}
        />
        <StatCard
          title="Investors"
          value={`${stats?.totalInvestors ?? 0} total · ${stats?.newInvestors ?? 0} new`}
          icon={<Icon icon={CurrencyDollarIcon} size="md" tone="inverted" />}
          color="bg-brand-primary"
          onClick={() => onNavigate('investors')}
        />
        <StatCard
          title="About Page"
          value="Edit"
          icon={<Icon icon={DocumentTextIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('about')}
        />
        <StatCard
          title="Team Page"
          value="Edit"
          icon={<Icon icon={TeamIcon} size="md" tone="primary" />}
          color="bg-surface-muted"
          onClick={() => onNavigate('team')}
        />
      </div>

      {/* Quick Actions */}
      <Card size="md" className="border border-border-subtle">
        <h2 className="text-xl font-bold text-text-primary mb-2">Quick actions</h2>
        <p className="text-sm text-text-secondary mb-4">
          Jump straight into the most common admin tasks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('blog')}
            className="p-4 border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out text-left"
          >
            <h3 className="font-semibold text-text-primary">Manage Blog Posts</h3>
            <p className="text-sm text-text-secondary mt-1">Create, edit, or delete blog posts</p>
          </button>
          <button
            onClick={() => onNavigate('contacts')}
            className="p-4 border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out text-left"
          >
            <h3 className="font-semibold text-text-primary">View Contacts</h3>
            <p className="text-sm text-text-secondary mt-1">Review contact form submissions</p>
          </button>
          <button
            onClick={() => onNavigate('users')}
            className="p-4 border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out text-left"
          >
            <h3 className="font-semibold text-text-primary">User Management</h3>
            <p className="text-sm text-text-secondary mt-1">Manage users and roles</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardOverview;
