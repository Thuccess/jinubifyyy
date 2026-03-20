 'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  PostsIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  CogIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  TestimonialsIcon,
  DocumentTextIcon,
  TeamIcon,
  ChartBarIcon,
  CameraIcon,
  CalendarIcon,
} from '../../icons/Icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

type AdminRole = 'editor' | 'admin' | 'super_admin';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  /** Roles that can see this item. Editor = CMS only; Admin = + services, pricing, orders; Super Admin = all. */
  allowedRoles: AdminRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: <DashboardIcon className="h-5 w-5" />, allowedRoles: ['editor', 'admin', 'super_admin'] },
  { id: 'content', label: 'Content', path: '/admin/content', icon: <DocumentTextIcon className="h-5 w-5" />, allowedRoles: ['editor', 'admin', 'super_admin'] },
  { id: 'services', label: 'Services', path: '/admin/services', icon: <CodeBracketIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'events', label: 'Events', path: '/admin/events', icon: <CalendarIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'demos', label: 'Service Demos', path: '/admin/demos', icon: <MegaphoneIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'pricing', label: 'Pricing & Packages', path: '/admin/pricing', icon: <CurrencyDollarIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'blog', label: 'Blog Posts', path: '/admin/blog', icon: <PostsIcon className="h-5 w-5" />, allowedRoles: ['editor', 'admin', 'super_admin'] },
  { id: 'media', label: 'Media Library', path: '/admin/media', icon: <CameraIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'testimonials', label: 'Testimonials', path: '/admin/testimonials', icon: <TestimonialsIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'about', label: 'About Page', path: '/admin/about', icon: <DocumentTextIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'team', label: 'Team Page', path: '/admin/team', icon: <TeamIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: <ChartBarIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'applications', label: 'Applications', path: '/admin/applications', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'investors', label: 'Investors', path: '/admin/investors', icon: <CurrencyDollarIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'contacts', label: 'Contacts', path: '/admin/contacts', icon: <EnvelopeIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'orders', label: 'Orders', path: '/admin/orders', icon: <ShoppingBagIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'activity', label: 'Activity', path: '/admin/activity', icon: <ChartBarIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'users', label: 'Users', path: '/admin/users', icon: <UserCircleIcon className="h-5 w-5" />, allowedRoles: ['admin', 'super_admin'] },
  { id: 'settings', label: 'Settings', path: '/admin/settings', icon: <CogIcon className="h-5 w-5" />, allowedRoles: ['super_admin'] },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const role = (currentUser?.role as AdminRole) ?? 'admin';
  const visibleItems = navItems.filter((item) => item.allowedRoles.includes(role));
  const logoSrc = theme === 'dark' ? '/logo/logo-light.png' : '/logo/logo-dark.png';
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false)
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return (pathname || '').startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          surface surface--sidebar
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobile && !isCollapsed ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}
          flex flex-col
          shadow-lg lg:shadow-none
        `}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2 min-w-0" aria-label="Jinubify Admin">
              <img
                src={logoSrc}
                alt="Jinubify"
                className="h-8 w-auto flex-shrink-0 object-contain max-h-8"
              />
              <span className="font-bold text-text-primary truncate">Admin</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/admin" className="flex items-center justify-center mx-auto" aria-label="Jinubify Admin">
              <img
                src={logoSrc}
                alt="Jinubify"
                className="h-8 w-8 object-contain object-center"
              />
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-surface-muted/90 text-text-secondary transition-colors duration-300 ease-out"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ArrowRightIcon
                className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
              />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Main
            </p>
          )}
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      group
                      relative
                      ${
                        active
                          ? 'bg-surface-muted text-brand-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-muted/90'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-primary" aria-hidden />
                    )}
                    <span
                      className={`
                        flex-shrink-0
                        ${active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary'}
                      `}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border-subtle">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              <span>Back to Site</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
