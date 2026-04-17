'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import { useAuth } from '@/contexts/AuthContext';
import { LiveProfilePreview, type ProfileDraft } from '@/components/identity/LiveProfilePreview';
import { useIdentityAccess } from '@/components/identity/useIdentityAccess';
import { useIdentityProfile } from '@/components/identity/useIdentityProfile';
import { glassCard } from '@/components/identity/identityStyles';
import { userAPI } from '@/services/api';
import { colorInputValue, isValidProfileHex } from '@/lib/publicProfileTheme';

export default function IdentityProfileEditor() {
  const { profile, loading, refresh } = useIdentityProfile();
  const { refreshUser } = useAuth();
  const { canEditIdentity, isRejected } = useIdentityAccess();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    accountType: 'personal' as 'personal' | 'business',
    name: '',
    company: '',
    profileSlug: '',
    publicTagline: '',
    publicBio: '',
    professionalTitle: '',
    skillsExpertise: [] as string[],
    workExperience: [] as string[],
    educationCertifications: [] as string[],
    achievementsProjects: [] as string[],
    personalInterests: [] as string[],
    email: '',
    phone: '',
    website: '',
    location: '',
    servicesOffered: [] as string[],
    photoURL: '',
    brandGuidelines: {
      logoUrl: '' as string,
      primaryColor: '',
      secondaryColor: '',
      toneOfVoice: '',
      publicProfileAccentColor: '',
      publicProfileTextColor: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      accountType: (profile.accountType || 'personal') as 'personal' | 'business',
      name: profile.name || '',
      company: profile.company || '',
      profileSlug: profile.profileSlug || '',
      publicTagline: profile.publicTagline || '',
      publicBio: profile.publicBio || '',
      professionalTitle: profile.professionalTitle || '',
      skillsExpertise: profile.skillsExpertise?.length ? [...profile.skillsExpertise] : [''],
      workExperience: profile.workExperience?.length ? [...profile.workExperience] : [''],
      educationCertifications: profile.educationCertifications?.length
        ? [...profile.educationCertifications]
        : [''],
      achievementsProjects: profile.achievementsProjects?.length ? [...profile.achievementsProjects] : [''],
      personalInterests: profile.personalInterests?.length ? [...profile.personalInterests] : [''],
      email: profile.email || '',
      phone: profile.phone || '',
      website: profile.website || '',
      location: profile.location || '',
      servicesOffered: profile.servicesOffered?.length ? [...profile.servicesOffered] : [''],
      photoURL: profile.photoURL || '',
      brandGuidelines: {
        logoUrl: profile.brandGuidelines?.logoUrl || '',
        primaryColor: profile.brandGuidelines?.primaryColor || '',
        secondaryColor: profile.brandGuidelines?.secondaryColor || '',
        toneOfVoice: profile.brandGuidelines?.toneOfVoice || '',
        publicProfileAccentColor: profile.brandGuidelines?.publicProfileAccentColor || '',
        publicProfileTextColor: profile.brandGuidelines?.publicProfileTextColor || '',
      },
    });
  }, [profile]);

  const draft: ProfileDraft = useMemo(
    () => ({
      accountType: form.accountType,
      name: form.name,
      company: form.company,
      photoURL: form.photoURL,
      publicTagline: form.publicTagline,
      publicBio: form.publicBio,
      website: form.website,
      phone: form.phone,
      email: form.email,
      profileSlug: form.profileSlug,
      socialLinks: profile?.socialLinks,
      brandGuidelines: form.brandGuidelines,
    }),
    [form, profile?.socialLinks],
  );

  const slugPreview = (form.profileSlug || 'your-handle').toLowerCase().replace(/\s+/g, '-');

  const onImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'logo') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !canEditIdentity) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be under 5MB.');
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const { url, image } = await userAPI.uploadProfileImage(file);
      const u = url || image || '';
      if (!u) throw new Error('Upload failed');
      if (field === 'logo') {
        const nextBg = { ...form.brandGuidelines, logoUrl: u };
        setForm((prev) => ({ ...prev, brandGuidelines: nextBg }));
        await userAPI.updateProfile({
          brandGuidelines: {
            ...form.brandGuidelines,
            logoUrl: u,
          },
        });
      } else {
        setForm((prev) => ({ ...prev, photoURL: u }));
        await userAPI.updateProfile({ photoURL: u });
      }
      await refresh();
      await refreshUser();
      setMessage('Image saved.');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setMessage(msg || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const setService = (i: number, v: string) => {
    setForm((prev) => {
      const next = [...prev.servicesOffered];
      next[i] = v;
      return { ...prev, servicesOffered: next };
    });
  };

  const addServiceRow = () => setForm((prev) => ({ ...prev, servicesOffered: [...prev.servicesOffered, ''] }));

  const removeServiceRow = (i: number) =>
    setForm((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter((_, idx) => idx !== i),
    }));

  const setListItem = (
    field:
      | 'skillsExpertise'
      | 'workExperience'
      | 'educationCertifications'
      | 'achievementsProjects'
      | 'personalInterests',
    i: number,
    v: string,
  ) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[i] = v;
      return { ...prev, [field]: next };
    });
  };

  const addListRow = (
    field:
      | 'skillsExpertise'
      | 'workExperience'
      | 'educationCertifications'
      | 'achievementsProjects'
      | 'personalInterests',
  ) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeListRow = (
    field:
      | 'skillsExpertise'
      | 'workExperience'
      | 'educationCertifications'
      | 'achievementsProjects'
      | 'personalInterests',
    i: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i),
    }));
  };

  const handleSave = async () => {
    if (!canEditIdentity) return;
    setSaving(true);
    setMessage(null);
    const accent = form.brandGuidelines.publicProfileAccentColor.trim();
    const textC = form.brandGuidelines.publicProfileTextColor.trim();
    if (!isValidProfileHex(accent) || !isValidProfileHex(textC)) {
      setMessage('Card colors must be empty or valid hex (#RGB or #RRGGBB).');
      setSaving(false);
      return;
    }
    try {
      const services = form.servicesOffered.map((s) => s.trim()).filter(Boolean);
      const skills = form.skillsExpertise.map((s) => s.trim()).filter(Boolean);
      const experience = form.workExperience.map((s) => s.trim()).filter(Boolean);
      const education = form.educationCertifications.map((s) => s.trim()).filter(Boolean);
      const achievements = form.achievementsProjects.map((s) => s.trim()).filter(Boolean);
      const interests = form.personalInterests.map((s) => s.trim()).filter(Boolean);
      await userAPI.updateProfile({
        name: form.name,
        accountType: form.accountType,
        company: form.company,
        profileSlug: form.profileSlug.trim() || null,
        publicTagline: form.publicTagline,
        publicBio: form.publicBio,
        professionalTitle: form.professionalTitle,
        skillsExpertise: skills,
        workExperience: experience,
        educationCertifications: education,
        achievementsProjects: achievements,
        personalInterests: interests,
        phone: form.phone,
        website: form.website,
        location: form.location,
        servicesOffered: services,
        photoURL: form.photoURL,
        brandGuidelines: {
          ...form.brandGuidelines,
          publicProfileAccentColor: accent,
          publicProfileTextColor: textC,
        },
      });
      await refresh();
      await refreshUser();
      setMessage('Profile saved.');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setMessage(msg || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (isRejected) {
    return (
      <div className={`${glassCard} p-6 text-sm text-text-secondary`}>
        Your profile cannot be edited while the account is rejected.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="space-y-4">
        {loading ? (
          <SkeletonBlock className="h-96 w-full" rounded="2xl" />
        ) : (
          <LiveProfilePreview draft={draft} slugPreview={slugPreview} />
        )}
        <p className="text-xs text-text-muted">
          Preview updates as you type. Your public page is only visible to others after approval.
        </p>
      </div>

      <div className={`${glassCard} space-y-4 p-4 sm:p-6`}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" rounded="lg" />
            ))}
          </div>
        ) : (
          <>
            {message ? <p className="text-sm text-brand-primary">{message}</p> : null}

            <div>
              <label className="text-xs font-semibold text-text-muted">Account type</label>
              <div className="mt-2 flex gap-2">
                {(['personal', 'business'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={!canEditIdentity}
                    onClick={() => setForm((prev) => ({ ...prev, accountType: t }))}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition ${
                      form.accountType === t
                        ? 'border-brand-primary bg-brand-soft text-brand-primary'
                        : 'border-border-card text-text-secondary'
                    } disabled:opacity-45`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {form.accountType === 'personal' ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Profile image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEditIdentity || uploading}
                    onChange={(e) => void onImageSelect(e, 'photo')}
                    className="mt-2 block w-full text-xs text-text-secondary file:mr-2 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Cover image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEditIdentity || uploading}
                    onChange={(e) => void onImageSelect(e, 'logo')}
                    className="mt-2 block w-full text-xs text-text-secondary file:mr-2 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary"
                  />
                  <Field
                    label="Cover URL (optional)"
                    value={form.brandGuidelines.logoUrl}
                    onChange={(v) => setForm((p) => ({ ...p, brandGuidelines: { ...p.brandGuidelines, logoUrl: v } }))}
                    disabled={!canEditIdentity}
                  />
                </div>
                <Field label="Full name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} disabled={!canEditIdentity} />
                <Field
                  label="Professional title"
                  value={form.professionalTitle}
                  onChange={(v) => setForm((p) => ({ ...p, professionalTitle: v }))}
                  disabled={!canEditIdentity}
                  hint="Example: Product Designer, Software Engineer, Growth Consultant"
                />
                <Field label="Username (slug)" value={form.profileSlug} onChange={(v) => setForm((p) => ({ ...p, profileSlug: v }))} disabled={!canEditIdentity} hint="Lowercase, numbers, hyphens. Min 3 characters." />
                <Field label="Bio" value={form.publicBio} onChange={(v) => setForm((p) => ({ ...p, publicBio: v }))} multiline disabled={!canEditIdentity} />
                <ListField
                  label="Skills & expertise"
                  placeholder="Add a skill"
                  values={form.skillsExpertise}
                  canEdit={canEditIdentity}
                  onChange={(i, v) => setListItem('skillsExpertise', i, v)}
                  onAdd={() => addListRow('skillsExpertise')}
                  onRemove={(i) => removeListRow('skillsExpertise', i)}
                />
                <ListField
                  label="Work experience"
                  placeholder="Role at company (years)"
                  values={form.workExperience}
                  canEdit={canEditIdentity}
                  onChange={(i, v) => setListItem('workExperience', i, v)}
                  onAdd={() => addListRow('workExperience')}
                  onRemove={(i) => removeListRow('workExperience', i)}
                />
                <ListField
                  label="Education & certifications"
                  placeholder="Degree or certification"
                  values={form.educationCertifications}
                  canEdit={canEditIdentity}
                  onChange={(i, v) => setListItem('educationCertifications', i, v)}
                  onAdd={() => addListRow('educationCertifications')}
                  onRemove={(i) => removeListRow('educationCertifications', i)}
                />
                <ListField
                  label="Achievements & notable projects"
                  placeholder="Achievement or project highlight"
                  values={form.achievementsProjects}
                  canEdit={canEditIdentity}
                  onChange={(i, v) => setListItem('achievementsProjects', i, v)}
                  onAdd={() => addListRow('achievementsProjects')}
                  onRemove={(i) => removeListRow('achievementsProjects', i)}
                />
                <ListField
                  label="Personal interests (optional)"
                  placeholder="Add an interest"
                  values={form.personalInterests}
                  canEdit={canEditIdentity}
                  onChange={(i, v) => setListItem('personalInterests', i, v)}
                  onAdd={() => addListRow('personalInterests')}
                  onRemove={(i) => removeListRow('personalInterests', i)}
                />
                <Field label="Email" value={form.email} onChange={() => {}} disabled hint="Managed in Settings." />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} disabled={!canEditIdentity} />
                <Field label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} disabled={!canEditIdentity} />
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Profile image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEditIdentity || uploading}
                    onChange={(e) => void onImageSelect(e, 'photo')}
                    className="mt-2 block w-full text-xs text-text-secondary file:mr-2 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted">Cover image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEditIdentity || uploading}
                    onChange={(e) => void onImageSelect(e, 'logo')}
                    className="mt-2 block w-full text-xs text-text-secondary file:mr-2 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary"
                  />
                  <Field label="Cover URL (optional)" value={form.brandGuidelines.logoUrl} onChange={(v) => setForm((p) => ({ ...p, brandGuidelines: { ...p.brandGuidelines, logoUrl: v } }))} disabled={!canEditIdentity} />
                </div>
                <Field label="Business name" value={form.company} onChange={(v) => setForm((p) => ({ ...p, company: v }))} disabled={!canEditIdentity} />
                <Field label="Slug" value={form.profileSlug} onChange={(v) => setForm((p) => ({ ...p, profileSlug: v }))} disabled={!canEditIdentity} />
                <Field label="Tagline" value={form.publicTagline} onChange={(v) => setForm((p) => ({ ...p, publicTagline: v }))} disabled={!canEditIdentity} />
                <Field label="Website" value={form.website} onChange={(v) => setForm((p) => ({ ...p, website: v }))} disabled={!canEditIdentity} />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} disabled={!canEditIdentity} />
                <Field label="Location" value={form.location} onChange={(v) => setForm((p) => ({ ...p, location: v }))} disabled={!canEditIdentity} />
                <div>
                  <label className="text-xs font-semibold text-text-muted">Services</label>
                  <div className="mt-2 space-y-2">
                    {form.servicesOffered.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={s}
                          disabled={!canEditIdentity}
                          onChange={(e) => setService(i, e.target.value)}
                          className="flex-1 rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm"
                          placeholder="Service name"
                        />
                        <button
                          type="button"
                          disabled={!canEditIdentity || form.servicesOffered.length <= 1}
                          onClick={() => removeServiceRow(i)}
                          className="rounded-xl border border-border-card px-2 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" disabled={!canEditIdentity} onClick={addServiceRow} className="text-xs font-semibold text-brand-primary">
                      + Add service
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-xl border border-border-card bg-bg-secondary/40 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-text-primary">Public card &amp; QR page colors</p>
                <p className="mt-1 text-[11px] text-text-muted leading-relaxed">
                  Optional accent and text colors for your public profile when someone opens your link or scans your QR.
                  Leave empty to match the site theme.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted">Accent (links, highlights)</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Accent color"
                      disabled={!canEditIdentity}
                      className="h-9 w-11 cursor-pointer rounded-lg border border-border-card bg-transparent p-0 disabled:opacity-45"
                      value={colorInputValue(form.brandGuidelines.publicProfileAccentColor, '#6366f1')}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          brandGuidelines: { ...p.brandGuidelines, publicProfileAccentColor: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      disabled={!canEditIdentity}
                      placeholder="#RRGGBB or empty"
                      value={form.brandGuidelines.publicProfileAccentColor}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          brandGuidelines: {
                            ...p.brandGuidelines,
                            publicProfileAccentColor: e.target.value.trim(),
                          },
                        }))
                      }
                      className="min-w-0 flex-1 rounded-xl border border-border-card bg-bg-secondary px-2 py-2 text-xs disabled:opacity-45"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-muted">Text</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Text color"
                      disabled={!canEditIdentity}
                      className="h-9 w-11 cursor-pointer rounded-lg border border-border-card bg-transparent p-0 disabled:opacity-45"
                      value={colorInputValue(form.brandGuidelines.publicProfileTextColor, '#f8fafc')}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          brandGuidelines: { ...p.brandGuidelines, publicProfileTextColor: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      disabled={!canEditIdentity}
                      placeholder="#RRGGBB or empty"
                      value={form.brandGuidelines.publicProfileTextColor}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          brandGuidelines: {
                            ...p.brandGuidelines,
                            publicProfileTextColor: e.target.value.trim(),
                          },
                        }))
                      }
                      className="min-w-0 flex-1 rounded-xl border border-border-card bg-bg-secondary px-2 py-2 text-xs disabled:opacity-45"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={!canEditIdentity}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    brandGuidelines: {
                      ...p.brandGuidelines,
                      publicProfileAccentColor: '',
                      publicProfileTextColor: '',
                    },
                  }))
                }
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Reset to site default (clear both)
              </button>
            </div>

            <button
              type="button"
              disabled={!canEditIdentity || saving}
              onClick={() => void handleSave()}
              className="w-full rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-45"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ListField({
  label,
  placeholder,
  values,
  canEdit,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  values: string[];
  canEdit: boolean;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-muted">{label}</label>
      <div className="mt-2 space-y-2">
        {values.map((value, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={value}
              disabled={!canEdit}
              onChange={(e) => onChange(i, e.target.value)}
              className="flex-1 rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm"
              placeholder={placeholder}
            />
            <button
              type="button"
              disabled={!canEdit || values.length <= 1}
              onClick={() => onRemove(i)}
              className="rounded-xl border border-border-card px-2 text-xs"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" disabled={!canEdit} onClick={onAdd} className="text-xs font-semibold text-brand-primary">
          + Add item
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-muted">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm disabled:opacity-45"
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm disabled:opacity-45"
        />
      )}
      {hint ? <p className="mt-1 text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  );
}
