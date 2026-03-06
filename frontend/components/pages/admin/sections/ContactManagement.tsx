import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import Modal from '../../../admin/Modal';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import { SearchIcon, EnvelopeIcon, DeleteIcon } from '../../../icons/Icons';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

const ContactManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter, currentPage, searchQuery]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await adminAPI.getContacts(params);
      let filteredContacts = response.contacts || [];
      
      // Client-side search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredContacts = filteredContacts.filter((contact: Contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.subject.toLowerCase().includes(query)
        );
      }
      
      setContacts(filteredContacts);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      showNotification('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await adminAPI.updateContactStatus(id, newStatus);
      showNotification('Contact status updated successfully', 'success');
      fetchContacts();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
    // Mark as read if status is new
    if (contact.status === 'new') {
      handleStatusUpdate(contact._id, 'read');
    }
  };

  const handleDeleteClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  // For now this is purely client-side deletion. When a backend delete/archiving
  // endpoint is available, call it here and then refetch contacts.
  const confirmDelete = () => {
    if (!selectedContact) return;
    setContacts(prev => prev.filter((c) => c._id !== selectedContact._id));
    showNotification('Contact deleted successfully', 'success');
    setIsDeleteDialogOpen(false);
    setSelectedContact(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-brand-soft text-brand-primary';
      case 'read':
        return 'bg-surface-muted text-text-secondary';
      case 'replied':
        return 'bg-brand-soft text-brand-primary';
      case 'archived':
        return 'bg-surface-muted text-text-secondary';
      default:
        return 'bg-surface-muted text-text-secondary';
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Contact Submissions</h2>
          <p className="text-text-secondary mt-1">Manage and respond to contact form submissions</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or subject..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-ring focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-ring focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Contacts Table */}
        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center">
              <EnvelopeIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No contacts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-muted border-b border-border-subtle">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-text-secondary max-w-xs truncate">{contact.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => handleStatusUpdate(contact._id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(contact.status)} focus:ring-2 focus:ring-brand-ring`}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(contact.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(contact)}
                              className="px-3 py-1.5 text-xs font-medium text-brand-primary hover:text-brand-primary hover:bg-surface-muted/90 rounded transition-colors duration-300 ease-out"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteClick(contact)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              aria-label="Delete contact"
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
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Contact Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Contact Details"
        size="md"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <p className="text-text-primary">{selectedContact.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <p className="text-text-primary">
                <a href={`mailto:${selectedContact.email}`} className="text-brand-primary hover:underline">
                  {selectedContact.email}
                </a>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Subject</label>
              <p className="text-text-primary">{selectedContact.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message</label>
              <p className="text-text-primary whitespace-pre-wrap bg-surface-muted p-4 rounded-lg">
                {selectedContact.message}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select
                value={selectedContact.status}
                onChange={(e) => {
                  handleStatusUpdate(selectedContact._id, e.target.value);
                  setSelectedContact({ ...selectedContact, status: e.target.value as any });
                }}
                className={`text-sm font-medium px-3 py-2 rounded-lg border ${getStatusColor(selectedContact.status)} focus:ring-2 focus:ring-brand-ring`}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Submitted</label>
              <p className="text-text-secondary">{formatDate(selectedContact.createdAt)}</p>
            </div>
            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                className="px-6 py-2 text-sm font-medium text-text-inverted bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] rounded-lg transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete the message from "${selectedContact?.name}"? This action cannot be undone.`}
        variant="danger"
      />
    </>
  );
};

export default ContactManagement;
