import React, { Suspense } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import ScrollToTopButton from '../ScrollToTopButton';
import type { Theme, User } from '../../types';

interface MainLayoutProps {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  theme,
  toggleTheme,
  currentUser,
  onLoginSuccess,
  onLogout,
  children,
}) => {
  return (
    <div className="min-h-screen text-text-primary">
      {/* Global subtle background grid / gradient – fixed so they do not affect sticky */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[color:var(--bg-primary)] via-[color:var(--bg-primary)] to-[color:var(--bg-secondary)]" aria-hidden="true" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(var(--bg-dot-color)_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />

      <Suspense
        fallback={<div className="header-fixed fixed top-0 z-50 h-16 w-full border-b border-border-subtle bg-bg-primary md:h-20" aria-hidden />}
      >
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          onLoginSuccess={onLoginSuccess}
          onLogout={onLogout}
        />
      </Suspense>

      <main className="pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Footer currentUser={currentUser} />
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;


