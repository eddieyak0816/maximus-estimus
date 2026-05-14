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
import { useAssessmentStore } from './store/assessmentStore';

function NewRedirect() {
  const navigate = useNavigate();
  const createAssessment = useAssessmentStore(s => s.createAssessment);
  useEffect(() => {
    const id = createAssessment();
    navigate(`/assessment/${id}/client`, { replace: true });
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter basename="/maximus-estimus/">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewRedirect />} />
          <Route path="/assessment/:id/client" element={<CustomerInfoPage />} />
          <Route path="/assessment/:id/type" element={<JobTypePage />} />
          <Route path="/assessment/:id/estimate" element={<EstimatePage />} />
          <Route path="/assessment/:id/summary" element={<SummaryView />} />
          <Route path="/assessment/:id" element={<AssessmentDetail />} />
          <Route path="/assessment/:id/:tab" element={<AssessmentDetail />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/price-guide" element={<PriceGuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
