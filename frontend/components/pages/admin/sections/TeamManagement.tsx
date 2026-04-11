import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from '@/components/NextImage';
import { adminAPI } from '../../../../services/api';
import type { TeamPagePayload, TeamMemberPayload, CeoFounderPayload } from '../../../../services/api';
import { useNotification } from '../../../admin/useNotification';
import Modal from '../../../admin/Modal';
import ConfirmDialog from '../../../admin/ConfirmDialog';
import { ImageUrlWithUpload } from '../../../ui/ImageUrlWithUpload';
import { PlusIcon, EditIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon, ArrowRightIcon, UserGroupIcon } from '../../../icons/Icons';
import { getImageUrl } from '../../../../utils/getImageUrl';

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-[color:var(--border-accent)] transition-colors';
const labelBase = 'block text-sm font-medium text-text-primary mb-1.5';

const defaultCeoFounder: CeoFounderPayload = {
  enabled: true,
  eyebrow: 'Leadership',
  sectionTitle: 'CEO & Founder',
  name: '',
  title: 'Chief Executive Officer',
  imageUrl: '',
  bio: '',
  detailedBio: '',
  quote: '',
  social: { linkedin: '', twitter: '', website: '' },
};

const defaultPayload: TeamPagePayload = {
  hero: {
    eyebrow: 'Our Team',
    heading: 'Meet the People Behind Jinubify',
    subtitle: 'We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.',
  },
  ceoFounder: { ...defaultCeoFounder },
  stripHeading: 'Browse team',
  showMembersSection: true,
  members: [],
};

const emptyMember: TeamMemberPayload = {
  name: '',
  role: '',
  imageUrl: '',
  bio: '',
  detailedBio: '',
  department: '',
  social: { linkedin: '', twitter: '', website: '' },
  order: 0,
};

