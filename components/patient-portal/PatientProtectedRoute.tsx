import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth, db } from '../../firebase';

interface PatientProtectedRouteProps {
  children: React.ReactNode;
}

const PatientProtectedRoute: React.FC<PatientProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsPatient(false);
        setLoading(false);
        return;
      }

      // A patient is someone with a profile in the global /patients collection. Check it
      // instead of only trusting localStorage, so a fresh tab works and a hospital admin
      // opening this URL is simply redirected (not signed out of their admin session).
      try {
        const doc = await db.collection('patients').doc(currentUser.uid).get();
        if (cancelled) return;
        if (doc.exists) {
          const data = doc.data() || {};
          localStorage.setItem('patientProfile', JSON.stringify({
            uid: currentUser.uid,
            name: data.name,
            profilePictureUrl: data.profilePictureUrl || '',
          }));
          setIsPatient(true);
        } else {
          setIsPatient(false);
        }
      } catch (error) {
        console.error('Could not verify patient account:', error);
        if (!cancelled) setIsPatient(false);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isPatient) {
    return <Navigate to="/patient/login" replace />;
  }

  return <>{children}</>;
};

export default PatientProtectedRoute;
