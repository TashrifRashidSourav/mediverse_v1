import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor-portal/DoctorSidebar';
import { MenuIcon } from '../../components/icons/MenuIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { SiteSettings, PlanTier, User } from '../../types';
import MediBot from '../../components/MediBot';
import { db } from '../../firebase';

interface DoctorProfile {
    id: string;
    name: string;
    subdomain: string;
    hospitalName: string;
    settings: SiteSettings | null;
}

const DoctorDashboardPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [showMediBot, setShowMediBot] = useState(false);
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();

  useEffect(() => {
    const storedProfile = localStorage.getItem('doctorProfile');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      if(parsedProfile.subdomain !== subdomain) {
          handleLogout();
      } else {
          setDoctorProfile(parsedProfile);
          // Check hospital plan
          const checkPlan = async () => {
            try {
              const userQuery = await db.collection('users').where('subdomain', '==', subdomain).limit(1).get();
              if(!userQuery.empty) {
                const hospitalData = userQuery.docs[0].data() as User;
                if (hospitalData.plan === PlanTier.Golden) {
                  setShowMediBot(true);
                }
              }
            } catch (e) {
              console.error("Could not verify hospital plan for doctor", e);
            }
          };
          checkPlan();
      }
    } else {
        navigate(`/${subdomain}/doctor-portal/login`);
    }
  }, [subdomain, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('doctorProfile');
    navigate(`/${subdomain}/doctor-portal/login`);
  };
  
  if (!doctorProfile) {
    return <div className="min-h-screen flex items-center justify-center">Loading Doctor Profile...</div>;
  }
  
  const themeColor = doctorProfile.settings?.themeColor || '#0D9488';

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <DoctorSidebar 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
        hospitalName={doctorProfile.hospitalName}
        settings={doctorProfile.settings}
      />

      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200">
          <div className="px-6 py-3 flex justify-between items-center">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-slate-600">
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div className="relative group">
               <button className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: themeColor }}>
                    {doctorProfile.name?.charAt(0).toUpperCase() || <UserCircleIcon className="w-5 h-5"/>}
                 </div>
                 <span className="font-semibold text-slate-700 hidden sm:block">{doctorProfile.name}</span>
                 <ChevronDownIcon className="h-4 w-4 text-slate-500" />
               </button>
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                 <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Log Out</button>
               </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {showMediBot && <MediBot />}
    </div>
  );
};

export default DoctorDashboardPage;