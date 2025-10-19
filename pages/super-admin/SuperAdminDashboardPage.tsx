import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { User, Plan, LandingPageSettings } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { BillingIcon } from '../../components/icons/BillingIcon';
import { GlobeIcon } from '../../components/icons/GlobeIcon';
import { PLANS as defaultPlans } from '../../constants';

type Tab = 'requests' | 'packages' | 'settings';

const SuperAdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('requests');
    const [requests, setRequests] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for package management
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isPlansLoading, setIsPlansLoading] = useState(false);

    // State for landing page settings
    const [landingSettings, setLandingSettings] = useState<LandingPageSettings>({
        heroTitle: '',
        heroSubtitle: '',
        heroImageUrl: '',
    });
     const [isSettingsLoading, setIsSettingsLoading] = useState(false);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const snapshot = await db.collection('users').where('status', '==', 'pending').get();
            setRequests(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)));
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
        setIsLoading(false);
    }, []);

    const fetchPlans = useCallback(async () => {
        setIsPlansLoading(true);
        try {
            const doc = await db.collection('settings').doc('plans').get();
            if (doc.exists) {
                const data = doc.data();
                if (data && Array.isArray(data.all)) {
                    setPlans(data.all);
                } else {
                    setPlans(defaultPlans);
                }
            } else {
                setPlans(defaultPlans);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            setPlans(defaultPlans);
        }
        setIsPlansLoading(false);
    }, []);
    
    const fetchLandingPageSettings = useCallback(async () => {
        setIsSettingsLoading(true);
        try {
            const doc = await db.collection('settings').doc('landingPage').get();
            if (doc.exists) {
                setLandingSettings(doc.data() as LandingPageSettings);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
        setIsSettingsLoading(false);
    }, []);

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'packages') fetchPlans();
        if (activeTab === 'settings') fetchLandingPageSettings();
    }, [activeTab, fetchRequests, fetchPlans, fetchLandingPageSettings]);

    const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
        await db.collection('users').doc(userId).update({ status });
        fetchRequests();
    };
    
    const handleSavePlans = async () => {
        if(window.confirm("Are you sure you want to save these plan changes? This will affect the public pricing page.")) {
            await db.collection('settings').doc('plans').set({ all: plans });
            alert("Plans updated successfully!");
        }
    };

    const handleSaveSettings = async () => {
        if(window.confirm("Are you sure you want to save these landing page changes? This will affect the public homepage.")) {
            await db.collection('settings').doc('landingPage').set(landingSettings);
            alert("Landing page settings updated successfully!");
        }
    };

    const handlePlanChange = (index: number, field: keyof Plan, value: any) => {
        const newPlans = [...plans];
        if (field === 'features') {
            newPlans[index][field] = value.split('\n');
        } else {
            (newPlans[index] as any)[field] = value;
        }
        setPlans(newPlans);
    };

    const handleLogout = () => {
        localStorage.removeItem('isSuperAdmin');
        navigate('/super-admin/login');
    };

    const navItems = [
        { id: 'requests', name: 'Hospital Requests', icon: UsersIcon },
        { id: 'packages', name: 'Manage Packages', icon: BillingIcon },
        { id: 'settings', name: 'Site Settings', icon: GlobeIcon },
    ];
    
    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 h-screen bg-slate-800 text-white flex flex-col">
                <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
                    <MedicalIcon className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold">Super Admin</span>
                </div>
                <nav className="p-4 flex-grow">
                    <ul>
                        {navItems.map(item => (
                             <li key={item.id} className="mb-1">
                                <button
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${activeTab === item.id ? 'bg-primary text-white' : ''}`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                 <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg">Log Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200 p-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {navItems.find(item => item.id === activeTab)?.name}
                    </h1>
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {activeTab === 'requests' && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
                            {isLoading ? <p>Loading requests...</p> : requests.length === 0 ? <p>No pending requests.</p> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead><tr className="bg-slate-50">
                                            <th className="p-3">Hospital Name</th><th className="p-3">Email</th><th className="p-3">Plan</th><th className="p-3">Actions</th>
                                        </tr></thead>
                                        <tbody>{requests.map(req => (
                                            <tr key={req.uid} className="border-b"><td className="p-3">{req.hospitalName}</td><td className="p-3">{req.email}</td><td className="p-3">{req.plan}</td>
                                                <td className="p-3 flex gap-2">
                                                    <button onClick={() => handleApproval(req.uid, 'approved')} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md">Approve</button>
                                                    <button onClick={() => handleApproval(req.uid, 'rejected')} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md">Reject</button>
                                                </td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                     {activeTab === 'packages' && (
                        <div>
                            {isPlansLoading ? <p>Loading plans...</p> :
                                <div className="space-y-6">
                                    {plans.map((plan, index) => (
                                        <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                                            <h3 className="text-xl font-bold mb-4 text-primary">{plan.tier} Plan</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className="font-semibold">Price (BDT)</label><input type="number" value={plan.price} onChange={e => handlePlanChange(index, 'price', e.target.value)} className="w-full mt-1 p-2 border rounded-md"/></div>
                                                <div><label className="font-semibold">Recommended</label><select value={String(plan.isRecommended)} onChange={e => handlePlanChange(index, 'isRecommended', e.target.value === 'true')} className="w-full mt-1 p-2 border rounded-md bg-white"><option value="true">Yes</option><option value="false">No</option></select></div>
                                                <div className="md:col-span-2"><label className="font-semibold">Features (one per line)</label><textarea rows={6} value={plan.features.join('\n')} onChange={e => handlePlanChange(index, 'features', e.target.value)} className="w-full mt-1 p-2 border rounded-md font-mono text-sm"></textarea></div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleSavePlans} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save All Plans</button>
                                </div>
                            }
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div>
                           {isSettingsLoading ? <p>Loading settings...</p> :
                            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <div><label className="font-semibold">Hero Title</label><input type="text" value={landingSettings.heroTitle} onChange={e => setLandingSettings({...landingSettings, heroTitle: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/>
                                <p className="text-xs text-slate-500 mt-1">Use `&lt;span class="text-primary"&gt;text&lt;/span&gt;` to highlight text.</p></div>
                                <div><label className="font-semibold">Hero Subtitle</label><textarea value={landingSettings.heroSubtitle} onChange={e => setLandingSettings({...landingSettings, heroSubtitle: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label className="font-semibold">Hero Image URL</label><input type="text" value={landingSettings.heroImageUrl} onChange={e => setLandingSettings({...landingSettings, heroImageUrl: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <button onClick={handleSaveSettings} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save Settings</button>
                            </div>
                           }
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboardPage;
