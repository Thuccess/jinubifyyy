'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageUrlWithUpload } from '@/components/ui/ImageUrlWithUpload';
import { WEBSITE_DEMO_CATEGORIES } from '@/constants/demoCategories';
import { PlusIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/icons/Icons';
import type { WebsiteDemo, WebsiteDemoPreviewMode, WebsiteDemoVisibility } from '@/types/websiteDemo';

export interface DemoFormValues {
  title: string;
  slug: string;
  category: string;
  demoUrl: string;
  previewMode: WebsiteDemoPreviewMode;
  thumbnail: string;
  gallery: string[];
  video: string;
  shortDescription: string;
  description: string;
  features: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  price: string;
  isFeatured: boolean;
  visibility: WebsiteDemoVisibility;
  isActive: boolean;
}

const emptyValues: DemoFormValues = {
  title: '',
  slug: '',
  category: '',
  demoUrl: '',
  previewMode: 'new_tab',
  thumbnail: '',
  gallery: [],
  video: '',
  shortDescription: '',
  description: '',
  features: [''],
  ctaPrimary: 'View Demo',
  ctaSecondary: 'Get This Website',
  price: '',
  isFeatured: false,
  visibility: 'active',
  isActive: true,
};

/** Strips currency symbols and grouping; returns null if empty or not a valid non‑negative number */
function parsePriceInput(raw: string): number | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const normalized = s.replace(/[$€£,\s]/g, '');
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function slugifyInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapInitial(initial: Partial<WebsiteDemo> | null | undefined): DemoFormValues {
  if (!initial || !initial._id) {
    return { ...emptyValues, features: [''] };
  }
  return {
    title: initial.title ?? '',
    slug: initial.slug ?? '',
    category: initial.category ?? '',
    demoUrl: initial.demoUrl ?? '',
    previewMode: initial.previewMode === 'iframe' ? 'iframe' : 'new_tab',
    thumbnail: initial.thumbnail ?? '',
    gallery: initial.gallery?.length ? [...initial.gallery] : [],
    video: initial.video ?? '',
    shortDescription: initial.shortDescription ?? '',
    description: initial.description ?? '',
    features: initial.features?.length ? [...initial.features] : [''],
    ctaPrimary: initial.ctaPrimary ?? 'View Demo',
    ctaSecondary: initial.ctaSecondary ?? 'Get This Website',
    price: initial.price != null && Number.isFinite(initial.price) ? String(initial.price) : '',
    isFeatured: Boolean(initial.isFeatured),
    visibility: initial.visibility === 'hidden' ? 'hidden' : 'active',
    isActive: initial.isActive !== false,
  };
}

export interface DemoFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<WebsiteDemo> | null;
  loading?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}

