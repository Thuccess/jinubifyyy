import React, { useState, useEffect } from 'react';
import { blogAdminAPI, adminAPI } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import Modal from '../../../admin/Modal';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import { AdminBulkToolbar } from '../../../admin/AdminBulkToolbar';
import { ImageUrlWithUpload } from '../../../ui/ImageUrlWithUpload';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../../../icons/Icons';
import { getImageUrl } from '../../../../utils/getImageUrl';

type BlogStatus = 'draft' | 'review' | 'published' | 'archived';

interface BlogPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string | { name: string } | null;
  category: string;
  date?: string | Date;
  published: boolean;
  status?: BlogStatus;
  featured?: boolean;
  views?: number;
  tags?: string[];
  seo?: { title?: string; description?: string; keywords?: string[] };
}

function getAuthorDisplayName(author: BlogPost['author']): string {
  if (author == null) return '';
  if (typeof author === 'object' && 'name' in author) return author.name;
  return String(author);
}

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-[color:var(--border-accent)]';

const labelBase = 'block text-sm font-medium text-text-primary mb-1.5';

const BlogManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    author: '',
    category: '',
    published: true,
    status: 'draft',
    featured: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, filterStatus, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      };
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await blogAdminAPI.getAllPosts(params as any);
      setPosts(response.posts || []);
      setTotalPages(response.pagination?.pages ?? 1);
    } catch (err: unknown) {
      console.error('Error fetching blog posts:', err);
      showNotification('Failed to load blog posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setFormData({
      title: '', slug: '', excerpt: '', content: '', imageUrl: '', author: '', category: '',
      published: true, status: 'draft', featured: false
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      imageUrl: post.imageUrl, author: getAuthorDisplayName(post.author), category: post.category,
      published: post.published,
      status: (post.status as BlogStatus) || (post.published ? 'published' : 'draft'),
      featured: post.featured ?? false
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const toggleSelectAll = () => {
    const ids = posts.map((p) => p._id).filter(Boolean) as string[];
    if (ids.length === 0) return;
    if (selectedIds.size >= ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  const toggleSelectOne = (id: string | undefined) => {
    if (!id) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkSubmitting(true);
    try {
      await adminAPI.bulkBlog(action, ids);
      showNotification(
        action === 'delete' ? 'Posts deleted' : action === 'publish' ? 'Posts published' : 'Posts unpublished',
        'success'
      );
      setSelectedIds(new Set());
      fetchPosts();
    } catch (err: unknown) {
      console.error('Bulk action error:', err);
      showNotification('Bulk action failed', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      await blogAdminAPI.deletePost(selectedPost.slug);
      showNotification('Blog post deleted successfully', 'success');
      fetchPosts();
      setIsDeleteDialogOpen(false);
    } catch (err: unknown) {
      showNotification((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.slug?.trim()) errors.slug = 'Slug is required';
    if (!formData.excerpt?.trim()) errors.excerpt = 'Excerpt is required';
    if (!formData.content?.trim()) errors.content = 'Content is required';
    if (!formData.imageUrl?.trim()) errors.imageUrl = 'Image URL is required';
    if (!(typeof formData.author === 'string' ? formData.author : '').trim()) errors.author = 'Author is required';
    if (!formData.category?.trim()) errors.category = 'Category is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...formData, published: formData.status === 'published' };
      if (selectedPost) {
        await blogAdminAPI.updatePost(selectedPost.slug, payload as any);
        showNotification('Post updated successfully', 'success');
      } else {
        await blogAdminAPI.createPost(payload as any);
        showNotification('Post created successfully', 'success');
      }
      setIsFormOpen(false);
      fetchPosts();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: { field?: string; message?: string; param?: string; msg?: string }[] } } })?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const byField: Record<string, string> = {};
        data.errors.forEach((e: { field?: string; param?: string; message?: string; msg?: string }) => {
          const key = e.field ?? e.param ?? '';
          const message = e.message ?? e.msg ?? 'Invalid';
          if (key) byField[key] = message;
        });
        setFormErrors(byField);
        showNotification(data.message || 'Please fix the errors below', 'error');
      } else {
        setFormErrors({});
        showNotification(data?.message || 'Failed to save', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusLabel = (post: BlogPost) => {
    const s = post.status || (post.published ? 'published' : 'draft');
    return (s as string).charAt(0).toUpperCase() + (s as string).slice(1);
  };

  const getStatusStyles = (post: BlogPost) => {
    const s = post.status || (post.published ? 'published' : 'draft');
    if (s === 'published') return 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300';
    if (s === 'review') return 'bg-amber-500/12 text-amber-700 dark:text-amber-300';
    if (s === 'archived') return 'bg-text-muted/15 text-text-muted';
    return 'bg-slate-200/80 dark:bg-slate-600/40 text-slate-600 dark:text-slate-400';
  };

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Content</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Blog Posts</h1>
            <p className="mt-1 text-sm text-text-secondary max-w-xl">
              Create and manage articles for your public blog. Search and filter by status to find posts quickly.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 shrink-0 px-5 py-2.5 rounded-xl bg-text-primary text-text-inverted font-medium text-sm shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent-ring)] transition-opacity"
          >
            <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
            New post
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by title, author, category…"
              className={`${inputBase} pl-10`}
              aria-label="Search posts"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className={`${inputBase} w-full sm:w-auto min-w-[140px]`}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
              <p className="mt-4 text-sm text-text-muted">Loading posts…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--surface-muted)] text-text-muted">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5v-7.5H8.25v7.5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">No posts yet</h3>
              <p className="mt-1 text-sm text-text-secondary text-center max-w-sm">
                Create your first blog post to publish on the public blog.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text-primary text-text-inverted text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent-ring)]"
              >
                <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                Create post
              </button>
            </div>
          ) : (
            <>
              <AdminBulkToolbar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
              >
                <button
                  type="button"
                  disabled={bulkSubmitting}
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-primary text-text-inverted hover:opacity-90 disabled:opacity-50"
                >
                  Bulk publish
                </button>
                <button
                  type="button"
                  disabled={bulkSubmitting}
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50"
                >
                  Bulk unpublish
                </button>
                <button
                  type="button"
                  disabled={bulkSubmitting}
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  Bulk delete
                </button>
              </AdminBulkToolbar>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-[color:var(--surface-muted)]/60">
                      <th className="px-3 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={posts.length > 0 && selectedIds.size === posts.filter((p) => p._id).length}
                          onChange={toggleSelectAll}
                          className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
                          aria-label="Select all"
                        />
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Post</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">Author</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden lg:table-cell">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted w-20">Views</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Date</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {posts.map((post) => (
                      <tr key={post.slug} className="hover:bg-[color:var(--surface-muted)]/40 transition-colors">
                        <td className="px-3 py-3.5 w-10">
                          <input
                            type="checkbox"
                            checked={post._id ? selectedIds.has(post._id) : false}
                            onChange={() => toggleSelectOne(post._id)}
                            className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
                            aria-label={`Select ${post.title}`}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {post.imageUrl ? (
                              <img
                                src={getImageUrl(post.imageUrl)}
                                alt={post.title || 'Blog post cover'}
                                className="h-11 w-11 shrink-0 rounded-lg object-cover bg-[color:var(--surface-muted)]"
                              />
                            ) : (
                              <div className="h-11 w-11 shrink-0 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center text-text-muted">
                                <span className="text-lg font-medium">A</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-text-primary truncate max-w-[200px] sm:max-w-none">{post.title}</div>
                              <div className="text-xs text-text-muted truncate max-w-[200px] sm:max-w-none md:hidden">{post.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary hidden md:table-cell">
                          {getAuthorDisplayName(post.author)}
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[color:var(--accent-soft)] text-text-primary">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(post)}`}>
                            {getStatusLabel(post)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-muted tabular-nums">{post.views ?? 0}</td>
                        <td className="px-5 py-3.5 text-sm text-text-muted hidden sm:table-cell">{formatDate(post.date)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(post)}
                              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-[color:var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent-ring)]"
                              aria-label="Edit"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(post)}
                              className="p-2 rounded-lg text-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500/50"
                              aria-label="Delete"
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border-subtle bg-[color:var(--surface-muted)]/30">
                  <p className="text-sm text-text-muted">
                    Page <span className="font-medium text-text-primary">{currentPage}</span> of <span className="font-medium text-text-primary">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] disabled:opacity-50 disabled:pointer-events-none"
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

      {/* Create/Edit modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPost ? 'Edit post' : 'New post'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)] space-y-8 pr-1">
            {/* Basics */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">Basics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelBase}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputBase}
                    placeholder="Post title"
                    required
                  />
                  {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
                </div>
                <div>
                  <label className={labelBase}>URL slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                    className={inputBase}
                    placeholder="my-article"
                    required
                  />
                  <p className="mt-1 text-xs text-text-muted">/blog/{formData.slug || 'my-article'}</p>
                  {formErrors.slug && <p className="mt-1 text-xs text-red-500">{formErrors.slug}</p>}
                </div>
                <div />
                <div className="md:col-span-2">
                  <label className={labelBase}>Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    className={`${inputBase} resize-y min-h-[72px]`}
                    placeholder="Short summary for listings and SEO"
                    required
                  />
                  {formErrors.excerpt && <p className="mt-1 text-xs text-red-500">{formErrors.excerpt}</p>}
                </div>
              </div>
            </section>

            {/* Content */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">Content</h3>
              <div>
                <label className={labelBase}>Body</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className={`${inputBase} font-mono text-sm resize-y min-h-[240px]`}
                  placeholder="Write your post content (HTML supported)"
                  required
                />
                {formErrors.content && <p className="mt-1 text-xs text-red-500">{formErrors.content}</p>}
              </div>
            </section>

            {/* Media & publishing */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">Media & publishing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <ImageUrlWithUpload
                    label="Cover image URL"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    placeholder="https://example.com/image.jpg or upload a file"
                  />
                  {formErrors.imageUrl && <p className="mt-1 text-xs text-red-500">{formErrors.imageUrl}</p>}
                </div>
                <div>
                  <label className={labelBase}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Product"
                    required
                  />
                  {formErrors.category && <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>}
                </div>
                <div>
                  <label className={labelBase}>Author</label>
                  <input
                    type="text"
                    value={typeof formData.author === 'string' ? formData.author : ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={inputBase}
                    placeholder="Author name"
                    required
                  />
                  {formErrors.author && <p className="mt-1 text-xs text-red-500">{formErrors.author}</p>}
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <label className={`${labelBase} mb-0`}>Status</label>
                    <select
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: (e.target.value as BlogStatus), published: e.target.value === 'published' })}
                      className={`${inputBase} w-auto min-w-[140px]`}
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured ?? false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-border-subtle text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                    />
                    <span className="text-sm font-medium text-text-primary">Featured on blog</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border-subtle shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary hover:bg-[color:var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-text-primary text-text-inverted shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent-ring)]"
            >
              {submitting ? 'Saving…' : selectedPost ? 'Update post' : 'Create post'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete post"
        message={`Are you sure you want to delete "${selectedPost?.title}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default BlogManagement;
