import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
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
const DemosLandingPage = lazy(() => import('./components/pages/DemosLandingPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('./components/pages/BlogPostPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const TeamPage = lazy(() => import('./components/pages/TeamPage'));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage'));
const UserDashboardPage = lazy(() => import('./components/pages/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('./components/pages/AdminDashboardPage'));
const AdminServicesPage = lazy(() => import('./components/pages/admin/AdminServicesPage'));
const AdminDemosPage = lazy(() => import('./components/pages/admin/AdminDemosPage'));
const AdminPricingPage = lazy(() => import('./components/pages/admin/AdminPricingPage'));
const AdminRequestsPage = lazy(() => import('./components/pages/admin/AdminRequestsPage'));
const AdminContentPage = lazy(() => import('./components/pages/admin/AdminContentPage'));
const AdminSettingsPage = lazy(() => import('./components/pages/admin/AdminSettingsPage'));

// Lazy load demo pages (two-level: overview and gallery)
const DemoOverviewPage = lazy(() => import('./components/pages/DemoOverviewPage'));
const DemoGalleryPage = lazy(() => import('./components/pages/DemoGalleryPage'));


// A fallback component to show while lazy-loaded components are loading
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
  </div>
);

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Admin Routes Component - Uses independent AdminLayout; wrapped in AdminProtectedRoute so only admins can access
const AdminRoutes: React.FC<{ Protection: React.FC }> = ({ Protection }) => {
  return (
    <Routes>
      <Route path="/admin" element={<Protection />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="demos" element={<AdminDemosPage />} />
        <Route path="pricing" element={<AdminPricingPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="blog" element={<AdminDashboardPage />} />
        <Route path="contacts" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminDashboardPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};

const PublicContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isLoading, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
    
  const PublicProtectedRoute: React.FC = () => {
    return currentUser ? <Outlet /> : <Navigate to="/" replace />;
  };

  // Admin route is open: always render dashboard (no login / no AdminAccessRequired)
  const AdminProtectedRoute: React.FC = () => <Outlet />;

  const handleLoginSuccess = (user: User) => {
    login(user);
    if (location.state?.from === '/admin' && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Check if we're on an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Render admin routes with independent layout (admin-only; redirect to / if not admin)
  if (isAdminRoute) {
    return <AdminRoutes Protection={AdminProtectedRoute} />;
  }

  // Render public routes with MainLayout
  return (
    <MainLayout
      theme={theme}
      toggleTheme={toggleTheme}
      currentUser={currentUser}
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
    >
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/demos" element={<DemosLandingPage />} />
        <Route path="/demos/:serviceSlug/:demoSlug" element={<DemoGalleryPage />} />
        <Route path="/demos/:serviceSlug" element={<DemoOverviewPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage theme={theme} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* Protected Routes for Logged-in Public Users */}
        <Route element={<PublicProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Route>

        {/* Fallback for any public routes not matching */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </CmsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;