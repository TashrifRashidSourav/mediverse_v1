import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface DoctorProtectedRouteProps {
  children: React.ReactNode;
}

const DoctorProtectedRoute: React.FC<DoctorProtectedRouteProps> = ({ children }) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const doctorProfile = JSON.parse(localStorage.getItem('doctorProfile') || 'null');

  // Check if doctor profile exists and if the subdomain in the profile matches the URL
  if (!doctorProfile || doctorProfile.subdomain !== subdomain) {
    // Clear potentially stale profile and redirect to the correct login page
    localStorage.removeItem('doctorProfile');
    return <Navigate to={`/${subdomain}/doctor-portal/login`} replace />;
  }

  return <>{children}</>;
};

export default DoctorProtectedRoute;
