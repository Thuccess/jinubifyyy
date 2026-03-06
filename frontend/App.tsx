import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CmsProvider } from './contexts/CmsContext';
import type { User } from './types';

// Lazy load page components
const HomePage = lazy(() => import('./components/pages/HomePage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const ServicesPage = lazy(() => import('./components/pages/ServicesPage'));
const PricingPage = lazy(() => import('./components/pages/PricingPage'));
const CareerPage = lazy(() => import('./components/pages/CareerPage'));
const InvestmentPage = lazy(() => import('./components/pages/InvestmentPage'));
const DemosLandingPage = lazy(() => import('./components/pages/DemosLandingPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('./components/pages/BlogPostPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const TeamPage = lazy(() => import('./components/pages/TeamPage'));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage'));
const UserDashboardPage = lazy(() => import('./components/pages/UserDashboardPage'));
const CmsBasicPage = lazy(() => import('./components/pages/CmsBasicPage'));
const AdminDashboardPage = lazy(() => import('./components/pages/AdminDashboardPage'));
const AdminServicesPage = lazy(() => import('./components/pages/admin/AdminServicesPage'));
const AdminDemosPage = lazy(() => import('./components/pages/admin/AdminDemosPage'));
const AdminPricingPage = lazy(() => import('./components/pages/admin/AdminPricingPage'));
const AdminRequestsPage = lazy(() => import('./components/pages/admin/AdminRequestsPage'));
const AdminContentPage = lazy(() => import('./components/pages/admin/AdminContentPage'));
const AdminSettingsPage = lazy(() => import('./components/pages/admin/AdminSettingsPage'));
const AdminApplicationsPage = lazy(() => import('./components/pages/admin/AdminApplicationsPage'));
const AdminInvestorsPage = lazy(() => import('./components/pages/admin/AdminInvestorsPage'));

// Lazy load demo pages (two-level: overview and gallery)
const DemoOverviewPage = lazy(() => import('./components/pages/DemoOverviewPage'));
const DemoGalleryPage = lazy(() => import('./components/pages/DemoGalleryPage'));
const ServiceDetailPage = lazy(() => import('./components/pages/ServiceDetailPage'));


// A fallback component to show while lazy-loaded components are loading
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
  </div>
);

const PublicContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isLoading, login, logout } = useAuth();
    
  const handleLoginSuccess = (user: User) => {
    login(user);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <MainLayout
      theme={theme}
      toggleTheme={toggleTheme}
      currentUser={currentUser}
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
    >
      <HomePage />
    </MainLayout>
  );
};

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PublicContent />
    </Suspense>
  );
};


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CmsProvider>
              <AppContent />
            </CmsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;