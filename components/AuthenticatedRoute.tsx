import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means loading

  useEffect(() => {
    // First, check for the doctor's localStorage session, which is synchronous.
    const doctorProfile = localStorage.getItem('doctorProfile');
    if (doctorProfile) {
      setIsAuthenticated(true);
      return; // Found a valid session, no need to check Firebase.
    }

    // If no doctor session, check for a Firebase Auth session (for patients).
    // This is asynchronous.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      // A user is authenticated as a patient if currentUser is not null AND they have a patientProfile.
      // This prevents hospital admins from accessing the video call route.
      const patientProfile = localStorage.getItem('patientProfile');
      if (currentUser && patientProfile) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>;
  }

  if (!isAuthenticated) {
    // If not authenticated as either a doctor or a patient, redirect to the home page.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
