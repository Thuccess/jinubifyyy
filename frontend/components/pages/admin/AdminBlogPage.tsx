'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import BlogManagement from './sections/BlogManagement';

const AdminBlogPage: React.FC = () => (
  <AdminLayout title="Blog Posts" subtitle="Create and manage blog posts">
    <div className="card-solid rounded-2xl overflow-hidden">
      <BlogManagement />
    </div>
  </AdminLayout>
);

export default AdminBlogPage;
