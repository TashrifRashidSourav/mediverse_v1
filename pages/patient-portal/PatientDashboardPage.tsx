import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import PatientSidebar from '../../components/patient-portal/PatientSidebar';
import { MenuIcon } from '../../components/icons/MenuIcon';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import UserMenu from '../../components/UserMenu';

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
            if (parsed.uid !== currentUser.uid) {
                handleLogout();
                return;
            }
            setPatientProfile(parsed);

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
                    localStorage.setItem('patientProfile', JSON.stringify(updatedProfile));
                 } else {
                    handleLogout();
                 }
            });
            return () => unsubscribe();
        } else {
            handleLogout();
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
        <div className="flex h-screen h-dvh bg-slate-100 font-sans">
            <PatientSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} patientName={patientProfile.name} />

            <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64">
                <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200">
                    <div className="px-6 py-3 flex justify-between items-center">
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-slate-600">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <div className="hidden md:block"></div> {/* Spacer */}
                        
                        <UserMenu trigger={<>
                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                    {patientProfile.profilePictureUrl ? (
                                        <img loading="lazy" decoding="async" src={patientProfile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                     ) : (
                                        patientProfile.name?.charAt(0).toUpperCase() || <UserCircleIcon className="w-6 h-6" />
                                    )}
                                </div>
                               <span className="font-semibold text-slate-700 hidden sm:block">{patientProfile.name}</span>
                               <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                           </>}>
                               <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                 Log Out
                               </button>
                             </UserMenu>
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
