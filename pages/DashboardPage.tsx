import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { MenuIcon } from '../components/icons/MenuIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { auth, db } from '../firebase';
import { type User, type SiteSettings, PlanTier } from '../types';
import MediBot from '../components/MediBot';

const DashboardPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<User>>({});
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>({});
  const [showMediBot, setShowMediBot] = useState(false);
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const currentUser = auth.currentUser;
    if (storedProfile && currentUser) {
      const parsedProfile = JSON.parse(storedProfile);
      setUserProfile(parsedProfile);
      if(subdomain !== parsedProfile.subdomain) {
          auth.signOut();
          navigate('/login');
          return;
      }
      
      const fetchData = async () => {
          try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data() as User;
                if (userData.plan === PlanTier.Golden || userData.plan === PlanTier.Premium) {
                    setShowMediBot(true);
                }
            }

            const settingsDoc = await db.collection('users').doc(currentUser.uid).collection('settings').doc('site').get();
            if (settingsDoc.exists) {
                setSiteSettings(settingsDoc.data() as SiteSettings);
            }
          } catch (error) {
              console.error("Error fetching dashboard data:", error);
          }
      };
      fetchData();

    } else {
        auth.signOut();
        navigate('/login');
    }
  }, [subdomain, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
        hospitalName={userProfile.hospitalName || 'Dashboard'} 
        subdomain={subdomain!}
        logoUrl={siteSettings.logoUrl}
       />

      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200">
          <div className="px-6 py-3 flex justify-between items-center">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-slate-600">
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div className="relative group">
               <button className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {userProfile.hospitalName?.charAt(0).toUpperCase() || 'A'}
                 </div>
                 <span className="font-semibold text-slate-700 hidden sm:block">{userProfile.hospitalName}</span>
                 <ChevronDownIcon className="h-4 w-4 text-slate-500" />
               </button>
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                 <a href={`/#/${subdomain}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">View Live Site</a>
                 <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Log Out</button>
               </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {showMediBot && <MediBot />}
    </div>
  );
};

export default DashboardPage;