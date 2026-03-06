'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import TestimonialManagement from './sections/TestimonialManagement';

const AdminTestimonialsPage: React.FC = () => (
  <AdminLayout title="Testimonials" subtitle="Manage testimonials">
    <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
      <TestimonialManagement />
    </div>
  </AdminLayout>
);

export default AdminTestimonialsPage;
