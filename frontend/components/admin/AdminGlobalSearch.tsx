'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminAPI } from '../../services/api';
import { SearchIcon } from '../icons/Icons';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface SearchResults {
  users: Array<{ _id: string; name: string; email: string; role?: string }>;
  orders: Array<{ _id: string; serviceName: string; status: string; createdAt: string; customer?: { name?: string; email?: string } }>;
  services: Array<{ _id: string; title: string; slug: string }>;
  blogPosts: Array<{ _id: string; title: string; slug: string; status?: string; published?: boolean }>;
  cmsPages: Array<{ _id: string; slug: string; title: string; type?: string }>;
}

const AdminGlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < MIN_QUERY_LENGTH) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await adminAPI.search(q, 5);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) {
      runSearch(debouncedQuery);
      setOpen(true);
    } else {
      setResults(null);
      setOpen(false);
    }
  }, [debouncedQuery, runSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.orders.length > 0 ||
      results.services.length > 0 ||
      results.blogPosts.length > 0 ||
      results.cmsPages.length > 0);

  const handleResultClick = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative hidden md:block w-64 lg:w-72" ref={wrapperRef}>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="search"
          placeholder="Search users, orders, blog…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => debouncedQuery.length >= MIN_QUERY_LENGTH && setOpen(true)}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
          aria-label="Global admin search"
        />
      </div>

      {open && query.trim().length >= MIN_QUERY_LENGTH && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-[70vh] overflow-y-auto surface surface--popover rounded-xl shadow-lg border border-border-card py-2 z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-text-muted">Searching…</div>
          ) : !hasResults ? (
            <div className="px-4 py-3 text-sm text-text-muted">No results</div>
          ) : (
            <div className="space-y-1">
              {results!.users.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Users</p>
                  {results!.users.map((u) => (
                    <Link
                      key={u._id}
                      href={`/admin/users`}
                      onClick={handleResultClick}
                      className="block px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-muted/90"
                    >
                      {u.name} · {u.email}
                    </Link>
                  ))}
                </div>
              )}
              {results!.orders.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Orders</p>
                  {results!.orders.map((o) => (
                    <Link
                      key={o._id}
                      href="/admin/orders"
                      onClick={handleResultClick}
                      className="block px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-muted/90"
                    >
                      {o.serviceName} · {o.status}
                    </Link>
                  ))}
                </div>
              )}
              {results!.services.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Services</p>
                  {results!.services.map((s) => (
                    <Link
                      key={s._id}
                      href="/admin/services"
                      onClick={handleResultClick}
                      className="block px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-muted/90"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              )}
              {results!.blogPosts.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Blog Posts</p>
                  {results!.blogPosts.map((p) => (
                    <Link
                      key={p._id}
                      href="/admin/blog"
                      onClick={handleResultClick}
                      className="block px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-muted/90"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
              {results!.cmsPages.length > 0 && (
                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">CMS Pages</p>
                  {results!.cmsPages.map((p) => (
                    <Link
                      key={p._id}
                      href="/admin/content"
                      onClick={handleResultClick}
                      className="block px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-muted/90"
                    >
                      {p.title || p.slug}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;
