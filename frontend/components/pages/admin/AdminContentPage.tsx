import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout';
import { PostsIcon, CodeBracketIcon, MegaphoneIcon, LinkIcon, CogIcon, PencilSquareIcon, DeleteIcon, PlusIcon } from '../../icons/Icons';
import { adminCmsAPI } from '../../../services/api';
import { useCms } from '../../../contexts/CmsContext';

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
  const [pages, setPages] = useState<Array<{ _id: string; slug: string; title: string; isVisible?: boolean; status?: string; order?: number }>>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageDetail, setPageDetail] = useState<{ page: Record<string, unknown>; sections: Array<Record<string, unknown>> } | null>(null);
  const { refetch: refetchCms } = useCms();

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
      setSiteSettings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load site settings error:', e);
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
    setSaving(id);
    try {
      await adminCmsAPI.updateNavItem(id, { label: navEditLabel.trim(), href: navEditHref.trim() });
      setNavEditId(null);
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Update nav error:', e);
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
    } finally {
      setSaving(null);
    }
  };

  const handleAddNavItem = async () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) return;
    setSaving('new');
    try {
      await adminCmsAPI.createNavItem({ label: newNavLabel.trim(), href: newNavHref.trim() });
      setNewNavLabel('');
      setNewNavHref('');
      await loadNav();
      refetchCms();
    } catch (e) {
      console.error('Create nav error:', e);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveSiteSetting = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      await adminCmsAPI.putSiteSetting({ key, value });
      await loadSiteSettings();
      refetchCms();
    } catch (e) {
      console.error('Save site setting error:', e);
    } finally {
      setSaving(null);
    }
  };

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCmsAPI.getPages();
      const data = (res.data || []) as Array<{ _id: string; slug: string; title: string; isVisible?: boolean; status?: string; order?: number }>;
      setPages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load pages error:', e);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPageDetail = useCallback(async (pageId: string) => {
    setSelectedPageId(pageId);
    setLoading(true);
    try {
      const res = await adminCmsAPI.getPage(pageId);
      const data = res.data as { sections?: Array<Record<string, unknown>> } & Record<string, unknown>;
      setPageDetail({ page: data, sections: (data?.sections ?? []) as Array<Record<string, unknown>> });
    } catch (e) {
      console.error('Load page detail error:', e);
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

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-6">
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
                          item.isDeleted ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700'
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
                Global key-value settings (e.g. site name, meta description). Edit and save to update the public site.
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Pages & Sections</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Manage CMS pages and their sections. Click a page to edit its sections (visibility, content, order). Changes apply to the public site when published.
            </p>
            {loading && pages.length === 0 ? (
              <p className="text-sm text-slate-500">Loading pages…</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {pages.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => loadPageDetail(p._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedPageId === p._id
                          ? 'border-brand-primary bg-brand-soft text-brand-primary'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-primary text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p.slug}
                    </button>
                  ))}
                </div>
                {selectedPageId && pageDetail && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Page: {String(pageDetail.page?.slug ?? '')} — {String(pageDetail.page?.title ?? '')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Status: {String(pageDetail.page?.status ?? '')} · Visible: {String(pageDetail.page?.isVisible ?? true)}
                    </p>
                    <div>
                      <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Sections</h5>
                      <ul className="space-y-2">
                        {(pageDetail.sections as Array<{ _id: string; sectionKey: string; order?: number; isVisible?: boolean; content?: Record<string, unknown> }>)
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((sec) => (
                            <li
                              key={sec._id}
                              className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                            >
                              <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{sec.sectionKey}</span>
                              <span className="text-xs text-slate-500">order {sec.order ?? 0}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${sec.isVisible !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'}`}>
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
                                onClick={() => handleDeleteSection(selectedPageId, sec._id)}
                                disabled={saving === sec._id}
                                className="text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
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
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-primary transition-colors cursor-pointer"
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
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(String(item.value ?? ''));
  useEffect(() => {
    setValue(String(item.value ?? ''));
  }, [item.value]);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  return (
    <li className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
      <span className="font-mono text-sm text-slate-700 dark:text-slate-300 w-32 shrink-0">{item.key}</span>
      {editing ? (
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
