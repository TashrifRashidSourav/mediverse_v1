import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
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
import PatientSignUpPage from './pages/patient-portal/PatientSignUpPage';
import PatientDashboardPage from './pages/patient-portal/PatientDashboardPage';
import PatientProtectedRoute from './components/patient-portal/PatientProtectedRoute';
import PatientDashboardHome from './pages/patient-portal/dashboard/PatientDashboardHome';
import PatientProfilePage from './pages/patient-portal/dashboard/PatientProfilePage';
import PatientAppointmentsPage from './pages/patient-portal/dashboard/PatientAppointmentsPage';
import PatientPrescriptionsPage from './pages/patient-portal/dashboard/PatientPrescriptionsPage';
import PatientBillingPage from './pages/patient-portal/dashboard/PatientBillingPage';
import BookAppointmentPage from './pages/patient-portal/BookAppointmentPage';
import VideoCallPage from './pages/VideoCallPage';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import PendingApprovalPage from './pages/PendingApprovalPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

// Doctor Portal Imports
import DoctorLoginPage from './pages/doctor-portal/DoctorLoginPage';
import DoctorProtectedRoute from './components/doctor-portal/DoctorProtectedRoute';
import DoctorDashboardPage from './pages/doctor-portal/DoctorDashboardPage';
import DoctorDashboardHome from './pages/doctor-portal/dashboard/DoctorDashboardHome';
import DoctorPatientAccessPage from './pages/doctor-portal/dashboard/DoctorPatientAccessPage';
import DoctorPrescriptionPage from './pages/doctor-portal/dashboard/DoctorPrescriptionPage';

// Super Admin Imports
import SuperAdminLoginPage from './pages/super-admin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/super-admin/SuperAdminDashboardPage';
import SuperAdminProtectedRoute from './components/super-admin/SuperAdminProtectedRoute';


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/fail" element={<PaymentFailPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />


      {/* Super Admin Routes */}
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
      <Route path="/super-admin/dashboard" element={
        <SuperAdminProtectedRoute>
          <SuperAdminDashboardPage />
        </SuperAdminProtectedRoute>
      } />


      {/* NEW: Global Patient Portal Routes */}
      <Route path="/patient/login" element={<PatientLoginPage />} />
      <Route path="/patient/signup" element={<PatientSignUpPage />} />
      <Route path="/patient/dashboard" element={
        <PatientProtectedRoute>
          <PatientDashboardPage />
        </PatientProtectedRoute>
      }>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<PatientProfilePage />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
        <Route path="billing" element={<PatientBillingPage />} />
      </Route>
      
      {/* NEW: Patient Appointment Booking Route */}
      <Route path="/:subdomain/book-appointment" element={
        <PatientProtectedRoute>
          <BookAppointmentPage />
        </PatientProtectedRoute>
      } />

      {/* Hospital Subdomain Sites */}
      <Route path="/:subdomain" element={<HospitalSitePageWrapper />} />

      {/* Admin Dashboard Routes */}
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
      
      {/* Doctor Portal Routes */}
      <Route path="/:subdomain/doctor-portal/login" element={<DoctorLoginPage />} />
      <Route path="/:subdomain/doctor-portal/dashboard" element={
        <DoctorProtectedRoute>
          <DoctorDashboardPage />
        </DoctorProtectedRoute>
      }>
        <Route index element={<DoctorDashboardHome />} />
        <Route path="patients" element={<DoctorPatientAccessPage />} />
        <Route path="prescription" element={<DoctorPrescriptionPage />} />
         <Route path="prescription/:patientId" element={<DoctorPrescriptionPage />} />
      </Route>

      {/* Deprecated Patient Portal Routes - redirect or show not found */}
      <Route path="/:subdomain/patient-portal/*" element={<NotFoundPage />} />

      {/* Video Calling Route - accessible by both doctors and patients */}
      <Route path="/meet/:hospitalId/:appointmentId" element={
        <AuthenticatedRoute>
            <VideoCallPage />
        </AuthenticatedRoute>
      } />

      {/* Fallback 404 Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const HospitalSitePageWrapper = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const reservedPaths = ['signup', 'login', 'patient', 'doctor-portal', 'book-appointment', 'meet', 'pending-approval', 'super-admin', 'payment'];

    if (subdomain && reservedPaths.includes(subdomain)) {
        return <NotFoundPage />;
    }
    
    if (subdomain?.includes('dashboard') || subdomain?.includes('patient-portal')) {
        return <NotFoundPage />;
    }

    return <HospitalSitePage />;
};

export default App;