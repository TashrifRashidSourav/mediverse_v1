import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';

interface UserSession {
  subdomain: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(() => {
    const storedSession = localStorage.getItem('userSession');
    return storedSession ? JSON.parse(storedSession) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedSession = localStorage.getItem('userSession');
      setSession(storedSession ? JSON.parse(storedSession) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setSession(null);
    navigate('/login');
  };

  const dashboardPath = session ? `/${session.subdomain}/dashboard` : '/dashboard';

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
           <MedicalIcon className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-slate-900">Mediverse</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center space-x-8">
            <a href="/#features" className="text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="/#pricing" className="text-slate-600 hover:text-primary transition-colors">Pricing</a>
            <a href="/#contact" className="text-slate-600 hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to={dashboardPath} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-slate-200 text-slate-800 font-semibold px-5 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm hover:shadow-md"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Log In
                </Link>
                <a href="/#pricing" className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;