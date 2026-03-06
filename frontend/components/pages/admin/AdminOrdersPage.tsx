'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import OrderManagement from './sections/OrderManagement';

const AdminOrdersPage: React.FC = () => (
  <AdminLayout title="Orders" subtitle="View and update orders">
    <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
      <OrderManagement />
    </div>
  </AdminLayout>
);

export default AdminOrdersPage;
