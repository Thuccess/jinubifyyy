'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { UserCircleIcon, LogoutIcon, SunIcon, MoonIcon, CogIcon } from '../../icons/Icons';
import { useTheme } from '../../../contexts/ThemeContext';
import AdminGlobalSearch from '../../admin/AdminGlobalSearch';

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ title, subtitle, actions, onMenuToggle }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoSrc = theme === 'dark' ? '/logo/logo-light.png' : '/logo/logo-dark.png';
  const getNextThemeLabel = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="h-16 bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: Mobile Menu Button + Logo + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-muted/90 text-text-secondary transition-colors duration-300 ease-out flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link
          href="/admin"
          className="hidden sm:flex items-center flex-shrink-0 mr-1"
          aria-label="Jinubify Admin"
        >
          <img
            src={logoSrc}
            alt="Jinubify"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-text-primary truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Global Search */}
      <AdminGlobalSearch />

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Custom Actions */}
        {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface-muted/90 text-text-secondary transition-colors duration-300 ease-out"
          aria-label={`Switch to ${getNextThemeLabel()} mode`}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out"
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium">
              {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 surface surface--popover rounded-xl shadow-lg border border-border-card py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-sm font-medium text-text-primary">
                  {currentUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {currentUser?.email || 'admin@example.com'}
                </p>
                {currentUser?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-brand-soft text-brand-primary rounded">
                    {currentUser.role}
                  </span>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted/90 transition-colors duration-300 ease-out"
                >
                  <CogIcon className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted/90 transition-colors duration-300 ease-out"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  View Public Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