const TeamManagement: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [data, setData] = useState<TeamPagePayload>(defaultPayload);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string>('hero');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TeamMemberPayload>(emptyMember);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await adminAPI.getTeam();
      setData({
        hero: res.hero ?? defaultPayload.hero,
        ceoFounder: { ...defaultCeoFounder, ...res.ceoFounder },
        stripHeading: res.stripHeading ?? defaultPayload.stripHeading,
        showMembersSection: res.showMembersSection !== false,
        members: (res.members || []).map((m, i) => ({ ...m, order: m.order ?? i })),
      });
    } catch (err) {
      setLoadError('Could not load team from server. Showing defaults. Check that the backend is running and you are logged in.');
      setData(defaultPayload);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const updateHero = (key: string, value: string) => {
    setData((prev) => ({ ...prev, hero: { ...prev.hero!, [key]: value } }));
  };

  const handleAddMember = () => {
    setEditingIndex(null);
    setFormData({ ...emptyMember, order: data.members?.length ?? 0 });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEditMember = (index: number) => {
    const m = data.members?.[index];
    if (!m) return;
    setEditingIndex(index);
    setFormData({
      name: m.name,
      role: m.role,
      imageUrl: m.imageUrl || '',
      bio: m.bio || '',
      detailedBio: m.detailedBio || '',
      department: m.department || '',
      social: { linkedin: m.social?.linkedin || '', twitter: m.social?.twitter || '', website: m.social?.website || '' },
      order: m.order ?? index,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDeleteMember = (index: number) => {
    setEditingIndex(index);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (editingIndex == null) return;
    setData((prev) => ({
      ...prev,
      members: (prev.members || []).filter((_, i) => i !== editingIndex),
    }));
    setIsDeleteOpen(false);
    setEditingIndex(null);
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const err: Record<string, string> = {};
    if (!formData.name?.trim()) err.name = 'Name is required';
    if (!formData.role?.trim()) err.role = 'Role is required';
    if (Object.keys(err).length > 0) {
      setFormErrors(err);
      return;
    }
    const member: TeamMemberPayload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      imageUrl: formData.imageUrl?.trim() || '',
      bio: formData.bio?.trim() || '',
      detailedBio: formData.detailedBio?.trim() || '',
      department: formData.department?.trim() || '',
      social: {
        linkedin: formData.social?.linkedin?.trim() || '',
        twitter: formData.social?.twitter?.trim() || '',
        website: formData.social?.website?.trim() || '',
      },
      order: formData.order ?? (data.members?.length ?? 0),
    };
    if (editingIndex !== null) {
      setData((prev) => {
        const next = [...(prev.members || [])];
        next[editingIndex] = member;
        return { ...prev, members: next };
      });
    } else {
      setData((prev) => ({ ...prev, members: [...(prev.members || []), member] }));
    }
    setIsFormOpen(false);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await adminAPI.updateTeam(data);
      showNotification('Team page saved to database. View it on the public site.', 'success');
      setLoadError(null);
    } catch (err: unknown) {
      showNotification((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save. Check backend and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <div className="border border-border-card rounded-2xl overflow-hidden bg-[color:var(--surface-card)] shadow-card">
      <button
        type="button"
        onClick={() => setOpenSection((s) => (s === id ? '' : id))}
        className="w-full flex items-center justify-between px-5 py-4 bg-[color:var(--surface-muted)]/50 hover:bg-[color:var(--surface-muted)]/70 text-left font-semibold text-text-primary transition-colors duration-200 rounded-t-2xl"
      >
        {title}
        {openSection === id ? <ChevronUpIcon className="h-5 w-5 text-text-muted" /> : <ChevronDownIcon className="h-5 w-5 text-text-muted" />}
      </button>
      {openSection === id && <div className="p-6 space-y-4 border-t border-border-subtle">{children}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 rounded-full border-2 border-border-subtle border-t-brand-primary animate-spin" />
        <p className="mt-4 text-sm text-text-secondary">Loading team from database…</p>
      </div>
    );
  }

  const members = data.members || [];

  return (
    <>
      <NotificationComponent />
      <div className="space-y-6">
        {/* Page header: title, description, actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Site content</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Team Page</h1>
            <p className="mt-2 text-sm text-text-secondary max-w-xl">
              Edit the hero, CEO &amp; Founder spotlight, and team members on <strong>/team</strong>. Save applies all sections together.
            </p>
            {loadError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex flex-wrap items-center gap-2">
                <span>{loadError}</span>
                <button type="button" onClick={fetchTeam} className="underline font-medium hover:no-underline">Retry</button>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/team"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-card bg-[color:var(--surface-card)] text-text-primary text-sm font-medium hover:bg-[color:var(--surface-muted)] transition-colors"
            >
              View team page
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--text-inverted)] font-medium text-sm shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {saving ? 'Saving…' : 'Save all changes'}
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section id="hero" title="Hero section">
            <p className="text-xs text-text-muted mb-2">This appears at the top of the public Team page.</p>
            <div className="space-y-4">
              <div>
                <label className={labelBase}>Eyebrow</label>
                <input type="text" value={data.hero?.eyebrow || ''} onChange={(e) => updateHero('eyebrow', e.target.value)} className={inputBase} placeholder="e.g. Our Team" />
              </div>
              <div>
                <label className={labelBase}>Heading</label>
                <input type="text" value={data.hero?.heading || ''} onChange={(e) => updateHero('heading', e.target.value)} className={inputBase} placeholder="e.g. Meet the People Behind Jinubify" />
              </div>
              <div>
                <label className={labelBase}>Subtitle</label>
                <textarea value={data.hero?.subtitle || ''} onChange={(e) => updateHero('subtitle', e.target.value)} className={inputBase} rows={3} placeholder="Short intro paragraph" />
              </div>
            </div>
          </Section>

          <Section id="ceo" title="CEO & Founder (spotlight)">
            <p className="text-xs text-text-muted mb-4">
              Shown after the hero and before the rotating team spotlight and thumbnail strip. Toggle off to hide the block on the public site.
            </p>
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={data.ceoFounder?.enabled !== false}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, enabled: e.target.checked },
                  }))
                }
                className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-brand-ring"
              />
              <span className="text-sm font-medium text-text-primary">Show CEO &amp; Founder section on public page</span>
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Eyebrow</label>
                  <input
                    type="text"
                    value={data.ceoFounder?.eyebrow || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, eyebrow: e.target.value },
                      }))
                    }
                    className={inputBase}
                    placeholder="e.g. Leadership"
                  />
                </div>
                <div>
                  <label className={labelBase}>Section title</label>
                  <input
                    type="text"
                    value={data.ceoFounder?.sectionTitle || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, sectionTitle: e.target.value },
                      }))
                    }
                    className={inputBase}
                    placeholder="e.g. CEO & Founder"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Name</label>
                  <input
                    type="text"
                    value={data.ceoFounder?.name || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, name: e.target.value },
                      }))
                    }
                    className={inputBase}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelBase}>Title</label>
                  <input
                    type="text"
                    value={data.ceoFounder?.title || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, title: e.target.value },
                      }))
                    }
                    className={inputBase}
                    placeholder="e.g. Founder & CEO"
                  />
                </div>
              </div>
              <div>
                <ImageUrlWithUpload
                  label="Photo"
                  value={data.ceoFounder?.imageUrl || ''}
                  onChange={(url) =>
                    setData((p) => ({
                      ...p,
                      ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, imageUrl: url },
                    }))
                  }
                  placeholder="Portrait URL or upload"
                />
              </div>
              <div>
                <label className={labelBase}>Short intro</label>
                <input
                  type="text"
                  value={data.ceoFounder?.bio || ''}
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, bio: e.target.value },
                    }))
                  }
                  className={inputBase}
                  placeholder="One line under the name"
                />
              </div>
              <div>
                <label className={labelBase}>Full bio</label>
                <textarea
                  value={data.ceoFounder?.detailedBio || ''}
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, detailedBio: e.target.value },
                    }))
                  }
                  className={inputBase}
                  rows={4}
                  placeholder="Longer story for the spotlight"
                />
              </div>
              <div>
                <label className={labelBase}>Quote (optional)</label>
                <textarea
                  value={data.ceoFounder?.quote || ''}
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      ceoFounder: { ...defaultCeoFounder, ...p.ceoFounder, quote: e.target.value },
                    }))
                  }
                  className={inputBase}
                  rows={2}
                  placeholder="Pull quote displayed in the card"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>LinkedIn</label>
                  <input
                    type="url"
                    value={data.ceoFounder?.social?.linkedin || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: {
                          ...defaultCeoFounder,
                          ...p.ceoFounder,
                          social: { ...defaultCeoFounder.social, ...p.ceoFounder?.social, linkedin: e.target.value },
                        },
                      }))
                    }
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Twitter / X</label>
                  <input
                    type="url"
                    value={data.ceoFounder?.social?.twitter || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: {
                          ...defaultCeoFounder,
                          ...p.ceoFounder,
                          social: { ...defaultCeoFounder.social, ...p.ceoFounder?.social, twitter: e.target.value },
                        },
                      }))
                    }
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Website</label>
                  <input
                    type="url"
                    value={data.ceoFounder?.social?.website || ''}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        ceoFounder: {
                          ...defaultCeoFounder,
                          ...p.ceoFounder,
                          social: { ...defaultCeoFounder.social, ...p.ceoFounder?.social, website: e.target.value },
                        },
                      }))
                    }
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section id="strip" title="Browse strip">
            <p className="text-xs text-text-muted mb-2">Heading above the team member thumbnails strip (only shown when the team members section is visible).</p>
            <div>
              <label className={labelBase}>Strip heading</label>
              <input type="text" value={data.stripHeading || ''} onChange={(e) => setData((p) => ({ ...p, stripHeading: e.target.value }))} className={inputBase} placeholder="e.g. Browse team" />
            </div>
          </Section>

          <Section id="members" title="Team members">
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={data.showMembersSection !== false}
                onChange={(e) => setData((p) => ({ ...p, showMembersSection: e.target.checked }))}
                className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-brand-ring"
              />
              <span className="text-sm font-medium text-text-primary">Show team members section on public Team page</span>
            </label>
            <p className="text-xs text-text-muted -mt-4 mb-6">
              When off, the featured profile and thumbnail strip are hidden; hero and CEO spotlight (if enabled) still show. You can keep member profiles here for later.
            </p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-secondary">Add, edit, or remove members. Order is preserved when you save.</p>
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--text-inverted)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <PlusIcon className="h-4 w-4" />
                Add member
              </button>
            </div>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-border-subtle bg-[color:var(--surface-muted)]/30">
                <UserGroupIcon className="h-14 w-14 text-text-muted" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary">No team members yet</h3>
                <p className="mt-1 text-sm text-text-secondary text-center max-w-sm">
                  Add members to display on the public Team page. Each member can have a photo, role, bio, and social links.
                </p>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--text-inverted)] text-sm font-medium hover:opacity-90"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add first member
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border-card overflow-hidden bg-[color:var(--surface-card)] shadow-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-[color:var(--surface-muted)]/60">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Member</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">Department</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {members.map((m, i) => (
                      <tr key={i} className="hover:bg-[color:var(--surface-muted)]/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {m.imageUrl ? (
                              <Image src={getImageUrl(m.imageUrl)} alt={m.name || 'Team member'} width={44} height={44} className="h-11 w-11 rounded-full object-cover bg-[color:var(--surface-muted)] ring-1 ring-border-subtle" />
                            ) : (
                              <div className="h-11 w-11 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center text-text-muted text-base font-medium ring-1 ring-border-subtle">
                                {(m.name || '?').charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-text-primary">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary hidden sm:table-cell">{m.role}</td>
                        <td className="px-5 py-3.5 text-sm text-text-muted hidden md:table-cell">{m.department || '—'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => handleEditMember(i)} className="p-2 text-brand-primary hover:bg-[color:var(--surface-muted)]/90 rounded-lg transition-colors" aria-label="Edit">
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteMember(i)} className="p-2 text-red-500 hover:bg-[color:var(--surface-muted)]/90 rounded-lg transition-colors" aria-label="Delete">
                              <DeleteIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingIndex !== null ? 'Edit member' : 'Add member'} size="lg">
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className={inputBase} placeholder="Full name" />
              {formErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>}
            </div>
            <div>
              <label className={labelBase}>Role *</label>
              <input type="text" value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} className={inputBase} placeholder="e.g. CEO, Lead Designer" />
              {formErrors.role && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.role}</p>}
            </div>
          </div>
          <div>
            <label className={labelBase}>Department</label>
            <input type="text" value={formData.department} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} className={inputBase} placeholder="e.g. Engineering, Growth" />
          </div>
          <div>
            <ImageUrlWithUpload
              label="Image URL"
              value={formData.imageUrl}
              onChange={(url) => setFormData((p) => ({ ...p, imageUrl: url }))}
              placeholder="https://… or upload a file"
            />
          </div>
          <div>
            <label className={labelBase}>Short bio</label>
            <input type="text" value={formData.bio} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} className={inputBase} placeholder="One line for cards" />
          </div>
          <div>
            <label className={labelBase}>Detailed bio</label>
            <textarea value={formData.detailedBio} onChange={(e) => setFormData((p) => ({ ...p, detailedBio: e.target.value }))} className={inputBase} rows={4} placeholder="Full bio shown in featured view on the team page" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelBase}>LinkedIn</label><input type="url" value={formData.social?.linkedin} onChange={(e) => setFormData((p) => ({ ...p, social: { ...p.social!, linkedin: e.target.value } }))} className={inputBase} placeholder="https://…" /></div>
            <div><label className={labelBase}>Twitter</label><input type="url" value={formData.social?.twitter} onChange={(e) => setFormData((p) => ({ ...p, social: { ...p.social!, twitter: e.target.value } }))} className={inputBase} placeholder="https://…" /></div>
            <div><label className={labelBase}>Website</label><input type="url" value={formData.social?.website} onChange={(e) => setFormData((p) => ({ ...p, social: { ...p.social!, website: e.target.value } }))} className={inputBase} placeholder="https://…" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2.5 text-sm font-medium btn-secondary rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2.5 text-sm font-medium btn-primary rounded-lg">{editingIndex !== null ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setEditingIndex(null); }}
        onConfirm={confirmDelete}
        title="Remove team member"
        message={editingIndex != null && members[editingIndex] ? `Remove "${members[editingIndex].name}" from the team list? You can add them again later.` : 'Remove this member?'}
        confirmText="Remove"
        variant="danger"
      />
    </>
  );
};

export default TeamManagement;
