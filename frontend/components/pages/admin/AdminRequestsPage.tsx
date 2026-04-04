import React, { useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { SearchIcon, EyeIcon, DeleteIcon } from '../../icons/Icons';
import Modal from '../../admin/Modal';
import ConfirmDialog from '../../admin/ConfirmDialog';
import { useNotification } from '../../admin/useNotification';

interface Request {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  createdAt: string;
}

const AdminRequestsPage: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      service: 'Website Design & Development',
      message: 'I need a website for my business. Can you provide a quote?',
      status: 'new',
      createdAt: '2024-01-20',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      service: 'Social Media Management',
      message: 'Interested in the Growth Package for social media management.',
      status: 'contacted',
      createdAt: '2024-01-19',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+9876543210',
      service: 'Graphic Design & Branding',
      message: 'Need logo design and brand identity for startup.',
      status: 'quoted',
      createdAt: '2024-01-18',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (request: Request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: Request['status']) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  const handleDeleteClick = (request: Request) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  // For now this operates purely on local state; when a backend endpoint
  // exists, wire this up to an API call and then refetch.
  const confirmDelete = () => {
    if (!selectedRequest) return;
    setRequests(prev => prev.filter((req) => req.id !== selectedRequest.id));
    showNotification('Request deleted successfully', 'success');
    setIsDeleteDialogOpen(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'new':
        return 'bg-brand-soft text-brand-primary';
      case 'contacted':
        return 'bg-surface-muted text-text-secondary';
      case 'quoted':
        return 'bg-surface-muted text-text-primary';
      case 'converted':
        return 'bg-brand-soft text-brand-primary';
      case 'closed':
        return 'bg-surface-muted text-text-secondary';
      default:
        return 'bg-surface-muted text-text-secondary';
    }
  };

  return (
    <>
      <NotificationComponent />
      <AdminLayout
        title="Requests / Leads"
        subtitle="Manage customer inquiries and leads"
      >
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {request.email}
                        </div>
                        {request.phone && (
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {request.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                        {request.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value as Request['status'])}
                          className={`px-2 py-1 text-xs font-medium rounded border-0 ${getStatusColor(request.status)} focus:ring-2 focus:ring-brand-ring`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {request.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(request)}
                            className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                            aria-label="View request"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(request)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            aria-label="Delete request"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      {/* View Request Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Request Details"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.email}</p>
            </div>
            {selectedRequest.phone && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.phone}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Service
              </label>
              <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.service}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                {selectedRequest.message}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
              <select
                value={selectedRequest.status}
                onChange={(e) => {
                  handleStatusChange(selectedRequest.id, e.target.value as Request['status']);
                  setSelectedRequest({ ...selectedRequest, status: e.target.value as Request['status'] });
                }}
                className={`px-3 py-2 text-sm font-medium rounded border-0 ${getStatusColor(selectedRequest.status)} focus:ring-2 focus:ring-brand-ring`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-sm font-medium text-text-inverted bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Request"
        message={`Are you sure you want to delete the request from "${selectedRequest?.name}"? This action cannot be undone.`}
        variant="danger"
      />
    </>
  );
};

export default AdminRequestsPage;
