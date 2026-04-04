 'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PostsIcon, CodeBracketIcon, MegaphoneIcon, LinkIcon, CogIcon, PencilSquareIcon, DeleteIcon, PlusIcon } from '../../icons/Icons';
import { adminCmsAPI, siteAPI } from '../../../services/api';
import { useCms } from '../../../contexts/CmsContext';
import { useAuth } from '../../../contexts/AuthContext';

type NavItemRecord = {
  _id: string;
  label: string;
  href: string;
  order: number;
  isVisible?: boolean;
  isDeleted?: boolean;
  status?: string;
};

type SiteSettingRecord = {
  _id?: string;
  key: string;
  value: unknown;
  order?: number;
  isVisible?: boolean;
};

const DEFAULT_SOCIALS = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
};

const SECTION_TYPE_OPTIONS: Array<{ id: string; label: string; description: string }> = [
  { id: 'hero', label: 'Hero', description: 'Large hero banner with headline and CTA.' },
  { id: 'text', label: 'Text', description: 'Simple text block with heading and body.' },
  { id: 'grid', label: 'Grid', description: 'Multi-column grid of items or features.' },
  { id: 'faq', label: 'FAQ', description: 'Questions and answers in an accordion.' },
  { id: 'gallery', label: 'Gallery', description: 'Image gallery or logo strip.' },
  { id: 'stats', label: 'Stats', description: 'Numeric stats or KPI highlights.' },
  { id: 'cta', label: 'Call to action', description: 'Prominent CTA banner with button.' },
  { id: 'form', label: 'Form', description: 'Configurable form section.' },
];

type PageMetaEditorProps = {
  page: Record<string, unknown>;
  saving: string | null;
  role?: string;
  onChange: (page: Record<string, unknown>) => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
};

