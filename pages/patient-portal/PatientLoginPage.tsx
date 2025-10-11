import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';
import { User, SiteSettings } from '../../types';

const PatientLoginPage: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [hospital, setHospital] = useState<User | null>(null);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHospitalData = async () => {
            if (!subdomain) return;
            try {
                const querySnapshot = await db.collection('users').where('subdomain', '==', subdomain).limit(1).get();
                if (!querySnapshot.empty) {
                    const hospitalData = querySnapshot.docs[0].data() as User;
                    setHospital(hospitalData);
                    const settingsDoc = await db.collection('users').doc(hospitalData.uid).collection('settings').doc('site').get();
                    if(settingsDoc.exists){
                        setSettings(settingsDoc.data() as SiteSettings);
                    }
                }
            } catch (error) {
                console.error("Error fetching hospital data for patient portal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitalData();
    }, [subdomain]);

    const themeColor = settings?.themeColor || '#0D9488';

    if(loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if(!hospital) {
        return <div className="min-h-screen flex items-center justify-center">Hospital not found.</div>;
    }


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-12 mx-auto mb-4"/>
                ) : (
                    <MedicalIcon className="h-12 w-12 mx-auto mb-4" style={{color: themeColor}} />
                )}
                <h1 className="text-3xl font-bold text-slate-900">Patient Portal</h1>
                <p className="text-slate-600">for {hospital.hospitalName}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Sign In</h2>
                 <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address</label>
                        <input type="email" id="email" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 transition" style={{'--tw-ring-color': themeColor} as React.CSSProperties} required />
                    </div>
                    <div>
                        <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Password</label>
                        <input type="password" id="password" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 transition" style={{'--tw-ring-color': themeColor} as React.CSSProperties} required />
                    </div>
                    <button type="submit" style={{backgroundColor: themeColor}} className="w-full text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                        Sign In
                    </button>
                </form>
                 <p className="text-center text-slate-600 mt-6 text-sm">
                    Don't have an account?{' '}
                    <a href="#" className="font-semibold hover:underline" style={{color: themeColor}}>
                        Sign up
                    </a>
                </p>
            </div>
             <p className="text-center text-xs text-slate-500 mt-4">
                <Link to="/" className="hover:underline">Powered by Mediverse</Link>
            </p>
        </div>
    </div>
  );
};

export default PatientLoginPage;