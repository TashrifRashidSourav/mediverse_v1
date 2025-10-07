import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { User } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          // Fetch user profile from Firestore (v8 style)
          const userDocRef = db.collection('users').doc(currentUser.uid);
          const userDoc = await userDocRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data() as User;
            setUserProfile(userData);
             // Security check: ensure the URL subdomain matches the logged-in user's subdomain
            if (userData.subdomain !== subdomain) {
                // If not, redirect to their correct dashboard URL
                navigate(`/${userData.subdomain}/dashboard`, { replace: true });
            }
          } else {
            setError('User profile not found. Please contact support.');
          }
        } catch (e) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
      } else {
         // This case should be handled by ProtectedRoute, but it's a safe fallback.
         navigate('/login');
      }
    };

    fetchUserProfile();
  }, [subdomain, navigate]);
  
  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userProfile');
    navigate('/login');
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p>Loading Dashboard...</p></div>;
  }
  
  if (error || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p className="text-red-500">{error || 'Could not load user data.'}</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{userProfile.hospitalName}</h1>
            <p className="text-slate-600">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl shadow">
          <h2 className="text-xl font-bold text-slate-800">Welcome, {userProfile.email}!</h2>
          <p className="mt-2 text-slate-600">This is your admin dashboard. You can manage your website from here.</p>
          <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-slate-700 font-semibold">Your Website Link:</p>
              <a 
                  href={`/#/${userProfile.subdomain}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-lg font-bold text-primary hover:underline break-all"
              >
                  {window.location.origin}/#/{userProfile.subdomain}
              </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;