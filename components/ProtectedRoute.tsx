import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth, db } from '../firebase';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

type AccountState = 'approved' | 'pending' | 'rejected' | 'none';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountState>('none');

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccount('none');
        setLoading(false);
        return;
      }

      // Decide from Firestore (not from localStorage, which is stale after opening a new tab
      // and can be edited by the user).
      try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (cancelled) return;

        if (!doc.exists) {
          // Signed in, but not as a hospital (e.g. a patient). Do NOT sign them out:
          // they may be using another portal in a different tab.
          setAccount('none');
        } else {
          const data = doc.data() as User;
          const status = (data.status || 'approved') as AccountState;
          setAccount(status);
          if (status === 'approved') {
            localStorage.setItem('userProfile', JSON.stringify({
              uid: currentUser.uid,
              subdomain: data.subdomain,
              hospitalName: data.hospitalName,
              status,
            }));
          } else if (status === 'rejected') {
            await auth.signOut();
          }
        }
      } catch (error) {
        console.error('Could not verify hospital account:', error);
        if (!cancelled) setAccount('none');
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (account === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (account !== 'approved') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
