'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import TestimonialManagement from './sections/TestimonialManagement';

const AdminTestimonialsPage: React.FC = () => (
  <AdminLayout title="Testimonials" subtitle="Manage testimonials">
    <div className="card-solid rounded-2xl overflow-hidden">
      <TestimonialManagement />
    </div>
  </AdminLayout>
);

export default AdminTestimonialsPage;
