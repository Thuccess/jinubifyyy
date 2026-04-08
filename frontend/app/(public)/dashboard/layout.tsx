'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  CogIcon,
  LogoutIcon,
  DashboardIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusCircleIcon,
  SettingsIcon,
  LinkIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  ConnectionIcon,
} from '@/components/icons/Icons';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';

const identityNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon, shortLabel: 'Home' },
  { href: '/dashboard/profile', label: 'My Profile', icon: UserCircleIcon, shortLabel: 'Profile' },
  { href: '/dashboard/social', label: 'Social Links', icon: LinkIcon, shortLabel: 'Social' },
  { href: '/dashboard/qr', label: 'QR Code', icon: DevicePhoneMobileIcon, shortLabel: 'QR' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ConnectionIcon, shortLabel: 'Stats' },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon, shortLabel: 'Settings' },
];

const serviceNavItems = [
  { href: '/dashboard/projects', label: 'My Projects', icon: BriefcaseIcon, shortLabel: 'Projects' },
  { href: '/dashboard/messages', label: 'Connections', icon: ChatBubbleLeftRightIcon, shortLabel: 'Connect' },
  { href: '/dashboard/files', label: 'Files', icon: DocumentTextIcon, shortLabel: 'Files' },
  { href: '/dashboard/payments', label: 'Payments', icon: CurrencyDollarIcon, shortLabel: 'Pay' },
  { href: '/dashboard/reports', label: 'Reports', icon: ChartBarIcon, shortLabel: 'Reports' },
  { href: '/dashboard/request-service', label: 'New Service Request', icon: PlusCircleIcon, shortLabel: 'Request' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/?auth=login');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileNavOpen]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-bg-secondary text-text-primary flex">
        <aside className="hidden md:flex md:w-64 flex-col border-r border-border-subtle surface surface--sidebar">
          <div className="px-6 py-5 border-b border-border-subtle">
            <SkeletonBlock className="h-3 w-28" rounded="full" />
            <SkeletonBlock className="mt-2 h-4 w-24" rounded="full" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-9 w-full" rounded="lg" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border-subtle surface surface--bar flex items-center justify-between px-4 md:px-6">
            <SkeletonBlock className="h-4 w-56" rounded="full" />
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-9 w-9" rounded="full" />
              <SkeletonBlock className="h-8 w-24 hidden sm:block" rounded="full" />
              <SkeletonBlock className="h-8 w-20" rounded="full" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-bg-secondary">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-20 w-full" rounded="xl" />
                ))}
              </div>
              <SkeletonBlock className="h-64 w-full" rounded="xl" />
              <SkeletonBlock className="h-64 w-full" rounded="xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const clientServicesLocked = currentUser.status !== 'approved';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-secondary text-text-primary flex">
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          isMobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="dashboard-mobile-nav"
        className={`fixed left-0 top-0 z-50 h-full w-[86%] max-w-xs border-r border-border-subtle surface surface--sidebar transition-transform duration-200 ease-out md:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard navigation"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Your dashboard</p>
            <p className="mt-1 text-sm font-bold">Jinubify</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-card text-text-secondary"
            aria-label="Close menu"
          >
            <span className="text-base leading-none">&times;</span>
          </button>
        </div>
        <nav className="h-[calc(100%-6.25rem)] overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Identity</p>
            <div className="mt-1 space-y-1">
              {identityNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-soft text-brand-primary ring-1 ring-brand-primary/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/80'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Client services</p>
            <div className="mt-1 space-y-1">
              {serviceNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                const rowClass = `group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-soft text-brand-primary ring-1 ring-brand-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/80'
                } ${clientServicesLocked ? 'opacity-45 cursor-not-allowed' : ''}`;
                if (clientServicesLocked) {
                  return (
                    <span
                      key={item.href}
                      className={rowClass}
                      title="Available when your account is approved"
                      tabIndex={0}
                      role="presentation"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={rowClass}>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:min-w-64 flex-col border-r border-border-subtle surface surface--sidebar">
        <div className="px-6 py-5 border-b border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Your dashboard</p>
          <p className="mt-1 text-base font-bold">Jinubify</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Identity</p>
            <div className="mt-1 space-y-1">
              {identityNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-soft text-brand-primary ring-1 ring-brand-primary/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/80'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Client services</p>
            <div className="mt-1 space-y-1">
              {serviceNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                const rowClass = `group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-soft text-brand-primary ring-1 ring-brand-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/80'
                } ${clientServicesLocked ? 'opacity-45 cursor-not-allowed' : ''}`;
                if (clientServicesLocked) {
                  return (
                    <span
                      key={item.href}
                      className={rowClass}
                      title="Available when your account is approved"
                      tabIndex={0}
                      role="presentation"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={rowClass}>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random`
              }
              alt={`${currentUser.name} avatar`}
              className="h-9 w-9 rounded-full border border-border-card object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text-primary">{currentUser.name}</p>
              <p className="truncate text-[11px] text-text-muted">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <header className="border-b border-border-subtle surface surface--bar px-3 py-3 sm:px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-border-card px-2.5 py-1.5 text-xs text-text-secondary"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open dashboard menu"
              aria-expanded={isMobileNavOpen}
              aria-controls="dashboard-mobile-nav"
            >
              Menu
            </button>
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-border-card px-2.5 py-1.5 text-xs text-text-secondary"
              onClick={() => router.push('/')}
            >
              Back
            </button>
            <span className="hidden truncate text-sm text-text-secondary md:inline">
              Welcome back, <span className="font-semibold text-text-primary">{currentUser.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={
                currentUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random`
              }
              alt={`${currentUser.name} avatar`}
              className="h-9 w-9 rounded-full border border-border-card object-cover"
            />
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 rounded-full border border-border-card px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-muted/80"
              onClick={() => router.push('/dashboard/settings')}
            >
              <CogIcon className="h-3 w-3" />
              Settings
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-border-card px-2.5 py-1.5 text-xs text-text-secondary hover:bg-surface-muted/80"
              onClick={() => {
                logout();
                router.replace('/');
              }}
            >
              <LogoutIcon className="h-3 w-3 mr-1" />
              Logout
            </button>
          </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto bg-bg-secondary">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.07] via-transparent to-cyan-500/[0.08]" aria-hidden />
          <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4">
            {currentUser.status === 'pending' && (
              <div
                className="rounded-xl border border-amber-200/80 bg-amber-50/90 dark:border-amber-800/50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
                role="status"
              >
                <p className="font-semibold">Your account is under review.</p>
                <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
                  You can explore your profile while we complete approval. Your public profile stays private until you are
                  approved.
                </p>
              </div>
            )}
            {currentUser.status === 'rejected' && (
              <div
                className="rounded-xl border border-red-200/80 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-950 dark:text-red-100"
                role="alert"
              >
                <p className="font-semibold">Your application was not approved.</p>
                {currentUser.rejectionReason ? (
                  <p className="mt-1 text-red-900/90 dark:text-red-100/90">{currentUser.rejectionReason}</p>
                ) : (
                  <p className="mt-1 text-red-900/90 dark:text-red-100/90">
                    Dashboard access is limited. Contact support if you have questions.
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

