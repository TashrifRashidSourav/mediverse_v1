import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Routes, Route, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { User, PlanTier } from '../types';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHome from './dashboard/DashboardHome';
import DoctorManagement from './dashboard/DoctorManagement';
import PatientManagement from './dashboard/PatientManagement';
import AppointmentManagement from './dashboard/AppointmentManagement';
import BillingPage from './dashboard/BillingPage';
import InventoryPage from './dashboard/InventoryPage';
import ReportsPage from './dashboard/ReportsPage';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = db.collection('users').doc(currentUser.uid);
          const userDoc = await userDocRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data() as User;
            setUserProfile(userData);
            if (userData.subdomain !== subdomain) {
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

  // Render Golden Plan Admin Panel
  if (userProfile.plan === PlanTier.Golden) {
    return (
      <div className="flex h-screen bg-slate-100 font-sans">
        <Sidebar hospitalName={userProfile.hospitalName} subdomain={subdomain!} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200">
            <div className="flex items-center justify-end h-16 px-6">
               <div className="relative">
                 <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
                   <span>{userProfile.email}</span>
                   <ChevronDownIcon className="h-4 w-4"/>
                 </button>
                 {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <a href={`/#/${userProfile.subdomain}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">View Site</a>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            Log Out
                        </button>
                    </div>
                 )}
               </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/doctors" element={<DoctorManagement />} />
              <Route path="/patients" element={<PatientManagement />} />
              <Route path="/appointments" element={<AppointmentManagement />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Render Standard Dashboard for other plans
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
           <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              Your current plan does not include the full hospital management suite. 
              <a href="/#pricing" className="font-bold underline ml-1">Upgrade to Golden</a> to unlock doctor, patient, and appointment management.
           </div>
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