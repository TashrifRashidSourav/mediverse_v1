import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';

interface UserSession {
  email: string;
  hospitalName: string;
  subdomain: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setUser(parsedSession);
      // Validate that the URL subdomain matches the session subdomain
      if (parsedSession.subdomain === subdomain) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      // Should be caught by ProtectedRoute, but as a fallback
      setIsValid(false);
    }
  }, [subdomain]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    window.dispatchEvent(new Event('storage')); // Notify header to update
    navigate('/login');
  };
  
  // While checking validity
  if (isValid === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p>Verifying session...</p></div>;
  }
  
  // If subdomain in URL doesn't match session, redirect to the correct dashboard URL
  if (!isValid && user) {
     return <Navigate to={`/${user.subdomain}/dashboard`} replace />;
  }

  if (!user) {
    // This case should be handled by ProtectedRoute, but it's a safe fallback.
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.hospitalName}</h1>
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
          <h2 className="text-xl font-bold text-slate-800">Welcome, {user.email}!</h2>
          <p className="mt-2 text-slate-600">This is your admin dashboard. You can manage your website from here.</p>
          <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-slate-700">Your live website:</p>
              <a 
                  href={`https://${user.subdomain}.mediverse.app`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-lg font-bold text-primary hover:underline"
              >
                  {user.subdomain}.mediverse.app
              </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;