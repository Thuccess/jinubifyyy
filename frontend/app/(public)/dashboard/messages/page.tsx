'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import { userAPI } from '@/services/api';

interface ConnectionItem {
  _id: string;
  slug: string;
  name: string;
  headline: string;
  avatar: string;
  connectedAt: string;
}

export default function MessagesPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [savedQuery, setSavedQuery] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ConnectionItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const loadConnections = async () => {
    const r = await userAPI.getConnections();
    const mapped: ConnectionItem[] = (r.connections || []).map((c) => ({
      _id: c._id,
      slug: c.profileSlug,
      name: c.displayName || c.name,
      headline: c.publicTagline || '',
      avatar: c.photoURL || '',
      connectedAt: '',
    }));
    setConnections(mapped);
  };

  useEffect(() => {
    if (!currentUser) {
      setConnections([]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await loadConnections();
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    const q = search.trim().replace(/^@+/, '');
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const r = await userAPI.searchConnections(q);
          const mapped: ConnectionItem[] = (r.results || []).map((c) => ({
            _id: c._id,
            slug: c.profileSlug,
            name: c.displayName || c.name,
            headline: c.publicTagline || '',
            avatar: c.photoURL || '',
            connectedAt: '',
          }));
          setSearchResults(mapped);
        } finally {
          setSearching(false);
        }
      })();
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const q = savedQuery.trim().toLowerCase();
    if (!q) return connections;
    return connections.filter((c) =>
      [c.name, c.slug, c.headline].join(' ').toLowerCase().includes(q),
    );
  }, [connections, savedQuery]);

  const connect = async (item: ConnectionItem) => {
    if (!item._id) return;
    setConnectingId(item._id);
    try {
      await userAPI.connectToUser(item._id);
      await loadConnections();
    } finally {
      setConnectingId(null);
    }
  };

  const remove = async (item: ConnectionItem) => {
    if (!item._id) return;
    setRemovingId(item._id);
    try {
      await userAPI.removeConnection(item._id);
      await loadConnections();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Connections</h1>
        <p className="text-sm text-text-secondary mt-1">
          People you connected with from scanned profiles.
        </p>
      </div>

      <Card className="px-3 py-4 sm:px-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-text-primary">{connections.length} total</p>
          <input
            value={savedQuery}
            onChange={(e) => setSavedQuery(e.target.value)}
            placeholder="Search name or headline"
            className="w-full sm:w-72 rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full" rounded="xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No connections yet. Scan profiles and tap Connect to build your network.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={`${c.slug}-${c.connectedAt}`}
                className="flex items-center gap-3 rounded-xl border border-border-card bg-surface-muted/40 px-3 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border-card object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{c.name}</p>
                  <p className="truncate text-xs text-text-muted">@{c.slug}</p>
                  {c.headline ? <p className="truncate text-xs text-text-secondary">{c.headline}</p> : null}
                </div>
                <div className="text-right">
                  {c.connectedAt ? (
                    <p className="text-[11px] text-text-muted">{new Date(c.connectedAt).toLocaleDateString()}</p>
                  ) : null}
                  <a
                    href={`/u/${encodeURIComponent(c.slug)}`}
                    className="text-xs font-semibold text-brand-primary hover:underline"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    disabled={removingId === c._id}
                    onClick={() => void remove(c)}
                    className="ml-2 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-60"
                  >
                    {removingId === c._id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="px-3 py-4 sm:px-4">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Search approved users by username</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="@username"
          className="w-full rounded-lg border border-border-card bg-bg-primary px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-text-muted">No suggestions appear until you type.</p>
        {search.trim() ? (
          <div className="mt-3 space-y-2">
            {searching ? (
              <SkeletonBlock className="h-12 w-full" rounded="xl" />
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-text-muted">No approved users found.</p>
            ) : (
              searchResults.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center gap-3 rounded-xl border border-border-card bg-surface-muted/40 px-3 py-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=random`}
                    alt=""
                    className="h-9 w-9 rounded-full border border-border-card object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{r.name}</p>
                    <p className="truncate text-xs text-text-muted">@{r.slug}</p>
                  </div>
                  <button
                    type="button"
                    disabled={connectingId === r._id || connections.some((c) => c._id === r._id)}
                    onClick={() => void connect(r)}
                    className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {connections.some((c) => c._id === r._id)
                      ? 'Connected'
                      : connectingId === r._id
                        ? 'Connecting...'
                        : 'Connect'}
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-border-card px-3 py-2 text-xs text-text-muted">
            Type a full or partial username to search.
          </div>
        )}
      </Card>
    </div>
  );
}