const PageMetaEditor: React.FC<PageMetaEditorProps> = ({ page, saving, role, onChange, onSave }) => {
  const id = String(page._id ?? '');
  const status = String(page.status ?? 'draft');
  const seo = (page.seo as { metaTitle?: string; metaDescription?: string; keywords?: string[] }) || {};
  const handleFieldChange = (key: string, value: unknown) => {
    onChange({ ...page, [key]: value });
  };
  const handleSeoChange = (key: 'metaTitle' | 'metaDescription' | 'keywords', value: unknown) => {
    const nextSeo = {
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      [key]: key === 'keywords' && typeof value === 'string' ? value.split(',').map((k) => k.trim()).filter(Boolean) : value,
    };
    onChange({ ...page, seo: nextSeo });
  };

  const isSaving = saving === id;
  const isEditorOnly = role === 'editor';

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          slug: page.slug,
          title: page.title,
          type: page.type,
          isVisible: page.isVisible,
          status: page.status,
          seo: {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            keywords: seo.keywords,
          },
        });
      }}
    >
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Slug</label>
        <input
          type="text"
          value={String(page.slug ?? '')}
          onChange={(e) => handleFieldChange('slug', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          placeholder="/about"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input
          type="text"
          value={String(page.title ?? '')}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Type</label>
          <select
            value={String(page.type ?? 'landing')}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="home">Home</option>
            <option value="about">About</option>
            <option value="service">Service</option>
            <option value="blog">Blog</option>
            <option value="legal">Legal</option>
            <option value="landing">Landing</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            {!isEditorOnly && <option value="published">Published</option>}
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={page.isVisible !== false}
            onChange={(e) => handleFieldChange('isVisible', e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-brand-primary"
          />
          Visible on site
        </label>
        {page.version && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">v{String(page.version)}</span>
        )}
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-white/5 space-y-2">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">SEO</p>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Meta title</label>
          <input
            type="text"
            value={seo.metaTitle || ''}
            onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Meta description</label>
          <textarea
            value={seo.metaDescription || ''}
            onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Keywords</label>
          <input
            type="text"
            value={Array.isArray(seo.keywords) ? seo.keywords.join(', ') : ''}
            onChange={(e) => handleSeoChange('keywords', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="seo, keywords, here"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 inline-flex justify-center px-3 py-2 rounded-lg btn-primary text-sm disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : status === 'published' ? 'Save & republish' : isEditorOnly && status === 'review' ? 'Save review' : 'Save draft'}
        </button>
        {isEditorOnly && status !== 'review' && (
          <button
            type="button"
            disabled={isSaving}
            onClick={async () => {
              await onSave({
                slug: page.slug,
                title: page.title,
                type: page.type,
                isVisible: page.isVisible,
                status: 'review',
                seo: {
                  metaTitle: seo.metaTitle,
                  metaDescription: seo.metaDescription,
                  keywords: seo.keywords,
                },
              });
            }}
            className="inline-flex px-3 py-2 rounded-lg border border-amber-500 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Submit for review
          </button>
        )}
      </div>
    </form>
  );
};

const AdminContentPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'site' | 'pages' | 'sections' | 'media'>('site');
  const [navItems, setNavItems] = useState<NavItemRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [navEditId, setNavEditId] = useState<string | null>(null);
  const [navEditLabel, setNavEditLabel] = useState('');
  const [navEditHref, setNavEditHref] = useState('');
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');
  const [pages, setPages] = useState<
    Array<{
      _id: string;
      slug: string;
      title: string;
      type?: string;
      isVisible?: boolean;
      status?: string;
      order?: number;
      seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
      version?: number;
    }>
  >([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageDetail, setPageDetail] = useState<{ page: Record<string, unknown>; sections: Array<Record<string, unknown>> } | null>(null);
  const [pageFilters, setPageFilters] = useState<{ type: string; status: string; search: string }>({
    type: 'all',
    status: 'all',
    search: '',
  });
  const [editingPage, setEditingPage] = useState<Record<string, unknown> | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSectionForm, setNewSectionForm] = useState<{ sectionKey: string; type: string; heading: string; body: string }>({
    sectionKey: '',
    type: 'text',
    heading: '',
    body: '',
  });
  const [sectionContentDraft, setSectionContentDraft] = useState<{ sectionId: string; heading: string; body: string } | null>(null);
  const { refetch: refetchCms } = useCms();
  const { currentUser } = useAuth();

  const showError = useCallback((message: string) => {
    // Surface a simple, non-intrusive error to the editor.
    // eslint-disable-next-line no-alert
    window.alert(message);
  }, []);

  const contentSections = [
    { id: 'site', label: 'Site & Navigation', icon: <LinkIcon className="h-5 w-5" /> },
    { id: 'pages', label: 'Pages', icon: <CodeBracketIcon className="h-5 w-5" /> },
    { id: 'sections', label: 'Content Sections', icon: <PostsIcon className="h-5 w-5" /> },
    { id: 'media', label: 'Media Library', icon: <MegaphoneIcon className="h-5 w-5" /> },
  ];

  const loadNav = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCmsAPI.getNav();
      const data = (res.data || []) as NavItemRecord[];
      setNavItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load nav error:', e);
      showError('Failed to load navigation items. Please try again.');
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSiteSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCmsAPI.getSiteSettings();
      const data = (res.data || []) as SiteSettingRecord[];
      const list = Array.isArray(data) ? data : [];
      if (!list.some((s) => s.key === 'socials')) {
        list.push({ key: 'socials', value: DEFAULT_SOCIALS });
      }
      setSiteSettings(list);
    } catch (e) {
      console.error('Load site settings error:', e);
      showError('Failed to load site settings. Please try again.');
      setSiteSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'site') {
      loadNav();
      loadSiteSettings();
    }
  }, [activeSection, loadNav, loadSiteSettings]);

  const handleSaveNavItem = async (id: string) => {
    if (!navEditLabel.trim() || !navEditHref.trim()) return;
    const href = navEditHref.trim().startsWith('/') ? navEditHref.trim() : `/${navEditHref.trim()}`;
    setSaving(id);
    try {
      await adminCmsAPI.updateNavItem(id, { label: navEditLabel.trim(), href });
      setNavEditId(null);
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Update nav error:', e);
      showError('Failed to update navigation item. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleNavVisible = async (item: NavItemRecord) => {
    setSaving(item._id);
    try {
      await adminCmsAPI.updateNavItem(item._id, { isVisible: !item.isVisible });
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Toggle nav visible error:', e);
      showError('Failed to change visibility. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteNavItem = async (id: string) => {
    if (!window.confirm('Hide this item from the public menu? You can restore visibility from the list.')) return;
    setSaving(id);
    try {
      await adminCmsAPI.updateNavItem(id, { isDeleted: true });
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Delete nav error:', e);
      showError('Failed to hide menu item. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleAddNavItem = async () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) return;
    const href = newNavHref.trim().startsWith('/') ? newNavHref.trim() : `/${newNavHref.trim()}`;
    setSaving('new');
    try {
      await adminCmsAPI.createNavItem({ label: newNavLabel.trim(), href });
      setNewNavLabel('');
      setNewNavHref('');
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Create nav error:', e);
      showError('Failed to create navigation item. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveSiteSetting = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      if (key === 'socials') {
        await siteAPI.putSocials(value as any);
      } else {
        await adminCmsAPI.putSiteSetting({ key, value });
      }
      await loadSiteSettings();
      refetchCms();
    } catch (e) {
      console.error('Save site setting error:', e);
      showError('Failed to save site setting. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const params: { type?: string; status?: string; search?: string } = {};
      if (pageFilters.type !== 'all') params.type = pageFilters.type;
      if (pageFilters.status !== 'all') params.status = pageFilters.status;
      if (pageFilters.search.trim()) params.search = pageFilters.search.trim();
      const res = await adminCmsAPI.getPages(params);
      const data = (res.data || []) as Array<{ _id: string; slug: string; title: string }>;
      setPages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load pages error:', e);
      showError('Failed to load pages. Please try again.');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [pageFilters]);

  const loadPageDetail = useCallback(async (pageId: string) => {
    setSelectedPageId(pageId);
    setLoading(true);
    try {
      const res = await adminCmsAPI.getPage(pageId);
      const data = res.data as { sections?: Array<Record<string, unknown>> } & Record<string, unknown>;
      setPageDetail({ page: data, sections: (data?.sections ?? []) as Array<Record<string, unknown>> });
    } catch (e) {
      console.error('Load page detail error:', e);
      showError('Failed to load page details. Please try again.');
      setPageDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateSection = async (pageId: string, sectionId: string, payload: Record<string, unknown>) => {
    setSaving(sectionId);
    try {
      await adminCmsAPI.updateSection(pageId, sectionId, payload);
      if (selectedPageId === pageId) await loadPageDetail(pageId);
      refetchCms();
    } catch (e) {
      console.error('Update section error:', e);
      showError('Failed to update section. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteSection = async (pageId: string, sectionId: string) => {
    if (!window.confirm('Hide this section from the public page?')) return;
    setSaving(sectionId);
    try {
      await adminCmsAPI.deleteSection(pageId, sectionId);
      if (selectedPageId === pageId) await loadPageDetail(pageId);
      refetchCms();
    } catch (e) {
      console.error('Delete section error:', e);
      showError('Failed to hide section. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleDuplicateSection = async (pageId: string, section: { _id: string; sectionKey: string; type?: string; content?: Record<string, unknown>; isVisible?: boolean }) => {
    setSaving(section._id);
    try {
      await adminCmsAPI.createSection(pageId, {
        sectionKey: section.sectionKey,
        type: section.type || section.sectionKey,
        content: (section.content as Record<string, unknown>) || {},
        isVisible: section.isVisible !== false,
        status: 'draft',
      });
      if (selectedPageId === pageId) await loadPageDetail(pageId);
      refetchCms();
    } catch (e) {
      console.error('Duplicate section error:', e);
      showError('Failed to duplicate section. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleReorderSections = async (pageId: string, fromId: string, toId: string) => {
    if (!pageDetail) return;
    const sections = (pageDetail.sections as Array<{ _id: string; order?: number }>).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const fromIndex = sections.findIndex((s) => s._id === fromId);
    const toIndex = sections.findIndex((s) => s._id === toId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const updated = sections.slice();
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    try {
      setSaving('reorder');
      await Promise.all(
        updated.map((sec, index) =>
          adminCmsAPI.updateSection(pageId, sec._id, {
            order: index,
          })
        )
      );
      if (selectedPageId === pageId) await loadPageDetail(pageId);
      refetchCms();
    } catch (e) {
      console.error('Reorder sections error:', e);
      showError('Failed to reorder sections. Please try again.');
    } finally {
      setSaving(null);
      setDraggingSectionId(null);
      setDragOverSectionId(null);
    }
  };

  const handleCreateSection = async (pageId: string) => {
    const key = (newSectionForm.sectionKey || 'section').trim().replace(/\s+/g, '_').toLowerCase() || 'section';
    setSaving('new-section');
    try {
      await adminCmsAPI.createSection(pageId, {
        sectionKey: key,
        type: newSectionForm.type || 'text',
        content: { heading: newSectionForm.heading.trim(), body: newSectionForm.body.trim() },
        isVisible: true,
      });
      if (selectedPageId === pageId) await loadPageDetail(pageId);
      refetchCms();
      setShowAddSectionForm(false);
      setNewSectionForm({ sectionKey: '', type: 'text', heading: '', body: '' });
    } catch (e) {
      console.error('Create section error:', e);
      showError('Failed to add section. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    if (activeSection === 'pages') {
      loadPages();
      setSelectedPageId(null);
      setPageDetail(null);
    }
  }, [activeSection, loadPages]);

  const sortedNav = [...navItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <AdminLayout
      title="Content Management"
      subtitle="Manage website content, navigation, and media"
    >
      <div className="mb-6 border-b border-border-subtle">
        <nav className="flex flex-wrap gap-4 sm:space-x-8" aria-label="Content sections">
          {contentSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSection === section.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-subtle'
                }
              `}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-white/5 shadow-sm p-6">
        {activeSection === 'site' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Navigation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Edit menu items shown in the header. Changes appear on the public site immediately. Hide or reorder items here.
              </p>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {sortedNav.map((item) => (
                      <li
                        key={item._id}
                        className={`flex flex-wrap items-center gap-2 p-3 rounded-lg border ${
                          item.isDeleted ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'border-gray-200 dark:border-white/5'
                        }`}
                      >
                        {navEditId === item._id ? (
                          <>
                            <input
                              type="text"
                              value={navEditLabel}
                              onChange={(e) => setNavEditLabel(e.target.value)}
                              placeholder="Label"
                              className="flex-1 min-w-[120px] px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={navEditHref}
                              onChange={(e) => setNavEditHref(e.target.value)}
                              placeholder="Link (e.g. /about)"
                              className="flex-1 min-w-[120px] px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveNavItem(item._id)}
                              disabled={saving === item._id || !navEditLabel.trim() || !navEditHref.trim()}
                              className="px-3 py-1.5 text-sm btn-primary rounded-lg disabled:opacity-50"
                            >
                              {saving === item._id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setNavEditId(null)}
                              className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{item.href}</span>
                            {item.isDeleted && (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">Hidden</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNavEditId(item._id);
                                setNavEditLabel(item.label);
                                setNavEditHref(item.href);
                              }}
                              className="p-1.5 text-slate-500 hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              aria-label="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            {!item.isDeleted && (
                              <button
                                type="button"
                                onClick={() => handleToggleNavVisible(item)}
                                disabled={saving === item._id}
                                className="p-1.5 text-slate-500 hover:text-brand-primary rounded disabled:opacity-50"
                                aria-label={item.isVisible ? 'Hide' : 'Show'}
                              >
                                {item.isVisible ? 'Hide' : 'Show'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteNavItem(item._id)}
                              disabled={saving === item._id}
                              className="p-1.5 text-slate-500 hover:text-red-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              aria-label="Remove from menu"
                            >
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                    <input
                      type="text"
                      value={newNavLabel}
                      onChange={(e) => setNewNavLabel(e.target.value)}
                      placeholder="New label"
                      className="min-w-[120px] px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newNavHref}
                      onChange={(e) => setNewNavHref(e.target.value)}
                      placeholder="Link (e.g. /contact)"
                      className="min-w-[120px] px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleAddNavItem}
                      disabled={saving === 'new' || !newNavLabel.trim() || !newNavHref.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm btn-primary rounded-lg disabled:opacity-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {saving === 'new' ? 'Adding…' : 'Add item'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <CogIcon className="h-5 w-5" />
                Site settings
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Global key-value settings (e.g. site name, meta description). Edit and save to update the public site. For legal pages like Privacy Policy, Terms of Service, Refund Policy, and Disclaimer, create a CMS page with the appropriate slug and set the page <span className="font-semibold">Type</span> to <span className="font-mono">legal</span>.
              </p>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : (
                <ul className="space-y-3">
                  {siteSettings.map((s) => (
                    <SiteSettingRow
                      key={s.key}
                      item={s}
                      saving={saving}
                      onSave={(value) => handleSaveSiteSetting(s.key, value)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeSection === 'pages' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pages</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage CMS pages, SEO, and sections. Use filters to find pages quickly, then edit details on the right.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPage({
                    slug: '',
                    title: '',
                    type: 'landing',
                    status: 'draft',
                    isVisible: true,
                    seo: { metaTitle: '', metaDescription: '', keywords: [] },
                  });
                  setSelectedPageId(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                New page
              </button>
            </div>

            {loading && pages.length === 0 ? (
              <p className="text-sm text-slate-500">Loading pages…</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    value={pageFilters.search}
                    onChange={(e) => setPageFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Search by slug or title…"
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1 min-w-[160px]"
                  />
                  <select
                    value={pageFilters.type}
                    onChange={(e) => setPageFilters((prev) => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="all">All types</option>
                    <option value="home">Home</option>
                    <option value="about">About</option>
                    <option value="service">Service</option>
                    <option value="blog">Blog</option>
                    <option value="legal">Legal</option>
                    <option value="landing">Landing</option>
                  </select>
                  <select
                    value={pageFilters.status}
                    onChange={(e) => setPageFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/40 border-b border-gray-200 dark:border-white/5">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Slug</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Title</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {pages.map((p) => (
                          <tr key={p._id} className={selectedPageId === p._id ? 'bg-brand-soft/40 dark:bg-brand-soft/10' : ''}>
                            <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">{p.slug}</td>
                            <td className="px-3 py-2 text-slate-900 dark:text-white">{p.title || '—'}</td>
                            <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{p.type || '—'}</td>
                            <td className="px-3 py-2 text-xs">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full ${
                                  p.status === 'published'
                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                                    : p.status === 'draft'
                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  loadPageDetail(p._id);
                                  setEditingPage(p as any);
                                }}
                                className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-gray-200 dark:border-white/5 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">Page details</h4>
                    {editingPage ? (
                      <PageMetaEditor
                        page={editingPage}
                        saving={saving}
                        role={currentUser?.role}
                        onChange={setEditingPage}
                        onSave={async (payload) => {
                          const id = editingPage?._id ? String(editingPage._id) : null;
                          const rawSlug = String(payload.slug || editingPage?.slug || '').trim();
                          if (!rawSlug) {
                            showError('Slug is required.');
                            return;
                          }
                          const normalizedSlug = rawSlug
                            .replace(/^\/+/, '')
                            .replace(/\s+/g, '-')
                            .toLowerCase();
                          const title = String(payload.title || editingPage?.title || '').trim();
                          if (!title) {
                            showError('Title is required.');
                            return;
                          }

                          const body = {
                            ...payload,
                            slug: normalizedSlug,
                            title,
                          };

                          setSaving(id ?? 'new-page');
                          try {
                            if (id) {
                              await adminCmsAPI.updatePage(id, body as Record<string, unknown>);
                              await loadPages();
                              await loadPageDetail(id);
                            } else {
                              const res = await adminCmsAPI.createPage(body as any);
                              const created = res.data as { _id?: string };
                              const newId = String(created._id);
                              await loadPages();
                              await loadPageDetail(newId);
                              setEditingPage(created as any);
                            }
                            refetchCms();
                          } catch (e) {
                            console.error('Update page meta error:', e);
                            showError('Failed to save page. Please check the fields and try again.');
                          } finally {
                            setSaving(null);
                          }
                        }}
                      />
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select a page from the table to edit its meta and SEO.
                      </p>
                    )}
                  </div>
                </div>

                {selectedPageId && pageDetail && (
                  <div className="border border-gray-200 dark:border-white/5 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Sections for: {String(pageDetail.page?.slug ?? '')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Status: {String(pageDetail.page?.status ?? '')} · Visible: {String(pageDetail.page?.isVisible ?? true)}
                    </p>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200">Sections</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Drag rows to reorder</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSectionId(null);
                              setSectionContentDraft(null);
                              setShowAddSectionForm((prev) => !prev);
                              if (!showAddSectionForm) setNewSectionForm({ sectionKey: '', type: 'text', heading: '', body: '' });
                            }}
                            className="text-xs px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Add section
                          </button>
                        </div>
                      </div>
                      {showAddSectionForm && (
                        <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                          <h6 className="text-xs font-medium text-slate-700 dark:text-slate-200">New section</h6>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="col-span-2 sm:col-span-1">
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Key (e.g. intro)</span>
                              <input
                                type="text"
                                value={newSectionForm.sectionKey}
                                onChange={(e) => setNewSectionForm((f) => ({ ...f, sectionKey: e.target.value }))}
                                className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                                placeholder="intro"
                              />
                            </label>
                            <label>
                              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Type</span>
                              <select
                                value={newSectionForm.type}
                                onChange={(e) => setNewSectionForm((f) => ({ ...f, type: e.target.value }))}
                                className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                              >
                                {SECTION_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <label>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Heading</span>
                            <input
                              type="text"
                              value={newSectionForm.heading}
                              onChange={(e) => setNewSectionForm((f) => ({ ...f, heading: e.target.value }))}
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                              placeholder="Section heading"
                            />
                          </label>
                          <label>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Body</span>
                            <textarea
                              value={newSectionForm.body}
                              onChange={(e) => setNewSectionForm((f) => ({ ...f, body: e.target.value }))}
                              rows={3}
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 resize-y"
                              placeholder="Section body text"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCreateSection(selectedPageId)}
                              disabled={saving === 'new-section'}
                              className="text-xs px-3 py-1.5 rounded bg-brand-primary text-white hover:opacity-90 disabled:opacity-50"
                            >
                              {saving === 'new-section' ? 'Adding…' : 'Add section'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowAddSectionForm(false); setNewSectionForm({ sectionKey: '', type: 'text', heading: '', body: '' }); }}
                              className="text-xs px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      <ul className="space-y-2">
                        {(pageDetail.sections as Array<{ _id: string; sectionKey: string; type?: string; order?: number; isVisible?: boolean; content?: Record<string, unknown> }>)
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((sec) => {
                            const isDragging = draggingSectionId === sec._id;
                            const isDragOver = dragOverSectionId === sec._id && draggingSectionId !== sec._id;
                            const typeLabel = sec.type || sec.sectionKey;
                            return (
                              <li
                                key={sec._id}
                                draggable
                                onDragStart={() => setDraggingSectionId(sec._id)}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggingSectionId && draggingSectionId !== sec._id) {
                                    setDragOverSectionId(sec._id);
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (draggingSectionId && draggingSectionId !== sec._id) {
                                    void handleReorderSections(selectedPageId, draggingSectionId, sec._id);
                                  }
                                }}
                                onDragEnd={() => {
                                  setDraggingSectionId(null);
                                  setDragOverSectionId(null);
                                }}
                                className={`flex flex-col gap-2 p-2 rounded-lg border bg-slate-50 dark:bg-slate-800/50 border-gray-200 dark:border-white/5 ${
                                  isDragging ? 'opacity-60' : ''
                                } ${isDragOver ? 'ring-2 ring-brand-primary/60' : ''}`}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="cursor-move text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                    Drag
                                  </span>
                                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{sec.sectionKey}</span>
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
                                    {typeLabel}
                                  </span>
                                  <span className="text-xs text-slate-500">order {sec.order ?? 0}</span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      sec.isVisible !== false
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                                    }`}
                                  >
                                    {sec.isVisible !== false ? 'Visible' : 'Hidden'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSection(selectedPageId, sec._id, { isVisible: !(sec.isVisible !== false) })}
                                    disabled={saving === sec._id}
                                    className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                                  >
                                    {sec.isVisible !== false ? 'Hide' : 'Show'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateSection(selectedPageId, sec)}
                                    disabled={saving === sec._id}
                                    className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                                  >
                                    Duplicate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = editingSectionId === sec._id ? null : sec._id;
                                      setEditingSectionId(next);
                                      if (next === sec._id) {
                                        setSectionContentDraft({
                                          sectionId: sec._id,
                                          heading: String((sec.content as Record<string, unknown>)?.heading ?? ''),
                                          body: String((sec.content as Record<string, unknown>)?.body ?? ''),
                                        });
                                      } else {
                                        setSectionContentDraft(null);
                                      }
                                    }}
                                    className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSection(selectedPageId, sec._id)}
                                    disabled={saving === sec._id}
                                    className="ml-auto text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {editingSectionId === sec._id && (
                                  <div className="mt-1 border-t border-gray-200 dark:border-white/5 pt-2 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Section type
                                        <select
                                          value={sec.type || sec.sectionKey}
                                          onChange={(e) =>
                                            handleUpdateSection(selectedPageId, sec._id, {
                                              type: e.target.value,
                                            })
                                          }
                                          className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                          {SECTION_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Status
                                        <select
                                          value={String((sec as any).status ?? 'draft')}
                                          onChange={(e) =>
                                            handleUpdateSection(selectedPageId, sec._id, {
                                              status: e.target.value,
                                            })
                                          }
                                          className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        >
                                          <option value="draft">Draft</option>
                                          <option value="review">In review</option>
                                          <option value="published">Published</option>
                                          <option value="archived">Archived</option>
                                        </select>
                                      </label>
                                    </div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                                      Heading
                                      <input
                                        type="text"
                                        value={sectionContentDraft?.sectionId === sec._id ? sectionContentDraft.heading : String((sec.content as Record<string, unknown>)?.heading ?? '')}
                                        onFocus={() => {
                                          if (sectionContentDraft?.sectionId !== sec._id) {
                                            setSectionContentDraft({
                                              sectionId: sec._id,
                                              heading: String((sec.content as Record<string, unknown>)?.heading ?? ''),
                                              body: String((sec.content as Record<string, unknown>)?.body ?? ''),
                                            });
                                          }
                                        }}
                                        onChange={(e) => {
                                          setSectionContentDraft((d) =>
                                            d?.sectionId === sec._id ? { ...d, heading: e.target.value } : { sectionId: sec._id, heading: e.target.value, body: String((sec.content as Record<string, unknown>)?.body ?? '') }
                                          );
                                        }}
                                        className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Section heading"
                                      />
                                    </label>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                                      Body
                                      <textarea
                                        value={sectionContentDraft?.sectionId === sec._id ? sectionContentDraft.body : String((sec.content as Record<string, unknown>)?.body ?? '')}
                                        onFocus={() => {
                                          if (sectionContentDraft?.sectionId !== sec._id) {
                                            setSectionContentDraft({
                                              sectionId: sec._id,
                                              heading: String((sec.content as Record<string, unknown>)?.heading ?? ''),
                                              body: String((sec.content as Record<string, unknown>)?.body ?? ''),
                                            });
                                          }
                                        }}
                                        onChange={(e) => {
                                          setSectionContentDraft((d) =>
                                            d?.sectionId === sec._id ? { ...d, body: e.target.value } : { sectionId: sec._id, heading: String((sec.content as Record<string, unknown>)?.heading ?? ''), body: e.target.value }
                                          );
                                        }}
                                        rows={4}
                                        className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-y"
                                        placeholder="Section body"
                                      />
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const content = (sec.content as Record<string, unknown>) || {};
                                          const heading = sectionContentDraft?.sectionId === sec._id ? sectionContentDraft.heading : String(content.heading ?? '');
                                          const body = sectionContentDraft?.sectionId === sec._id ? sectionContentDraft.body : String(content.body ?? '');
                                          await handleUpdateSection(selectedPageId, sec._id, { content: { ...content, heading, body } });
                                          setSectionContentDraft(null);
                                        }}
                                        disabled={saving === sec._id}
                                        className="text-xs px-3 py-1.5 rounded bg-brand-primary text-white hover:opacity-90 disabled:opacity-50"
                                      >
                                        {saving === sec._id ? 'Saving…' : 'Save content'}
                                      </button>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Shown on the public page for this slug.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'sections' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Content Sections</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Manage reusable content sections that appear across multiple pages.
            </p>
            <div className="space-y-4">
              {['Hero Section', 'Features', 'Testimonials', 'FAQ', 'CTA Banner', 'Footer Content'].map((section) => (
                <div
                  key={section}
                  className="p-4 border border-gray-200 dark:border-white/5 rounded-lg hover:border-brand-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{section}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Edit section content</p>
                    </div>
                    <button className="px-3 py-1 text-sm text-brand-primary hover:bg-brand-soft rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'media' && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Media Library</h3>
            <p className="text-sm text-text-secondary mb-6">
              Upload and manage images, videos, and other media files used across the website.
            </p>
            <div className="border-2 border-dashed border-border-subtle rounded-lg p-12 text-center">
              <p className="text-text-muted mb-4">Media upload functionality will be implemented here</p>
              <button className="px-4 py-2 btn-primary rounded-lg text-sm font-medium focus-visible:ring-offset-2">
                Upload Media
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

function SiteSettingRow({
  item,
  saving,
  onSave,
}: {
  item: SiteSettingRecord;
  saving: string | null;
  onSave: (value: unknown) => void;
}) {
  const isSocials = item.key === 'socials';

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(String(item.value ?? ''));
  const [socialForm, setSocialForm] = useState({ ...DEFAULT_SOCIALS });
  const [socialError, setSocialError] = useState<string>('');

  useEffect(() => {
    if (isSocials) {
      // Accept either an object value or a JSON string.
      const v = item.value as any;
      if (v && typeof v === 'object') {
        setSocialForm({ ...DEFAULT_SOCIALS, ...v });
        return;
      }
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          if (parsed && typeof parsed === 'object') setSocialForm({ ...DEFAULT_SOCIALS, ...parsed });
        } catch {
          // ignore parse errors, fall back to defaults
        }
      }
      setSocialForm({ ...DEFAULT_SOCIALS });
      setSocialError('');
    } else {
      setValue(String(item.value ?? ''));
    }
  }, [item.value]);

  const handleSave = () => {
    if (isSocials) return;
    onSave(value);
    setEditing(false);
  };

  const handleSaveSocials = () => {
    setSocialError('');
    const next = { ...socialForm };
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'] as const;

    for (const platform of platforms) {
      const raw = String(next[platform] ?? '').trim();
      if (!raw) {
        next[platform] = '';
        continue;
      }

      try {
        const parsed = new URL(raw);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('Unsupported protocol');
        }
        next[platform] = parsed.toString();
      } catch {
        setSocialError(`Invalid URL for ${platform}. Use http(s) URLs only.`);
        return;
      }
    }

    onSave(next);
    setEditing(false);
  };

  return (
    <li className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-white/5">
      <span className="font-mono text-sm text-slate-700 dark:text-slate-300 w-32 shrink-0">{item.key}</span>

      {isSocials ? (
        <div className="flex-1 min-w-[320px] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                ['twitter', 'X (Twitter)'],
                ['instagram', 'Instagram'],
                ['facebook', 'Facebook'],
                ['linkedin', 'LinkedIn'],
                ['youtube', 'YouTube'],
                ['tiktok', 'TikTok'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block space-y-1">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <input
                  type="url"
                  value={String((socialForm as any)[key] ?? '')}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setSocialForm((p) => ({ ...p, [key]: nextVal }));
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  placeholder="https://..."
                />
              </label>
            ))}
          </div>

          {socialError && <p className="text-sm text-red-600 dark:text-red-400">{socialError}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSocials}
              disabled={saving === item.key}
              className="px-3 py-1.5 text-sm btn-primary rounded-lg disabled:opacity-50"
            >
              {saving === item.key ? 'Saving…' : 'Save socials'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSocialForm({ ...DEFAULT_SOCIALS, ...(item.value && typeof item.value === 'object' ? (item.value as any) : {}) });
                setSocialError('');
              }}
              className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          </div>
        </div>
      ) : editing ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 min-w-[200px] px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button onClick={handleSave} disabled={saving === item.key} className="px-3 py-1.5 text-sm btn-primary rounded-lg disabled:opacity-50">
            {saving === item.key ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate">{value || '(empty)'}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1.5 text-slate-500 hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Edit"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </li>
  );
}

export default AdminContentPage;
