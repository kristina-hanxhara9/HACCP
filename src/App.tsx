import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { initializeDefaults } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { BusinessListPage } from '@/pages/businesses/BusinessListPage';
import { BusinessDetailPage } from '@/pages/businesses/BusinessDetailPage';
import { InspectionListPage } from '@/pages/inspections/InspectionListPage';
import { InspectionWizardPage } from '@/pages/inspections/InspectionWizardPage';
import { NonConformancesPage } from '@/pages/nonconformances/NonConformancesPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ReportViewPage } from '@/pages/reports/ReportViewPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  useMediaQuery();

  useEffect(() => {
    initializeDefaults();
  }, []);

  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="businesses" element={<BusinessListPage />} />
        <Route path="businesses/:id" element={<BusinessDetailPage />} />
        <Route path="inspections" element={<InspectionListPage />} />
        <Route path="inspections/new" element={<InspectionWizardPage />} />
        <Route path="inspections/:id" element={<InspectionWizardPage />} />
        <Route path="nonconformances" element={<NonConformancesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:id" element={<ReportViewPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            },
            success: {
              style: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
            },
            error: {
              style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
