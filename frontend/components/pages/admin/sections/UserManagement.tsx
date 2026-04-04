import React, { useState, useEffect } from 'react';
import Image from '@/components/NextImage';
import { adminAPI } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import Modal from '../../../admin/Modal';
import { AdminBulkToolbar } from '../../../admin/AdminBulkToolbar';
import { SearchIcon, UserCircleIcon, ShieldCheckIcon, PlusIcon, DeleteIcon } from '../../../icons/Icons';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'editor' | 'super_admin';
  balance?: number;
  createdAt: string;
  photoURL?: string;
  company?: string;
  status?: 'pending' | 'approved' | 'rejected';
  lastLoginAt?: string;
}

const UserManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Pick<User, 'name' | 'email' | 'role'>>({
    name: '',
    email: '',
    role: 'user',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [messageUser, setMessageUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<
    { id: string; message: string; created_at: string; sender_id: string; receiver_id: string }[]
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, statusTab, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      };
      let response;
      if (statusTab === 'all') {
        response = await adminAPI.getUsers(params);
      } else {
        response = await adminAPI.getUsersByStatus(statusTab, params);
      }

      setUsers(response.users || []);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role === 'admin' ? 'user' : 'admin');
    setIsRoleDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.updateUserRole(selectedUser._id, newRole);
      showNotification(`User role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  const handleCreateUser = () => {
    showNotification('Users are created via registration and approved here.', 'info');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size >= users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u._id)));
  };
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleBulkAction = async (action: 'changeRole' | 'delete', role?: 'user' | 'admin') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (action === 'changeRole' && !role) return;
    setBulkSubmitting(true);
    try {
      await adminAPI.bulkUsers(action, ids, role);
      showNotification(action === 'delete' ? 'Users deleted' : `Role updated to ${role}`, 'success');
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err: unknown) {
      showNotification('Bulk action failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  // For now this is purely client-side create/edit/delete. When admin user
  // management endpoints exist on the backend, replace this with real API calls
  // and refetch from the server.
  const handleSubmitUser = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showNotification('Name and email are required', 'error');
      return;
    }

    if (selectedUser) {
      // Local edit only
      setUsers(prev =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, name: formData.name, email: formData.email, role: formData.role }
            : u
        )
      );
      showNotification('User updated (local only – connect to backend later)', 'success');
    } else {
      const newUser: User = {
        _id: `local-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
      showNotification('User created (local only – connect to backend later)', 'success');
    }

    setIsFormOpen(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', role: 'user' });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsFormOpen(true);
  };

  const openMessageDialog = async (user: User) => {
    setMessageUser(user);
    setMessageInput('');
    setLoadingMessages(true);
    try {
      const res = await adminAPI.getUserMessages(user._id);
      setMessages(res.messages || []);
    } catch (err) {
      showNotification('Failed to load messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendAdminMessage = async () => {
    if (!messageUser || !messageInput.trim()) return;
    try {
      const res = await adminAPI.sendUserMessage(messageUser._id, { message: messageInput.trim() });
      setMessages(prev => [...prev, res.item]);
      setMessageInput('');
      showNotification('Message sent', 'success');
    } catch (err) {
      showNotification('Failed to send message', 'error');
    }
  };

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.deleteUser(selectedUser._id);
      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
            <p className="text-text-secondary mt-1">Manage users, roles, and access</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] text-text-inverted rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Search and Status Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  statusTab === tab
                    ? 'bg-brand-primary text-text-inverted border-brand-primary'
                    : 'border-border-subtle bg-surface-card text-text-primary hover:bg-surface-muted/80'
                }`}
              >
                {tab === 'all'
                  ? 'All Users'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface-card rounded-xl border border-border-card overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircleIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-slate-500 dark:text-text-muted">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <AdminBulkToolbar selectedCount={selectedIds.size} onClearSelection={() => setSelectedIds(new Set())}>
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('changeRole', 'admin')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50">Change to Admin</button>
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('changeRole', 'user')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50">Change to User</button>
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50">Delete</button>
              </AdminBulkToolbar>
                <table className="w-full">
                  <thead className="bg-surface-muted border-b border-border-subtle">
                    <tr>
                      <th className="px-3 py-3 w-10"><input type="checkbox" checked={users.length > 0 && selectedIds.size === users.length} onChange={toggleSelectAll} className="rounded border-border-subtle text-brand-primary" aria-label="Select all" /></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-3 py-4 w-10"><input type="checkbox" checked={selectedIds.has(user._id)} onChange={() => toggleSelectOne(user._id)} className="rounded border-border-subtle text-brand-primary" aria-label={`Select ${user.name}`} /></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                              unoptimized
                            />
                            <div>
                              <div className="text-sm font-medium text-text-primary">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {user.status === 'approved' && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                              Approved
                            </span>
                          )}
                          {user.status === 'pending' && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                              Pending
                            </span>
                          )}
                          {user.status === 'rejected' && (
                            <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
                              Rejected
                            </span>
                          )}
                          {!user.status && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900/60 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                              Approved
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {user.company || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openMessageDialog(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted/80 rounded-lg transition-colors"
                            >
                              Message
                            </button>
                            {user.status !== 'approved' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await adminAPI.approveUser(user._id);
                                    showNotification('User approved', 'success');
                                    fetchUsers();
                                  } catch (error: any) {
                                    showNotification(error.response?.data?.message || 'Failed to approve user', 'error');
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors duration-300 ease-out"
                              >
                                Approve
                              </button>
                            )}
                            {user.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await adminAPI.rejectUser(user._id);
                                    showNotification('User rejected', 'success');
                                    fetchUsers();
                                  } catch (error: any) {
                                    showNotification(error.response?.data?.message || 'Failed to reject user', 'error');
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition-colors duration-300 ease-out"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUserClick(user)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300 ease-out"
                              aria-label="Delete user"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-card rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-card rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
          setFormData({ name: '', email: '', role: 'user' });
        }}
        title={selectedUser ? 'Edit User' : 'Create User'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsFormOpen(false);
                setSelectedUser(null);
                setFormData({ name: '', email: '', role: 'user' });
              }}
              className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-muted border border-border-card hover:bg-surface-card rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitUser}
              className="px-4 py-2 text-sm font-medium text-text-inverted bg-brand-primary hover:opacity-90 rounded-lg transition-colors focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            >
              {selectedUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Admin ↔ Client Messages Modal */}
      <Modal
        isOpen={!!messageUser}
        onClose={() => {
          setMessageUser(null);
          setMessages([]);
          setMessageInput('');
        }}
        title={messageUser ? `Messages with ${messageUser.name}` : 'Messages'}
        size="lg"
      >
        <div className="flex flex-col gap-4 max-h-[480px]">
          <div className="flex-1 overflow-y-auto border border-border-card rounded-lg p-3 bg-surface-muted/40">
            {loadingMessages ? (
              <div className="h-24 flex items-center justify-center text-sm text-text-secondary">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No messages yet. Send a message below to start a conversation.
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => {
                  const fromAdmin = m.sender_id !== messageUser?._id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                          fromAdmin
                            ? 'bg-brand-primary text-text-inverted rounded-br-sm'
                            : 'bg-surface-card text-text-primary rounded-bl-sm'
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className="mt-1 text-[10px] opacity-80">
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
              placeholder={messageUser ? `Message ${messageUser.name}...` : 'Type a message...'}
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!messageInput.trim()}
                onClick={sendAdminMessage}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Role Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        onConfirm={confirmRoleChange}
        title={`${newRole === 'admin' ? 'Promote' : 'Demote'} User`}
        message={`Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} "${selectedUser?.name}" to ${newRole}?`}
        confirmText={newRole === 'admin' ? 'Promote' : 'Demote'}
        cancelText="Cancel"
        variant="warning"
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This will only affect local state until backend integration is added.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default UserManagement;
