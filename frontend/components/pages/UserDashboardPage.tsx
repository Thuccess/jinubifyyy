'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { ShoppingBagIcon, SparklesIcon, WalletIcon, CheckIcon, PaperAirplaneIcon, CogIcon } from '../icons/Icons';
import Icon from '../ui/Icon';
import AnimatedSection from '../AnimatedSection';
import Card from '../ui/Card';
import { userAPI, dashboardAPI, getStoredUser } from '../../services/api';

// --- Subcomponents for the Dashboard ---

const OverviewStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({
  icon,
  title,
  value,
}) => (
  <Card
    className="group flex-row items-center"
    size="sm"
    hover="lift"
    variant="subtle"
  >
    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-surface-muted rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-lg font-bold text-text-primary">{value}</p>
    </div>
  </Card>
);

const ActivityItem: React.FC<{ icon: React.ReactNode; text: string; time: string; }> = ({ icon, text, time }) => (
    <div className="flex items-start space-x-4 py-3">
        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-surface-muted rounded-full">
            {icon}
        </div>
        <div className="flex-grow">
            <p className="text-sm text-text-primary">{text}</p>
            <p className="text-xs text-text-muted">{time}</p>
        </div>
    </div>
);

// --- Main Dashboard Components ---

const ProfileCard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getProfile();
                const userData = response.user;
                const userObj: User = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    photoURL: userData.photoURL,
                    role: userData.role,
                    balance: userData.balance,
                    company: userData.company || '',
                    industry: userData.industry || '',
                    preferredChannels: userData.preferredChannels || [],
                    brandGuidelines: userData.brandGuidelines || {
                      primaryColor: '',
                      secondaryColor: '',
                      logoUrl: '',
                      toneOfVoice: '',
                    },
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                };
                setUser(userObj);
                setFormData(userObj);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
                // Fallback to stored user
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                    setFormData(storedUser);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setSuccessMessage('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) setFormData(user);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!formData) return;

        if (name.startsWith('brandGuidelines.')) {
            const key = name.split('.')[1] as 'primaryColor' | 'secondaryColor' | 'logoUrl' | 'toneOfVoice';
            setFormData(prev => ({
                ...prev!,
                brandGuidelines: {
                    ...(prev?.brandGuidelines || {}),
                    [key]: value,
                },
            }));
            return;
        }

        setFormData(prev => ({ ...prev!, [name]: value }));
    };

    const handlePreferredChannelToggle = (channel: string) => {
        if (!formData) return;
        const existing = formData.preferredChannels || [];
        const next = existing.includes(channel)
          ? existing.filter((c) => c !== channel)
          : [...existing, channel];
        setFormData(prev => ({ ...prev!, preferredChannels: next }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            try {
                const response = await userAPI.updateProfile({
                    name: formData.name,
                    photoURL: formData.photoURL,
                    company: formData.company,
                    industry: formData.industry,
                    preferredChannels: formData.preferredChannels,
                    brandGuidelines: formData.brandGuidelines,
                });
                const updatedUser: User = {
                    _id: response.user._id,
                    name: response.user.name,
                    email: response.user.email,
                    photoURL: response.user.photoURL,
                    role: response.user.role,
                    balance: response.user.balance,
                    company: response.user.company || '',
                    industry: response.user.industry || '',
                    preferredChannels: response.user.preferredChannels || [],
                    brandGuidelines: response.user.brandGuidelines || {
                      primaryColor: '',
                      secondaryColor: '',
                      logoUrl: '',
                      toneOfVoice: '',
                    },
                    createdAt: response.user.createdAt,
                    updatedAt: response.user.updatedAt,
                };
                setUser(updatedUser);
                setFormData(updatedUser);
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error: any) {
                console.error("Failed to update profile", error);
                setSuccessMessage('Failed to update profile. Please try again.');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        }
    };

    if (loading || !user || !formData) {
        return (
            <Card className="flex justify-center items-center h-64" size="lg" hover="none">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </Card>
        );
    }
    
    return (
         <Card size="lg">
            <div className="flex flex-col items-center text-center">
                <img className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg" src={formData.photoURL} alt="User avatar" />
                <div className="mt-4 w-full">
                     {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="sr-only">Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="block w-full text-center px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]" />
                            </div>
                            <div>
                                <label htmlFor="photoURL" className="sr-only">Photo URL</label>
                                <input type="text" id="photoURL" name="photoURL" value={formData.photoURL} onChange={handleInputChange} required className="block w-full text-center px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                              <div>
                                <label htmlFor="company" className="block text-xs font-medium text-text-secondary mb-1">
                                  Business / Company
                                </label>
                                <input
                                  type="text"
                                  id="company"
                                  name="company"
                                  value={formData.company || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-sm"
                                />
                              </div>
                              <div>
                                <label htmlFor="industry" className="block text-xs font-medium text-text-secondary mb-1">
                                  Industry
                                </label>
                                <input
                                  type="text"
                                  id="industry"
                                  name="industry"
                                  value={formData.industry || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-sm"
                                />
                              </div>
                            </div>
                            <div className="text-left space-y-2">
                              <p className="text-xs font-medium text-text-secondary">
                                Preferred channels
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {['Facebook', 'Instagram', 'X', 'YouTube', 'TikTok', 'WhatsApp'].map((channel) => {
                                  const checked = formData.preferredChannels?.includes(channel) ?? false;
                                  return (
                                    <button
                                      key={channel}
                                      type="button"
                                      onClick={() => handlePreferredChannelToggle(channel)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        checked
                                          ? 'bg-brand-soft border-brand-primary text-brand-primary'
                                          : 'bg-bg-secondary border-border-subtle text-text-secondary hover:bg-surface-muted/90'
                                      }`}
                                    >
                                      {channel}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-text-secondary">
                                  Brand colors (optional)
                                </p>
                                <input
                                  type="text"
                                  name="brandGuidelines.primaryColor"
                                  placeholder="Primary color (e.g. #1D4ED8)"
                                  value={formData.brandGuidelines?.primaryColor || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-xs"
                                />
                                <input
                                  type="text"
                                  name="brandGuidelines.secondaryColor"
                                  placeholder="Secondary color"
                                  value={formData.brandGuidelines?.secondaryColor || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-xs"
                                />
                                <input
                                  type="text"
                                  name="brandGuidelines.logoUrl"
                                  placeholder="Logo URL"
                                  value={formData.brandGuidelines?.logoUrl || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-xs"
                                />
                              </div>
                              <div className="space-y-2">
                                <label
                                  htmlFor="brandGuidelines.toneOfVoice"
                                  className="block text-xs font-medium text-text-secondary mb-1"
                                >
                                  Tone of voice
                                </label>
                                <textarea
                                  id="brandGuidelines.toneOfVoice"
                                  name="brandGuidelines.toneOfVoice"
                                  rows={4}
                                  value={formData.brandGuidelines?.toneOfVoice || ''}
                                  onChange={handleInputChange}
                                  className="block w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] text-xs"
                                  placeholder="Describe how your brand should sound in copy and captions."
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-center space-x-3 pt-2">
                                <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium btn-secondary rounded-lg focus-visible:ring-offset-2">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium btn-primary rounded-lg shadow-sm focus-visible:ring-offset-2">Save</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              Welcome, {user.name}!
                            </h1>
                            <p className="text-md text-slate-500 dark:text-slate-400 mt-1">
                              It&apos;s great to see you again.
                            </p>
                            <div className="mt-4 space-y-2 text-left w-full max-w-sm mx-auto">
                              {user.company && (
                                <p className="text-sm text-text-secondary">
                                  <span className="font-medium text-text-primary">Company:</span>{' '}
                                  {user.company}
                                </p>
                              )}
                              {user.industry && (
                                <p className="text-sm text-text-secondary">
                                  <span className="font-medium text-text-primary">Industry:</span>{' '}
                                  {user.industry}
                                </p>
                              )}
                              {user.preferredChannels && user.preferredChannels.length > 0 && (
                                <p className="text-xs text-text-muted">
                                  Prefers:{' '}
                                  {user.preferredChannels.join(', ')}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={handleEdit}
                              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                            >
                              Edit Profile & Brand
                            </button>
                        </>
                    )}
                    {successMessage && <p className="mt-4 text-center text-sm text-brand-primary animate-fade-in">{successMessage}</p>}
                </div>
            </div>
        </Card>
    );
}

const AccountOverview: React.FC = () => {
    const [data, setData] = useState({ balance: '0.00', totalOrders: 0, activeServices: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const response = await dashboardAPI.getOverview();
                setData(response);
            } catch (error) {
                console.error("Failed to fetch dashboard overview", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    return (
        <Card size="lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Account Overview</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <OverviewStatCard icon={<Icon icon={WalletIcon} size="md" tone="brand" />} title="Current Balance" value={`$${data.balance}`} />
                    <OverviewStatCard icon={<Icon icon={ShoppingBagIcon} size="md" tone="primary" />} title="Total Orders" value={data.totalOrders.toString()} />
                    <OverviewStatCard icon={<Icon icon={SparklesIcon} size="md" tone="primary" />} title="Active Services" value={data.activeServices.toString()} />
                </div>
            )}
        </Card>
    );
};

const RecentActivity: React.FC = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await dashboardAPI.getActivities({ limit: 5 });
                setActivities(response.activities || []);
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const formatTimeAgo = (date: string | Date): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <Icon icon={CheckIcon} size="sm" tone="brand" />;
            case 'payment':
                return <Icon icon={WalletIcon} size="sm" tone="primary" />;
            case 'profile_update':
                return <Icon icon={CogIcon} size="sm" tone="primary" />;
            default:
                return <Icon icon={CogIcon} size="sm" tone="primary" />;
        }
    };

    return (
        <Card size="lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Recent Activity</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
            ) : activities.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                    {activities.map((activity, index) => (
                        <ActivityItem 
                            key={activity._id || index}
                            icon={getActivityIcon(activity.type)} 
                            text={activity.description} 
                            time={formatTimeAgo(activity.createdAt)} 
                        />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 py-4">No recent activity</p>
            )}
        </Card>
    );
};

const Recommendations: React.FC = () => (
  <Card size="lg">
    <h2 className="text-xl font-bold text-text-primary mb-4">Recommended For You</h2>
    <div className="bg-surface-muted/80 backdrop-blur-sm p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-subtle shadow-lg">
      <div>
        <h3 className="font-bold text-text-primary">TikTok Growth Package</h3>
        <p className="text-sm text-text-secondary mt-1">
          Expand your reach on the fastest-growing platform.
        </p>
      </div>
      <button className="group flex-shrink-0 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold btn-primary rounded-lg shadow-md transition-all transform hover:scale-105 focus-visible:ring-offset-2">
        Explore Now{' '}
        <PaperAirplaneIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  </Card>
);

type DashboardOrder = {
  _id: string;
  serviceName: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
  completedAt?: string;
};

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getOrders({ page, limit: pageSize });
        setOrders(response.orders || []);
        if (response.pagination?.pages) {
          setTotalPages(response.pagination.pages);
        } else {
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard orders', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const formatDate = (value: string | Date | undefined) => {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card size="lg">
      <h2 className="text-xl font-bold text-text-primary mb-4">Your Orders</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-text-secondary py-4">
          You haven&apos;t placed any dashboard orders yet. When you create orders while logged in,
          they&apos;ll appear here.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">Quantity</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-3 py-2 text-text-primary">{order.serviceName}</td>
                    <td className="px-3 py-2 text-text-secondary">{order.quantity}</td>
                    <td className="px-3 py-2 font-medium text-text-primary">
                      ${order.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-muted text-text-secondary capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-text-secondary">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle bg-surface-card text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-muted/90 transition-colors duration-300 ease-out"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle bg-surface-card text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-muted/90 transition-colors duration-300 ease-out"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};


const UserDashboardPage: React.FC = () => {
    return (
        <div className="animate-fade-in min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
                    
                    {/* Left Column: Profile */}
                    <div className="lg:col-span-1">
                        <AnimatedSection>
                            <ProfileCard />
                        </AnimatedSection>
                    </div>

                    {/* Right Column: Dashboard Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <AnimatedSection>
                          <AccountOverview />
                        </AnimatedSection>
                        <AnimatedSection>
                          <OrdersList />
                        </AnimatedSection>
                         <AnimatedSection>
                          <RecentActivity />
                        </AnimatedSection>
                         <AnimatedSection>
                          <Recommendations />
                        </AnimatedSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;