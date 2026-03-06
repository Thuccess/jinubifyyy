'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import UserManagement from './sections/UserManagement';

const AdminUsersPage: React.FC = () => (
  <AdminLayout title="User Management" subtitle="Manage users and roles">
    <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
      <UserManagement />
    </div>
  </AdminLayout>
);

export default AdminUsersPage;
