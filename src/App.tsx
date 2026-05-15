import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerInfoPage from './pages/CustomerInfoPage';
import JobTypePage from './pages/JobTypePage';
import AssessmentDetail from './pages/AssessmentDetail';
import GalleryPage from './pages/GalleryPage';
import PriceGuidePage from './pages/PriceGuidePage';
import EstimatePage from './pages/EstimatePage';
import SummaryView from './pages/SummaryView';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDropdownsPage from './pages/AdminDropdownsPage';
import { useAssessmentStore } from './store/assessmentStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-primary)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function NewRedirect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createAssessment = useAssessmentStore(s => s.createAssessment);
  useEffect(() => {
    const id = createAssessment(user?.id || '');
    navigate(`/assessment/${id}/client`, { replace: true });
  }, []);
  return null;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/client"
          element={
            <ProtectedRoute>
              <CustomerInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/type"
          element={
            <ProtectedRoute>
              <JobTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/estimate"
          element={
            <ProtectedRoute>
              <EstimatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/summary"
          element={
            <ProtectedRoute>
              <SummaryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id"
          element={
            <ProtectedRoute>
              <AssessmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/:tab"
          element={
            <ProtectedRoute>
              <AssessmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-guide"
          element={
            <ProtectedRoute>
              <PriceGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dropdowns"
          element={
            <ProtectedRoute>
              <AdminDropdownsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/maximus-estimus/">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
