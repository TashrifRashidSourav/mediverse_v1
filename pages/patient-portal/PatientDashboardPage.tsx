import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import PatientSidebar from '../../components/patient-portal/PatientSidebar';
import { MenuIcon } from '../../components/icons/MenuIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';

interface PatientProfile {
    uid: string;
    name: string;
    profilePictureUrl?: string;
}

const PatientDashboardPage: React.FC = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedProfile = localStorage.getItem('patientProfile');
        const currentUser = auth.currentUser;

        if (storedProfile && currentUser) {
            const parsed = JSON.parse(storedProfile);
            // Ensure the stored profile matches the authenticated user
            if (parsed.uid !== currentUser.uid) {
                handleLogout();
                return;
            }
            setPatientProfile(parsed);
            
            // Listen for real-time updates from the global patient collection
            const patientRef = db.collection('patients').doc(currentUser.uid);
            const unsubscribe = patientRef.onSnapshot(doc => {
                 if (doc.exists) {
                    const data = doc.data();
                    const updatedProfile = { 
                        uid: currentUser.uid, 
                        name: data?.name, 
                        profilePictureUrl: data?.profilePictureUrl 
                    };
                    setPatientProfile(updatedProfile);
                    // Keep localStorage in sync
                    localStorage.setItem('patientProfile', JSON.stringify(updatedProfile));
                 } else {
                    // Profile was deleted from DB, force logout
                    handleLogout();
                 }
            });
            return () => unsubscribe();
        } else {
            handleLogout(); // No profile or user, force logout
        }
    }, [navigate]);

    const handleLogout = async () => {
        await auth.signOut();
        localStorage.removeItem('patientProfile');
        navigate('/patient/login');
    };

    if (!patientProfile) {
        return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <PatientSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} patientName={patientProfile.name} />

            <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
                <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200">
                    <div className="px-6 py-3 flex justify-between items-center">
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-slate-600">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <div className="hidden md:block"></div> {/* Spacer */}
                        
                        <div className="relative group">
                           <button className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                    {patientProfile.profilePictureUrl ? (
                                        <img src={patientProfile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                     ) : (
                                        patientProfile.name?.charAt(0).toUpperCase() || <UserCircleIcon className="w-6 h-6" />
                                    )}
                                </div>
                               <span className="font-semibold text-slate-700 hidden sm:block">{patientProfile.name}</span>
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
        </div>
    );
};

export default PatientDashboardPage;
