import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';
import { auth } from '../firebase';
import firebase from 'firebase/compat/app';
import LoginOptionsModal from './LoginOptionsModal'; // Import the new modal
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';

interface UserSession {
  uid: string;
  email: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string>('/login');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      if (user) {
        setSession({ uid: user.uid, email: user.email });
        const adminProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
        const patientProfile = JSON.parse(localStorage.getItem('patientProfile') || 'null');

        if (adminProfile && adminProfile.uid === user.uid) {
          setDashboardPath(`/${adminProfile.subdomain}/dashboard`);
        } else if (patientProfile && patientProfile.uid === user.uid) {
          setDashboardPath('/patient/dashboard');
        } else {
          // If auth but no profile, could be mid-signup or stale.
          // For simplicity, we don't set a path, forcing them to login again if they click dashboard.
          setDashboardPath('/login'); 
        }
      } else {
        setSession(null);
        setDashboardPath('/login');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('patientProfile');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await auth.signOut();
    navigate('/login');
  };

  const handleNavAndScroll = (targetId: string) => {
    setIsMobileMenuOpen(false);
    // Home reads the hash ("#/#pricing") and scrolls once it has rendered.
    const onHome = window.location.hash === '' || /^#\/(#.*)?$/.test(window.location.hash);
    if (!onHome) {
       navigate(`/#${targetId}`);
    } else {
       document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
             <MedicalIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-slate-900">MediVerse</span>
          </Link>
          <button
            type="button"
            className="md:hidden text-slate-700 p-1"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(o => !o)}
          >
            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center space-x-8">
              <Link to="/hospitals" className="text-slate-600 hover:text-primary transition-colors">Hospitals</Link>
              <Link to="/doctors" className="text-slate-600 hover:text-primary transition-colors">Doctors</Link>
              <button onClick={() => handleNavAndScroll('pricing')} className="text-slate-600 hover:text-primary transition-colors">Pricing</button>
              <Link to="/contact" className="text-slate-600 hover:text-primary transition-colors">Contact</Link>
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
                  <button onClick={() => setIsLoginModalOpen(true)} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Log In
                  </button>
                  <button onClick={() => handleNavAndScroll('pricing')} className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
            <Link to="/hospitals" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium">Hospitals</Link>
            <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium">Doctors</Link>
            <button onClick={() => handleNavAndScroll('pricing')} className="text-left text-slate-700 font-medium">Pricing</button>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium">Contact</Link>
            <div className="h-px bg-slate-200" />
            {session ? (
              <>
                <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-primary">Dashboard</Link>
                <button onClick={handleLogout} className="bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-lg">Log Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="text-left font-semibold text-primary">Log In</button>
                <button onClick={() => handleNavAndScroll('pricing')} className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg">Get Started</button>
              </>
            )}
          </div>
        )}
      </header>
      <LoginOptionsModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;