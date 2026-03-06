'use client';

import React from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import TeamManagement from './sections/TeamManagement';

const AdminTeamPage: React.FC = () => (
  <AdminLayout title="Team Page" subtitle="Edit team page and members">
    <div className="glass-surface glass-surface--card rounded-2xl overflow-hidden">
      <TeamManagement />
    </div>
  </AdminLayout>
);

export default AdminTeamPage;
