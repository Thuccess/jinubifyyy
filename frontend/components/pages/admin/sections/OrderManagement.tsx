import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import Modal from '../../../admin/Modal';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import { AdminBulkToolbar } from '../../../admin/AdminBulkToolbar';
import { SearchIcon, ShoppingBagIcon, EyeIcon } from '../../../icons/Icons';

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  serviceName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    country?: string;
    city?: string;
    company?: string;
    industry?: string;
    notes?: string;
  };
  order?: {
    service?: string;
    serviceSlug?: string;
    packageName?: string;
    price?: number;
    currency?: string;
    pricingCategory?: string;
    sourcePage?: string;
    status?: Order['status'];
    orderTimestamp?: string;
  };
  adminNotes?: string;
}

const OrderManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('completed');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage, searchQuery, serviceFilter, countryFilter, dateFrom, dateTo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        serviceSlug: serviceFilter || undefined,
        country: countryFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await adminAPI.getOrders(params);
      setOrders(response.orders || []);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      showNotification('Order status updated successfully', 'success');
      fetchOrders();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotesDraft(order.adminNotes || '');
    setIsDetailOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size >= orders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(orders.map((o) => o._id)));
  };
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleBulkStatusUpdate = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkSubmitting(true);
    try {
      await adminAPI.bulkOrders(bulkStatus, ids);
      showNotification('Orders updated', 'success');
      setSelectedIds(new Set());
      fetchOrders();
    } catch (err: unknown) {
      showNotification('Failed to update orders', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedOrder) return;
    try {
      await adminAPI.updateOrder(selectedOrder._id, {
        status: selectedOrder.status,
        adminNotes: adminNotesDraft,
      });
      showNotification('Order notes updated successfully', 'success');
      setSelectedOrder({ ...selectedOrder, adminNotes: adminNotesDraft });
      fetchOrders();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to update order notes', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await adminAPI.deleteOrder(selectedOrder._id);
      showNotification('Order deleted successfully', 'success');
      setIsDetailOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete order', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-surface-muted text-text-secondary';
      case 'processing':
        return 'bg-brand-soft text-brand-primary';
      case 'completed':
        return 'bg-brand-soft text-brand-primary';
      case 'cancelled':
        return 'bg-surface-muted text-text-primary border border-border-strong';
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
          <h2 className="text-2xl font-bold text-text-primary">Orders Management</h2>
          <p className="text-text-secondary mt-1">View and manage customer orders</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by user name, email, or service..."
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by service slug"
              className="px-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent text-sm"
            />
            <input
              type="text"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by country"
              className="px-4 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent text-sm"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent text-xs"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-border-accent text-xs"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <AdminBulkToolbar selectedCount={selectedIds.size} onClearSelection={() => setSelectedIds(new Set())}>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  disabled={bulkSubmitting}
                  onClick={handleBulkStatusUpdate}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90 disabled:opacity-50"
                >
                  Update status
                </button>
              </AdminBulkToolbar>
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-3 w-10">
                        <input type="checkbox" checked={orders.length > 0 && selectedIds.size === orders.length} onChange={toggleSelectAll} className="rounded border-border-subtle text-brand-primary" aria-label="Select all" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-3 py-4 w-10">
                          <input type="checkbox" checked={selectedIds.has(order._id)} onChange={() => toggleSelectOne(order._id)} className="rounded border-border-subtle text-brand-primary" aria-label={`Select order ${order._id}`} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            #{order._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {order.customer?.name ||
                                (typeof order.userId === 'object' ? order.userId.name : 'Unknown User')}
                            </div>
                            <div className="text-xs text-text-muted">
                              {order.customer?.email ||
                                (typeof order.userId === 'object' ? order.userId.email : 'N/A')}
                            </div>
                            {order.customer?.phone && (
                              <div className="text-xs text-text-muted">{order.customer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">
                            {order.order?.service || order.serviceName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {order.order?.packageName || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          ${order.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {order.customer?.country || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(order.status)} focus:ring-2 focus:ring-brand-ring capitalize`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="p-2 text-brand-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
                              aria-label="View order details"
                            >
                              <EyeIcon className="h-4 w-4" />
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
                <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-surface-card border border-border-subtle rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Order ID
              </label>
              <p className="text-sm font-mono text-slate-900 dark:text-white">
                {selectedOrder._id}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account User
              </label>
              <p className="text-sm text-slate-900 dark:text-white">
                {typeof selectedOrder.userId === 'object' ? selectedOrder.userId.name : '—'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {typeof selectedOrder.userId === 'object' ? selectedOrder.userId.email : '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Service
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedOrder.order?.service || selectedOrder.serviceName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Package
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedOrder.order?.packageName || '—'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Price
              </label>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                ${selectedOrder.price.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedOrder._id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value as Order['status'] });
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-0 ${getStatusColor(selectedOrder.status)} focus:ring-2 focus:ring-brand-ring capitalize`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Created At
                </label>
                <p className="text-sm text-text-secondary">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
            </div>
            {selectedOrder.completedAt && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Completed At
                </label>
                <p className="text-sm text-text-secondary">
                  {formatDate(selectedOrder.completedAt)}
                </p>
              </div>
            )}
            {selectedOrder.customer && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Customer
                  </label>
                  <p className="text-sm text-text-secondary">
                    {selectedOrder.customer.name || '—'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {selectedOrder.customer.email || '—'}
                  </p>
                  {selectedOrder.customer.phone && (
                    <p className="text-xs text-text-muted">
                      {selectedOrder.customer.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Location
                  </label>
                  <p className="text-sm text-text-secondary">
                    {selectedOrder.customer.country || '—'}
                    {selectedOrder.customer.city ? `, ${selectedOrder.customer.city}` : ''}
                  </p>
                  {selectedOrder.customer.company && (
                    <p className="text-xs text-text-muted">
                      {selectedOrder.customer.company}
                    </p>
                  )}
                  {selectedOrder.customer.industry && (
                    <p className="text-xs text-text-muted">
                      {selectedOrder.customer.industry}
                    </p>
                  )}
                </div>
              </div>
            )}
            {selectedOrder.order && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Source
                  </label>
                  <p className="text-sm text-text-secondary">
                    {selectedOrder.order.sourcePage || '—'}
                  </p>
                  {selectedOrder.order.orderTimestamp && (
                    <p className="text-xs text-text-muted">
                      {formatDate(selectedOrder.order.orderTimestamp as any)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Service Slug
                  </label>
                  <p className="text-sm text-text-secondary">
                    {selectedOrder.order.serviceSlug || '—'}
                  </p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Admin Notes
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                rows={3}
                value={adminNotesDraft}
                onChange={(e) => setAdminNotesDraft(e.target.value)}
                placeholder="Internal notes about this order (only visible to admins)."
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={handleSaveAdminNotes}
                  className="px-3 py-1.5 text-xs font-medium text-text-inverted bg-brand-primary hover:opacity-90 rounded-lg transition-colors duration-300 ease-out"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-500/60 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Delete order
                </button>
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-muted hover:bg-surface-card rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Delete order?"
        message="This will permanently remove the order and its details. This action cannot be undone."
        confirmText="Delete order"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default OrderManagement;
