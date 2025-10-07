import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from './icons/MedicalIcon';
import { auth } from '../firebase';
// FIX: Module '"firebase/auth"' has no exported member 'onAuthStateChanged' or 'User'.
// Switched to Firebase v8 style imports and usage.
// FIX: Changed to compat import to resolve firebase.User type error.
import firebase from 'firebase/compat/app';

// We fetch user profile from Firestore, so session is simpler now
interface UserSession {
  uid: string;
  email: string | null;
  // We need to fetch the subdomain separately if needed
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null);

  useEffect(() => {
    // Use Firebase's auth state listener for real-time session management
    // FIX: Switched from modular onAuthStateChanged(auth, ...) to namespaced auth.onAuthStateChanged(...) and updated User type.
    const unsubscribe = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      if (user) {
        setSession({ uid: user.uid, email: user.email });
        // In a real app, you might fetch the user profile from Firestore here
        // For now, let's assume we can retrieve it if needed for the dashboard link
        // A simple way is to read it from localStorage if we decide to keep it there for non-sensitive data
         const storedUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
         if(storedUser.uid === user.uid) {
            setUserSubdomain(storedUser.subdomain);
         }
      } else {
        setSession(null);
        setUserSubdomain(null);
        localStorage.removeItem('userProfile');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleNavAndScroll = (targetId: string) => {
    if (window.location.hash.startsWith('#/')) {
       // We are on a sub-page, navigate to home first
       navigate('/');
       setTimeout(() => {
         const element = document.getElementById(targetId);
         element?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    } else {
       // Already on the homepage
       const element = document.getElementById(targetId);
       element?.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const dashboardPath = userSubdomain ? `/${userSubdomain}/dashboard` : '/login';

  return (
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
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Log In
                </Link>
                <button onClick={() => handleNavAndScroll('pricing')} className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;