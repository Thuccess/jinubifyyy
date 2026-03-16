'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SparklesIcon, CogIcon, LogoutIcon } from '@/components/icons/Icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/projects', label: 'My Projects' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/files', label: 'Files' },
  { href: '/dashboard/payments', label: 'Payments' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/request-service', label: 'New Service Request' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/?auth=login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-border-subtle border-t-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-secondary text-text-primary flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border-subtle bg-[color:var(--surface-card)]">
        <div className="px-6 py-5 border-b border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Client Portal</p>
          <p className="mt-1 text-base font-bold">Jinubify</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-soft text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/80'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border-subtle text-xs text-text-muted">
          Signed in as <span className="font-medium text-text-primary">{currentUser.name}</span>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="h-14 border-b border-border-subtle bg-[color:var(--surface-card)] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-border-subtle px-2 py-1 text-xs text-text-secondary"
              onClick={() => router.push('/')}
            >
              Back
            </button>
            <span className="text-sm text-text-secondary hidden sm:inline">
              Welcome back, <span className="font-semibold text-text-primary">{currentUser.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary bg-surface-muted/60">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-muted/80"
              onClick={() => router.push('/dashboard/settings')}
            >
              <CogIcon className="h-3 w-3" />
              Settings
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-border-subtle px-2.5 py-1.5 text-xs text-text-secondary hover:bg-surface-muted/80"
              onClick={() => {
                logout();
                router.replace('/');
              }}
            >
              <LogoutIcon className="h-3 w-3 mr-1" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-bg-secondary">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