const DemoForm: React.FC<DemoFormProps> = ({ mode, initial, loading, onSubmit, onCancel }) => {
  const [values, setValues] = useState<DemoFormValues>(() => mapInitial(initial));
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(mapInitial(initial));
    setSlugTouched(false);
    setErrors({});
  }, [initial]);

  const setField = useCallback(<K extends keyof DemoFormValues>(key: K, v: DemoFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!values.title.trim()) e.title = 'Title is required';
    if (!values.demoUrl.trim()) e.demoUrl = 'Demo URL is required';
    if (!values.thumbnail.trim()) e.thumbnail = 'Thumbnail is required';
    if (!values.shortDescription.trim() && !values.description.trim()) {
      e.shortDescription = 'Add a short or full description';
    }
    if (values.slug.trim() && !/^[a-z0-9-]+$/.test(values.slug.trim())) {
      e.slug = 'Slug: lowercase letters, numbers, hyphens only';
    }
    if (values.price.trim() && parsePriceInput(values.price) === null) {
      e.price = 'Enter a valid price (e.g. 200 or $200)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const features = values.features.map((f) => f.trim()).filter(Boolean);
    const gallery = values.gallery.map((g) => g.trim()).filter(Boolean);
    const priceNum = parsePriceInput(values.price);
    const payload: Record<string, unknown> = {
      websiteDemo: true,
      title: values.title.trim(),
      slug: values.slug.trim() ? values.slug.trim().toLowerCase() : undefined,
      category: values.category.trim(),
      demoUrl: values.demoUrl.trim(),
      previewMode: values.previewMode,
      thumbnail: values.thumbnail.trim(),
      gallery,
      video: values.video.trim(),
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      features,
      ctaPrimary: values.ctaPrimary.trim() || 'View Demo',
      ctaSecondary: values.ctaSecondary.trim() || 'Get This Website',
      price: priceNum,
      isFeatured: values.isFeatured,
      visibility: values.visibility,
      isActive: values.isActive,
    };

    if (mode === 'create') {
      delete payload.slug;
      if (values.slug.trim()) payload.slug = values.slug.trim().toLowerCase();
    }

    onSubmit(payload);
  };

  const addGallery = () => setValues((p) => ({ ...p, gallery: [...p.gallery, ''] }));
  const setGallery = (i: number, url: string) =>
    setValues((p) => ({ ...p, gallery: p.gallery.map((g, j) => (j === i ? url : g)) }));
  const removeGallery = (i: number) =>
    setValues((p) => ({ ...p, gallery: p.gallery.filter((_, j) => j !== i) }));

  const addFeature = () => setValues((p) => ({ ...p, features: [...p.features, ''] }));
  const setFeature = (i: number, text: string) =>
    setValues((p) => ({ ...p, features: p.features.map((f, j) => (j === i ? text : f)) }));
  const removeFeature = (i: number) =>
    setValues((p) => ({
      ...p,
      features: p.features.filter((_, j) => j !== i).length ? p.features.filter((_, j) => j !== i) : [''],
    }));

  const moveFeature = (index: number, dir: -1 | 1) => {
    setValues((p) => {
      const next = [...p.features];
      const j = index + dir;
      if (j < 0 || j >= next.length) return p;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...p, features: next };
    });
  };

  const dragFeatureIndex = React.useRef<number | null>(null);

  const onFeatureDragStart = (i: number) => {
    dragFeatureIndex.current = i;
  };
  const onFeatureDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragFeatureIndex.current;
    if (from == null || from === i) return;
    setValues((p) => {
      const arr = [...p.features];
      const [moved] = arr.splice(from, 1);
      arr.splice(i, 0, moved);
      return { ...p, features: arr };
    });
    dragFeatureIndex.current = i;
  };
  const onFeatureDragEnd = () => {
    dragFeatureIndex.current = null;
  };

  const titleSlugPreview = useMemo(() => slugifyInput(values.title), [values.title]);

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-text-primary">Title *</label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => {
              const t = e.target.value;
              setValues((p) => ({
                ...p,
                title: t,
                slug: !slugTouched && mode === 'create' ? slugifyInput(t) : p.slug,
              }));
            }}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          />
          {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Slug</label>
          <input
            type="text"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setField('slug', slugifyInput(e.target.value));
            }}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            placeholder={mode === 'create' ? titleSlugPreview || 'auto-from-title' : ''}
          />
          {errors.slug ? <p className="mt-1 text-xs text-red-600">{errors.slug}</p> : null}
          {mode === 'create' ? (
            <p className="mt-1 text-xs text-text-muted">Leave blank to auto-generate from title (unique).</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Category</label>
          <select
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          >
            <option value="">Select…</option>
            {WEBSITE_DEMO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Demo URL *</label>
        <input
          type="url"
          value={values.demoUrl}
          onChange={(e) => setField('demoUrl', e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          placeholder="https://"
        />
        {errors.demoUrl ? <p className="mt-1 text-xs text-red-600">{errors.demoUrl}</p> : null}
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-text-primary">Preview mode</span>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="radio"
              name="previewMode"
              checked={values.previewMode === 'iframe'}
              onChange={() => setField('previewMode', 'iframe')}
              className="text-brand-primary focus:ring-[color:var(--accent-ring)]"
            />
            iframe
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-text-primary">
            <input
              type="radio"
              name="previewMode"
              checked={values.previewMode === 'new_tab'}
              onChange={() => setField('previewMode', 'new_tab')}
              className="text-brand-primary focus:ring-[color:var(--accent-ring)]"
            />
            New tab (hero image on site)
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Thumbnail *</label>
        <ImageUrlWithUpload value={values.thumbnail} onChange={(url) => setField('thumbnail', url)} />
        {errors.thumbnail ? <p className="mt-1 text-xs text-red-600">{errors.thumbnail}</p> : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">Gallery</span>
          <button
            type="button"
            onClick={addGallery}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-xs font-medium text-brand-primary"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Add image
          </button>
        </div>
        <div className="space-y-2">
          {values.gallery.map((url, i) => (
            <div key={i} className="flex gap-2">
              <div className="min-w-0 flex-1">
                <ImageUrlWithUpload compact value={url} onChange={(u) => setGallery(i, u)} />
              </div>
              <button
                type="button"
                onClick={() => removeGallery(i)}
                className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-500/10"
                aria-label="Remove"
              >
                <DeleteIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Video URL (YouTube embed or mp4)</label>
        <input
          type="url"
          value={values.video}
          onChange={(e) => setField('video', e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          placeholder="https://www.youtube.com/embed/…"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Short description</label>
        <textarea
          value={values.shortDescription}
          onChange={(e) => setField('shortDescription', e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
        />
        {errors.shortDescription ? <p className="mt-1 text-xs text-red-600">{errors.shortDescription}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Full description</label>
        <textarea
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">Features</span>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-xs font-medium text-brand-primary"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <p className="mb-2 text-xs text-text-muted">Drag rows to reorder.</p>
        <ul className="space-y-2">
          {values.features.map((f, i) => (
            <li
              key={i}
              draggable
              onDragStart={() => onFeatureDragStart(i)}
              onDragOver={(e) => onFeatureDragOver(e, i)}
              onDragEnd={onFeatureDragEnd}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted/40 px-2 py-1.5"
            >
              <span className="cursor-grab select-none text-text-muted" aria-hidden>
                ⋮⋮
              </span>
              <input
                type="text"
                value={f}
                onChange={(e) => setFeature(i, e.target.value)}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-text-primary focus:border-border-accent focus:outline-none"
                placeholder="Feature"
              />
              <button
                type="button"
                onClick={() => moveFeature(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveFeature(i, 1)}
                disabled={i === values.features.length - 1}
                className="rounded p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="rounded p-1 text-red-600 hover:bg-red-500/10"
                aria-label="Remove"
              >
                <DeleteIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">CTA primary</label>
          <input
            type="text"
            value={values.ctaPrimary}
            onChange={(e) => setField('ctaPrimary', e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">CTA secondary</label>
          <input
            type="text"
            value={values.ctaSecondary}
            onChange={(e) => setField('ctaSecondary', e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Price (optional)</label>
          <input
            type="text"
            inputMode="decimal"
            value={values.price}
            onChange={(e) => setField('price', e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm"
            placeholder="e.g. 200 or $200"
          />
          {errors.price ? <p className="mt-1 text-xs text-red-600">{errors.price}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => setField('isFeatured', e.target.checked)}
            className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
          />
          Featured
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
            className="rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
          />
          Active (live)
        </label>
        <div className="flex items-center gap-2 text-sm text-text-primary">
          <span className="font-medium">Listing</span>
          <select
            value={values.visibility}
            onChange={(e) => setField('visibility', e.target.value as WebsiteDemoVisibility)}
            className="rounded-lg border border-border-subtle bg-surface-card px-2 py-1 text-sm"
          >
            <option value="active">Visible on /demos</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border-subtle bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-card"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default DemoForm;
