import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';
import { auth } from '../firebase';
import firebase from 'firebase/compat/app';
import LoginOptionsModal from './LoginOptionsModal'; // Import the new modal

interface UserSession {
  uid: string;
  email: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string>('/login');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
    await auth.signOut();
    navigate('/login');
  };

  const handleNavAndScroll = (targetId: string) => {
    if (window.location.hash !== '#/') {
       navigate('/');
       setTimeout(() => {
         document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
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
            <span className="text-2xl font-bold text-slate-900">Mediverse</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center space-x-8">
              <button onClick={() => handleNavAndScroll('features')} className="text-slate-600 hover:text-primary transition-colors">Features</button>
              <button onClick={() => handleNavAndScroll('pricing')} className="text-slate-600 hover:text-primary transition-colors">Pricing</button>
              <button onClick={() => handleNavAndScroll('contact')} className="text-slate-600 hover:text-primary transition-colors">Contact</button>
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
      </header>
      <LoginOptionsModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;
