import React, { lazy, Suspense } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { RESERVED_SUBDOMAINS } from './constants';
import ScrollToTop from './components/ScrollToTop';
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const HospitalSitePage = lazy(() => import('./pages/HospitalSitePage'));
import NotFoundPage from './pages/NotFoundPage';
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const DoctorManagement = lazy(() => import('./pages/dashboard/DoctorManagement'));
const PatientManagement = lazy(() => import('./pages/dashboard/PatientManagement'));
const AppointmentManagement = lazy(() => import('./pages/dashboard/AppointmentManagement'));
const BillingPage = lazy(() => import('./pages/dashboard/BillingPage'));
const InventoryPage = lazy(() => import('./pages/dashboard/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/dashboard/ReportsPage'));
const WebsiteSettings = lazy(() => import('./pages/dashboard/WebsiteSettings'));
const PatientLoginPage = lazy(() => import('./pages/patient-portal/PatientLoginPage'));
const PatientSignUpPage = lazy(() => import('./pages/patient-portal/PatientSignUpPage'));
const PatientDashboardPage = lazy(() => import('./pages/patient-portal/PatientDashboardPage'));
const PatientProtectedRoute = lazy(() => import('./components/patient-portal/PatientProtectedRoute'));
const PatientDashboardHome = lazy(() => import('./pages/patient-portal/dashboard/PatientDashboardHome'));
const PatientProfilePage = lazy(() => import('./pages/patient-portal/dashboard/PatientProfilePage'));
const PatientAppointmentsPage = lazy(() => import('./pages/patient-portal/dashboard/PatientAppointmentsPage'));
const PatientPrescriptionsPage = lazy(() => import('./pages/patient-portal/dashboard/PatientPrescriptionsPage'));
const PatientBillingPage = lazy(() => import('./pages/patient-portal/dashboard/PatientBillingPage'));
const BookAppointmentPage = lazy(() => import('./pages/patient-portal/BookAppointmentPage'));
const VideoCallPage = lazy(() => import('./pages/VideoCallPage'));
const AuthenticatedRoute = lazy(() => import('./components/AuthenticatedRoute'));
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('./pages/PaymentFailPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));
const HospitalListPage = lazy(() => import('./pages/HospitalListPage'));
const MediDoctorPage = lazy(() => import('./pages/MediDoctorPage'));
const AdvertisePage = lazy(() => import('./pages/dashboard/AdvertisePage'));
const ChatManagement = lazy(() => import('./pages/dashboard/ChatManagement'));
const PatientChatPage = lazy(() => import('./pages/patient-portal/dashboard/PatientChatPage'));

// Doctor Portal Imports
const DoctorLoginPage = lazy(() => import('./pages/doctor-portal/DoctorLoginPage'));
const DoctorProtectedRoute = lazy(() => import('./components/doctor-portal/DoctorProtectedRoute'));
const DoctorDashboardPage = lazy(() => import('./pages/doctor-portal/DoctorDashboardPage'));
const DoctorDashboardHome = lazy(() => import('./pages/doctor-portal/dashboard/DoctorDashboardHome'));
const DoctorPatientAccessPage = lazy(() => import('./pages/doctor-portal/dashboard/DoctorPatientAccessPage'));
const DoctorPrescriptionPage = lazy(() => import('./pages/doctor-portal/dashboard/DoctorPrescriptionPage'));

// Super Admin Imports
const SuperAdminLoginPage = lazy(() => import('./pages/super-admin/SuperAdminLoginPage'));
const SuperAdminDashboardPage = lazy(() => import('./pages/super-admin/SuperAdminDashboardPage'));
const SuperAdminProtectedRoute = lazy(() => import('./components/super-admin/SuperAdminProtectedRoute'));


const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/fail" element={<PaymentFailPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      <Route path="/hospitals" element={<HospitalListPage />} />
      <Route path="/doctors" element={<MediDoctorPage />} />


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
        <Route path="hospitals" element={<HospitalListPage />} />
        <Route path="doctors" element={<MediDoctorPage />} />
        <Route path="chat" element={<PatientChatPage />} />
      </Route>
      
      {/* NEW: Patient Appointment Booking Route */}
      <Route path="/:subdomain/book-appointment" element={
        <PatientProtectedRoute>
          <BookAppointmentPage />
        </PatientProtectedRoute>
      } />

      {/* Hospital Subdomain Sites */}
      <Route path="/:subdomain" element={<HospitalSitePageWrapper page="home" />} />
      <Route path="/:subdomain/about" element={<HospitalSitePageWrapper page="about" />} />
      <Route path="/:subdomain/doctors" element={<HospitalSitePageWrapper page="doctors" />} />
      <Route path="/:subdomain/contact" element={<HospitalSitePageWrapper page="contact" />} />

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
        <Route path="advertise" element={<AdvertisePage />} />
        <Route path="chat" element={<ChatManagement />} />
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
    </Suspense>
  );
};

interface HospitalSitePageWrapperProps {
    page?: 'home' | 'about' | 'doctors' | 'contact';
}

const HospitalSitePageWrapper: React.FC<HospitalSitePageWrapperProps> = ({ page = 'home' }) => {
    const { subdomain } = useParams<{ subdomain: string }>();
    if (subdomain && RESERVED_SUBDOMAINS.includes(subdomain)) {
        return <NotFoundPage />;
    }
    
    if (subdomain?.includes('dashboard') || subdomain?.includes('patient-portal')) {
        return <NotFoundPage />;
    }

    return <HospitalSitePage page={page} />;
};

export default App;