import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
// FIX: Module '"firebase/auth"' has no exported member 'onAuthStateChanged' or 'User'.
// Switched to Firebase v8 style imports and usage.
// FIX: Changed to compat import to resolve firebase.User type error.
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // FIX: Use firebase.User for v8 compatibility
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Switched from modular onAuthStateChanged(auth, ...) to namespaced auth.onAuthStateChanged(...)
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;