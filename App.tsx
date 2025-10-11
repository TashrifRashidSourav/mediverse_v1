import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import HospitalSitePage from './pages/HospitalSitePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import DoctorManagement from './pages/dashboard/DoctorManagement';
import PatientManagement from './pages/dashboard/PatientManagement';
import AppointmentManagement from './pages/dashboard/AppointmentManagement';
import BillingPage from './pages/dashboard/BillingPage';
import InventoryPage from './pages/dashboard/InventoryPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import WebsiteSettings from './pages/dashboard/WebsiteSettings';
import PatientLoginPage from './pages/patient-portal/PatientLoginPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Hospital Subdomain Sites */}
      <Route path="/:subdomain" element={<HospitalSitePageWrapper />} />
      <Route path="/:subdomain/patient-portal/login" element={<PatientLoginPage />} />

      {/* Dashboard Routes */}
      <Route path="/:subdomain/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<WebsiteSettings />} />
      </Route>

      {/* Fallback 404 Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};


// A small wrapper to handle reserved paths and pass subdomain to HospitalSitePage
const HospitalSitePageWrapper = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const reservedPaths = ['signup', 'login', 'patient-portal'];

    if (subdomain && reservedPaths.includes(subdomain)) {
        return <NotFoundPage />;
    }
    
    // Check if subdomain contains a known dashboard path segment
    if (subdomain?.includes('dashboard') || subdomain?.includes('doctors') || subdomain?.includes('patients')) {
        return <NotFoundPage />;
    }

    return <HospitalSitePage />;
};

export default App;