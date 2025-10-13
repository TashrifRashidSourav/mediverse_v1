import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { Doctor, User, SiteSettings } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';

const DoctorLoginPage: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const navigate = useNavigate();
    
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [password, setPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const fetchHospitalAndDoctors = async () => {
            if (!subdomain) {
                setError('Hospital not found.');
                setIsLoading(false);
                return;
            }
            try {
                const usersRef = db.collection('users');
                const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();

                if (userQuery.empty) {
                    setError(`No hospital found for subdomain: ${subdomain}`);
                    setIsLoading(false);
                    return;
                }

                const hospitalDoc = userQuery.docs[0];
                const hospitalData = hospitalDoc.data() as User;
                setHospitalName(hospitalData.hospitalName);

                // Fetch site settings for branding
                const settingsDoc = await usersRef.doc(hospitalDoc.id).collection('settings').doc('site').get();
                if (settingsDoc.exists) {
                    setSiteSettings(settingsDoc.data() as SiteSettings);
                }

                const doctorsSnapshot = await usersRef.doc(hospitalDoc.id).collection('doctors').orderBy('name').get();
                const doctorsList = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
                
                setDoctors(doctorsList);
                if (doctorsList.length > 0) {
                    setSelectedDoctorId(doctorsList[0].id);
                }

            } catch (err) {
                setError('Failed to load hospital data. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospitalAndDoctors();
    }, [subdomain]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

        if (!selectedDoctor) {
            setError('Please select a doctor.');
            setIsSubmitting(false);
            return;
        }

        if (selectedDoctor.password === password) {
            // "Log in" the doctor by setting a profile in local storage
            const doctorProfile = {
                id: selectedDoctor.id,
                name: selectedDoctor.name,
                specialization: selectedDoctor.specialization,
                qualifications: selectedDoctor.qualifications,
                subdomain: subdomain,
                hospitalName: hospitalName,
                settings: siteSettings, // Include theme settings
            };
            localStorage.setItem('doctorProfile', JSON.stringify(doctorProfile));
            navigate(`/${subdomain}/doctor-portal/dashboard`);
        } else {
            setError('Invalid credentials. Please check your password.');
        }

        setIsSubmitting(false);
    };
    
    const themeColor = siteSettings?.themeColor || '#0D9488';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                     {siteSettings?.logoUrl ? (
                        <img src={siteSettings.logoUrl} alt={`${hospitalName} Logo`} className="h-16 mx-auto mb-2"/>
                     ) : (
                        <MedicalIcon className="h-12 w-12 mx-auto" style={{ color: themeColor }}/>
                     )}
                    <h1 className="mt-4 text-3xl font-bold text-slate-900">Doctor Portal</h1>
                    <p className="mt-1 text-slate-600 font-semibold">{hospitalName || 'Loading...'}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {isLoading ? (
                        <p className="text-center text-slate-500">Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="doctor" className="font-semibold text-slate-700 block mb-1.5">Select Your Name</label>
                                <select
                                    id="doctor"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 transition bg-white"
                                    style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                                    required
                                >
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 transition"
                                    style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                                    required
                                />
                            </div>

                            {error && <p className="text-red-600 text-sm">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting || doctors.length === 0}
                                className="w-full text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: themeColor }}
                            >
                                {isSubmitting ? 'Logging In...' : 'Log In'}
                            </button>
                        </form>
                    )}
                     <p className="text-center text-xs text-slate-500 mt-6">
                        Are you a Hospital Manager? <Link to={`/login`} className="font-semibold hover:underline" style={{color: themeColor}}>Login Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DoctorLoginPage;