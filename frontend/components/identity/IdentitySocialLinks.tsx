'use client';

import React, { useEffect, useState } from 'react';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import { PencilSquareIcon, TrashIcon } from '@/components/icons/Icons';
import { useAuth } from '@/contexts/AuthContext';
import { useIdentityAccess } from '@/components/identity/useIdentityAccess';
import { useIdentityProfile } from '@/components/identity/useIdentityProfile';
import { glassCard } from '@/components/identity/identityStyles';
import { IDENTITY_SOCIAL_PLATFORMS } from '@/lib/identityPlatforms';
import { userAPI } from '@/services/api';
import { SocialPlatformGlyph } from '@/lib/socialPlatforms';

function normalizeSocialInput(platform: string, raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const username = value.replace(/^@+/, '').trim();
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${username}`;
    case 'facebook':
      return `https://facebook.com/${username}`;
    case 'linkedin':
      return `https://linkedin.com/in/${username}`;
    case 'x':
      return `https://x.com/${username}`;
    case 'youtube':
      return `https://youtube.com/@${username}`;
    case 'tiktok':
      return `https://tiktok.com/@${username}`;
    case 'whatsapp':
      return `https://wa.me/${username.replace(/[^0-9]/g, '')}`;
    case 'messenger':
      return `https://m.me/${username}`;
    case 'snapchat':
      return `https://snapchat.com/add/${username}`;
    case 'pinterest':
      return `https://pinterest.com/${username}`;
    case 'reddit':
      return `https://reddit.com/u/${username}`;
    case 'threads':
      return `https://threads.net/@${username}`;
    case 'telegram':
      return `https://t.me/${username}`;
    case 'wechat':
      return `https://weixin.qq.com/${username}`;
    case 'website':
    default:
      return `https://${username}`;
  }
}

export default function IdentitySocialLinks() {
  const { profile, loading, refresh } = useIdentityProfile();
  const { refreshUser } = useAuth();
  const { canEditIdentity, isRejected } = useIdentityAccess();
  const links = profile?.socialLinks || [];
  const [platform, setPlatform] = useState<string>(IDENTITY_SOCIAL_PLATFORMS[0].id);
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (!editingPlatform) {
      setUrl('');
      return;
    }
    const hit = links.find((l) => l.platform === editingPlatform);
    setUrl(hit?.url || '');
  }, [editingPlatform, links]);

  const submit = async () => {
    if (!canEditIdentity) return;
    setBusy(true);
    setMessage(null);
    try {
      await userAPI.addSocialLink({ platform, url: normalizeSocialInput(platform, url) });
      await refresh();
      await refreshUser();
      setMessage(editingPlatform ? 'Link updated.' : 'Link saved.');
      setEditingPlatform(null);
      setUrl('');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setMessage(msg || 'Could not save link.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (platformKey: string) => {
    if (!canEditIdentity) return;
    setBusy(true);
    setMessage(null);
    try {
      await userAPI.deleteSocialLink(platformKey);
      await refresh();
      await refreshUser();
      setMessage('Link removed.');
      if (editingPlatform === platformKey) setEditingPlatform(null);
    } catch {
      setMessage('Could not remove link.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p: string) => {
    setEditingPlatform(p);
    setPlatform(p);
  };

  if (isRejected) {
    return (
      <div className={`${glassCard} p-6 text-sm text-text-secondary`}>Social links cannot be edited for this account.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${glassCard} p-4 sm:p-6`}>
        <h2 className="text-base font-bold text-text-primary">Add or update a link</h2>
        <p className="mt-1 text-xs text-text-muted">If the platform already exists, saving will replace its URL.</p>
        {message ? <p className="mt-3 text-sm text-brand-primary">{message}</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-text-muted">Platform</label>
            <select
              value={platform}
              disabled={!canEditIdentity || busy || Boolean(editingPlatform)}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm disabled:opacity-45"
            >
              {IDENTITY_SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {editingPlatform ? (
              <p className="mt-1 text-[11px] text-text-muted">
                Editing {editingPlatform}.{' '}
                <button type="button" className="font-semibold text-brand-primary" onClick={() => setEditingPlatform(null)}>
                  Cancel edit
                </button>
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted">URL or username</label>
            <input
              value={url}
              disabled={!canEditIdentity || busy}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="@username or https://..."
              className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm disabled:opacity-45"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={!canEditIdentity || busy || !url.trim()}
          onClick={() => void submit()}
          className="mt-4 w-full rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white disabled:opacity-45 sm:w-auto sm:px-6"
        >
          {editingPlatform ? 'Update link' : 'Add social link'}
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-text-primary">Your links</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-14 w-full" rounded="xl" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <p className="text-sm text-text-muted">No links yet.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.platform} className={`${glassCard} flex items-center gap-3 px-4 py-3`}>
                <SocialPlatformGlyph platform={l.platform} className="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{l.platform}</p>
                  <p className="truncate text-sm text-brand-primary">{l.url}</p>
                </div>
                <button
                  type="button"
                  disabled={!canEditIdentity || busy}
                  onClick={() => startEdit(l.platform)}
                  className="rounded-lg border border-border-card p-2 text-text-secondary disabled:opacity-45"
                  aria-label="Edit link"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!canEditIdentity || busy}
                  onClick={() => void remove(l.platform)}
                  className="rounded-lg border border-border-card p-2 text-rose-600 disabled:opacity-45"
                  aria-label="Delete link"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
