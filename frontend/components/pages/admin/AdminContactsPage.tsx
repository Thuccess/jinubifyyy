'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import ContactManagement from './sections/ContactManagement';

const AdminContactsPage: React.FC = () => (
  <AdminLayout title="Contact Submissions" subtitle="Review and manage contact form submissions">
    <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
      <ContactManagement />
    </div>
  </AdminLayout>
);

export default AdminContactsPage;
