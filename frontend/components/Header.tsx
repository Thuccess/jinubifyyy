 'use client';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { SunIcon, MoonIcon, UserCircleIcon, LogoutIcon, DashboardIcon, CogIcon } from './icons/Icons';
import { TwitterIcon, InstagramIcon, YouTubeIcon, FacebookIcon, WhatsAppIcon } from './icons/Socials';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useCms } from '../contexts/CmsContext';
import type { User, Theme } from '../types';
import AuthModal from './AuthModal';

const Logo: React.FC<{ theme: Theme }> = ({ theme }) => (
  <Link href="/" className="flex items-center" aria-label="Jinubify Home">
    <Image
      src={theme === 'dark' ? '/logo/logo-light.png' : '/logo/logo-dark.png'}
      alt="Jinubify Logo"
      width={160}
      height={40}
      className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto transition-[height] duration-200"
    />
  </Link>
);

interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
    currentUser: User | null;
    onLoginSuccess: (user: User) => void;
    onLogout: () => void;
}

const NavLink: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, children, onClick }) => {
  const pathname = usePathname();
  const isActive =
    to === '/' ? pathname === '/' : (pathname?.startsWith(to) ?? false);

  return (
    <Link
      href={to}
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors duration-200 group ${
        isActive ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
      <span
        className={`absolute bottom-[-4px] left-0 h-0.5 bg-brand-primary transition-all duration-300 ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </Link>
  );
};

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, currentUser, onLoginSuccess, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp'>('signIn');
  const [mounted, setMounted] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Defer auth UI until after mount so server and client render the same (avoids hydration mismatch).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Focus trap: focus first focusable when menu opens; return focus to hamburger when it closes
  useEffect(() => {
    if (isMenuOpen && menuContentRef.current) {
      const focusables = menuContentRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusables[0];
      if (first) first.focus();
    } else if (!isMenuOpen) {
      hamburgerRef.current?.focus();
    }
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleMobileSignIn = () => {
    handleSignInClick();
    closeMenu();
  };

  const handleMobileSignUp = () => {
    handleSignUpClick();
    closeMenu();
  };

  const handleSignInClick = () => {
    setAuthModalView('signIn');
    setIsAuthModalOpen(true);
  };
  
  const handleSignUpClick = () => {
    setAuthModalView('signUp');
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSuccessfulLogin = (user: User) => {
    onLoginSuccess(user);
    handleCloseModal();
  };

  const handleLogout = () => {
    onLogout();
    router.push('/');
  };

  const defaultNavItems = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/demos', label: 'Demos' },
    { to: '/blog', label: 'Blog' },
    { to: '/team', label: 'Team' },
    { to: '/contact', label: 'Contact Us' },
  ];
  const { site } = useCms();
  const navItems =
    site?.nav && site.nav.length > 0
      ? site.nav
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => ({ to: item.href, label: item.label }))
      : defaultNavItems;
  
  const socialLinks = [
      { name: 'X', href: '#', icon: <TwitterIcon className="w-5 h-5" /> },
      { name: 'Instagram', href: '#', icon: <InstagramIcon className="w-5 h-5" /> },
      { name: 'YouTube', href: '#', icon: <YouTubeIcon className="w-5 h-5" /> },
      { name: 'Facebook', href: '#', icon: <FacebookIcon className="w-5 h-5" /> },
      { name: 'WhatsApp', href: '#', icon: <WhatsAppIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="header-fixed fixed top-0 w-full z-50 shrink-0 transition-[background-color,border-color,box-shadow] duration-300 ease-out bg-[color:var(--bg-primary)] border-b border-border-subtle shadow-sm rounded-none">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Logo theme={theme} />
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-muted/70 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]" 
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>

              <div className="hidden md:block border-l border-border-subtle h-6"></div>

              {(mounted && currentUser) ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-muted/70 transition-colors duration-300 ease-out">
                    <Image
                      src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random`}
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                      unoptimized
                    />
                    <span className="hidden sm:block text-sm font-medium">{currentUser.name}</span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg glass-surface glass-surface--popover focus:outline-none z-50">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/dashboard"
                              className={`${
                                active ? 'bg-surface-muted' : ''
                              } flex items-center px-4 py-2 text-sm text-text-primary`}
                            >
                              <DashboardIcon className="h-5 w-5 mr-2" />
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        {currentUser?.role === 'admin' && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/admin"
                                className={`${
                                  active ? 'bg-surface-muted' : ''
                                } flex items-center px-4 py-2 text-sm text-text-primary`}
                              >
                                <CogIcon className="h-5 w-5 mr-2" />
                                Admin Panel
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-surface-muted' : ''
                              } flex items-center w-full px-4 py-2 text-sm text-text-primary`}
                            >
                              <LogoutIcon className="h-5 w-5 mr-2" />
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={handleSignInClick}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUpClick}
                    className="px-4 py-2 text-sm font-medium btn-primary rounded-lg focus-visible:ring-offset-2"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <div className="md:hidden">
                <button 
                  ref={hamburgerRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-all duration-300 relative z-[60] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-[color:var(--bg-primary)] ${
                    isMenuOpen 
                      ? 'bg-surface-muted' 
                      : 'hover:bg-surface-muted/90'
                  }`} 
                  aria-label="Toggle menu" 
                  aria-expanded={isMenuOpen} 
                  aria-controls="mobile-menu"
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                        <span className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45' : '-translate-y-[5px]'}`}></span>
                        <span className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45' : 'translate-y-[5px]'}`}></span>
                    </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu: backdrop + right-side drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-out ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {/* Backdrop: tap outside to close */}
        <button
          type="button"
          onClick={closeMenu}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out focus:outline-none"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Drawer panel */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={`fixed top-0 right-0 bottom-0 w-full max-w-xs bg-bg-primary shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div
            ref={menuContentRef}
            tabIndex={-1}
            className="flex flex-col flex-1 overflow-y-auto p-4"
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeMenu();
              if (e.key === 'Tab' && menuContentRef.current) {
                const focusables = Array.from(menuContentRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
                const idx = focusables.indexOf(document.activeElement as HTMLElement);
                if (idx === -1) return;
                if (e.shiftKey) {
                  if (idx === 0) {
                    e.preventDefault();
                    (focusables[focusables.length - 1] as HTMLElement)?.focus();
                  }
                } else {
                  if (idx === focusables.length - 1) {
                    e.preventDefault();
                    (focusables[0] as HTMLElement)?.focus();
                  }
                }
              }
            }}
          >
            {/* Header: close button – glass strip so smaller header has glassmorphism too */}
            <div className="glass-surface glass-surface--bar rounded-lg flex items-center justify-end shrink-0 p-3 -m-4 mb-4">
              <button
                type="button"
                onClick={closeMenu}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav block: left-aligned list */}
            <nav className="flex flex-col space-y-1 py-4" aria-label="Primary">
              {navItems.map((item) => {
                const isActive =
                  item.to === '/'
                    ? pathname === '/'
                    : (pathname?.startsWith(item.to) ?? false);
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={closeMenu}
                    className={`flex items-center text-left text-base font-medium py-3 px-4 rounded-lg min-h-[44px] transition-colors duration-200 ${
                      isActive
                        ? 'border-l-2 border-brand-primary bg-surface-muted/50 text-brand-primary pl-[calc(1rem-2px)]'
                        : 'text-text-primary hover:bg-surface-muted/90 border-l-2 border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border-subtle my-2" />

            {/* Auth block */}
            <div className="flex flex-col space-y-2 py-4">
              {(mounted && currentUser) ? (
                <>
                  <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-2 text-left text-base font-medium text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out py-3 px-4 rounded-lg min-h-[44px] border-l-2 border-transparent">
                    <DashboardIcon className="h-5 w-5 shrink-0" /> Dashboard
                  </Link>
                  {currentUser.role === 'admin' && (
                    <Link href="/admin" onClick={closeMenu} className="flex items-center gap-2 text-left text-base font-medium text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out py-3 px-4 rounded-lg min-h-[44px] border-l-2 border-transparent">
                      <CogIcon className="h-5 w-5 shrink-0" /> Admin Panel
                    </Link>
                  )}
                  <button type="button" onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-2 w-full text-left text-base font-medium text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out py-3 px-4 rounded-lg min-h-[44px] border-l-2 border-transparent">
                    <LogoutIcon className="h-5 w-5 shrink-0" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={handleMobileSignIn} className="block w-full text-left py-3 px-4 text-text-secondary hover:text-text-primary font-medium min-h-[44px] rounded-lg hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]">
                    Sign In
                  </button>
                  <button type="button" onClick={handleMobileSignUp} className="block w-full text-center py-3 px-6 rounded-lg btn-primary font-medium min-h-[44px] focus-visible:ring-offset-2">
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <div className="py-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted/80 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </button>
            </div>

            <div className="border-t border-border-subtle my-2" />

            {/* Socials + copyright at bottom of flex (scrolls with content) */}
            <div className="pt-4 pb-6 mt-auto">
              <div className="flex justify-center gap-4">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.href} className="text-text-muted hover:text-text-primary transition-colors duration-300 ease-out min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-muted/70" aria-label={`Follow us on ${link.name}`}>
                    {link.icon}
                  </a>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-text-muted">
                &copy; {new Date().getFullYear()} Jinubify, Inc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModal}
        view={authModalView}
        onSuccess={handleSuccessfulLogin}
      />
    </>
  );
};

export default Header;