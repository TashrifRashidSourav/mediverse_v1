import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth } from '../../firebase';

interface PatientProtectedRouteProps {
  children: React.ReactNode;
}

const PatientProtectedRoute: React.FC<PatientProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to the new global patient login page
    return <Navigate to="/patient/login" replace />;
  }
  
  // Verify that a patient profile exists in localStorage.
  // This prevents a hospital admin from accessing the patient dashboard.
  const patientProfile = localStorage.getItem('patientProfile');
  if (!patientProfile) {
      // If user is authenticated but has no patient profile, log them out and redirect.
      auth.signOut();
      return <Navigate to="/patient/login" replace />;
  }

  return <>{children}</>;
};

export default PatientProtectedRoute;
