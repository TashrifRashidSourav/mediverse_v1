import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';
import { auth } from '../firebase';
import firebase from 'firebase/compat/app';
import LoginOptionsModal from './LoginOptionsModal'; // Import the new modal

// Simple icons for hamburger and close
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
    await auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleNavAndScroll = (targetId: string) => {
    setIsMobileMenuOpen(false);
    if (window.location.hash !== '#/') {
       navigate('/');
       setTimeout(() => {
         document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    } else {
       document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
             <MedicalIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-slate-900">Medicore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center space-x-8">
              <Link to="/hospitals" className="text-slate-700 hover:text-primary transition-colors">Hospitals</Link>
              <Link to="/doctors" className="text-slate-700 hover:text-primary transition-colors">Doctors</Link>
              <button onClick={() => handleNavAndScroll('pricing')} className="text-slate-700 hover:text-primary transition-colors">Pricing</button>
              <Link to="/contact" className="text-slate-700 hover:text-primary transition-colors">Contact</Link>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-700 hover:text-primary focus:outline-none p-2"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        
        <div 
          className={`relative w-64 max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <span className="text-xl font-bold text-slate-900">Menu</span>
            <button 
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-500 hover:text-red-500 p-2"
            >
              <CloseIcon />
            </button>
          </div>
          
          <div className="flex flex-col p-6 gap-6 overflow-y-auto">
            <nav className="flex flex-col space-y-4">
              <Link to="/hospitals" onClick={handleLinkClick} className="text-lg text-slate-700 hover:text-primary transition-colors">Hospitals</Link>
              <Link to="/doctors" onClick={handleLinkClick} className="text-lg text-slate-700 hover:text-primary transition-colors">Doctors</Link>
              <button onClick={() => handleNavAndScroll('pricing')} className="text-lg text-left text-slate-700 hover:text-primary transition-colors">Pricing</button>
              <Link to="/contact" onClick={handleLinkClick} className="text-lg text-slate-700 hover:text-primary transition-colors">Contact</Link>
            </nav>
            
            <div className="h-px w-full bg-slate-200" />
            
            <div className="flex flex-col gap-4">
              {session ? (
                <>
                  <Link to={dashboardPath} onClick={handleLinkClick} className="font-semibold text-center text-primary border border-primary px-5 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-200 text-slate-800 font-semibold px-5 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} 
                    className="font-semibold text-primary border border-primary px-5 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => handleNavAndScroll('pricing')} 
                    className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginOptionsModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;