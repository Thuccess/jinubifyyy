'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import AboutManagement from './sections/AboutManagement';

const AdminAboutPage: React.FC = () => (
  <AdminLayout title="About Page" subtitle="Edit about page content">
    <div className="card-solid rounded-2xl overflow-hidden">
      <AboutManagement />
    </div>
  </AdminLayout>
);

export default AdminAboutPage;
