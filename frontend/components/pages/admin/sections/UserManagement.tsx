import React, { useState, useEffect } from 'react';
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
  role: 'user' | 'admin';
  balance?: number;
  createdAt: string;
  photoURL?: string;
}

const UserManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      };
      const response = await adminAPI.getUsers(params);
      let filteredUsers = response.users || [];
      
      // Client-side role filter
      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter((user: User) => user.role === roleFilter);
      }
      
      setUsers(filteredUsers);
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
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
    });
    setIsFormOpen(true);
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

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.filter((u) => u._id !== selectedUser._id));
    showNotification('User deleted (local only – connect to backend later)', 'success');
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
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

        {/* Search and Filter */}
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
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
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
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('changeRole', 'admin')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50">Change to Admin</button>
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('changeRole', 'user')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50">Change to User</button>
                <button type="button" disabled={bulkSubmitting} onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50">Delete</button>
              </AdminBulkToolbar>
                <table className="w-full">
                  <thead className="bg-surface-muted border-b border-border-subtle">
                    <tr>
                      <th className="px-3 py-3 w-10"><input type="checkbox" checked={users.length > 0 && selectedIds.size === users.length} onChange={toggleSelectAll} className="rounded border-border-subtle text-brand-primary" aria-label="Select all" /></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Balance</th>
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
                            <img
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium text-text-primary">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin'
                              ? 'bg-surface-muted text-text-primary'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          ${user.balance?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-muted/90 rounded transition-colors duration-300 ease-out"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRoleChange(user)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-surface-muted/90 rounded transition-colors duration-300 ease-out"
                            >
                              <ShieldCheckIcon className="h-4 w-4" />
                              {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDeleteUserClick(user)}
                              className="p-2 text-text-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
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
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-muted border border-border-subtle hover:bg-surface-card rounded-lg transition-colors"
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
