import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { User, Doctor, SiteSettings, Patient } from '../types';
import { MedicalIcon } from '../components/icons/MedicalIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import AppointmentBookingModal from '../components/AppointmentBookingModal';
import firebase from 'firebase/compat/app';

const DoctorsListPage: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState<User | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [patientUser, setPatientUser] = useState<firebase.User | null>(null);
    const [patientProfile, setPatientProfile] = useState<Patient | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setPatientUser(user);
            if(user) {
                // Fetch full patient profile if logged in
                const fetchPatientProfile = async () => {
                    const patientDoc = await db.collection('patients').doc(user.uid).get();
                    if(patientDoc.exists) {
                        setPatientProfile({ id: patientDoc.id, ...patientDoc.data() } as Patient);
                    }
                }
                fetchPatientProfile();
            } else {
                setPatientProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!subdomain) {
                setError('No hospital specified.');
                setLoading(false);
                return;
            }
            try {
                const userQuery = await db.collection('users').where('subdomain', '==', subdomain).limit(1).get();
                if (userQuery.empty) {
                    setError(`Hospital '${subdomain}' not found.`);
                    setLoading(false);
                    return;
                }
                const hospitalDoc = userQuery.docs[0];
                const hospitalData = { uid: hospitalDoc.id, ...hospitalDoc.data() } as User;
                setHospital(hospitalData);

                const settingsDoc = await db.collection('users').doc(hospitalDoc.id).collection('settings').doc('site').get();
                if (settingsDoc.exists) setSettings(settingsDoc.data() as SiteSettings);

                const doctorsSnapshot = await db.collection('users').doc(hospitalDoc.id).collection('doctors').orderBy('name').get();
                setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));

            } catch (err) {
                console.error(err);
                setError('Failed to load hospital data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subdomain]);

    const handleOpenBookingModal = (doctor: Doctor) => {
        if (!patientUser) {
            // If not logged in, redirect to patient login, but pass a redirect URL
            navigate('/patient/login', { state: { from: window.location.hash } });
            return;
        }
        setSelectedDoctor(doctor);
        setIsBookingModalOpen(true);
    };
    
    const themeColor = settings?.themeColor || '#0D9488';

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Doctors...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold">{error}</div>;
    if (!hospital) return <div className="min-h-screen flex items-center justify-center">Hospital data could not be loaded.</div>;

    return (
        <>
            <div className="bg-slate-50 min-h-screen">
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link to={`/#/${subdomain}`} className="flex items-center gap-3">
                             {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 max-h-10 object-contain"/>
                            ) : (
                                <MedicalIcon className="h-8 w-8" style={{color: themeColor}}/>
                            )}
                            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
                        </Link>
                         <nav className="flex items-center gap-4">
                            {patientUser ? (
                                <Link to="/patient/dashboard" className="font-semibold" style={{color: themeColor}}>My Dashboard</Link>
                            ) : (
                                <Link to="/patient/login" className="font-semibold" style={{color: themeColor}}>Patient Login</Link>
                            )}
                         </nav>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold text-slate-800 text-center">Our Doctors</h1>
                    <p className="text-center text-slate-600 mt-2">Find a specialist and book your appointment today.</p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col">
                                <div className="flex items-center gap-4">
                                     <div className="w-20 h-20 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-12 w-12 text-slate-400" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                                        <p className="font-semibold" style={{color: themeColor}}>{doctor.specialization}</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm mt-3">{doctor.qualifications}</p>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex-grow">
                                     <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-600">Consultation Fee:</span>
                                        <span className="font-bold text-slate-800">${doctor.visitFee || 'N/A'}</span>
                                     </div>
                                      <div className="mt-3">
                                        <p className="font-semibold text-slate-600 mb-1">Availability:</p>
                                        <p className="text-sm text-slate-500">
                                            {doctor.availability?.days?.join(', ') || 'Not specified'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {doctor.availability?.startTime} to {doctor.availability?.endTime}
                                        </p>
                                     </div>
                                </div>
                                <button
                                    onClick={() => handleOpenBookingModal(doctor)}
                                    className="w-full mt-4 text-white font-bold py-2.5 px-5 rounded-lg transition-colors"
                                    style={{ backgroundColor: settings.buttonColor || themeColor }}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
            {selectedDoctor && patientProfile && hospital && (
                 <AppointmentBookingModal 
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    doctor={selectedDoctor}
                    hospital={hospital}
                    patient={patientProfile}
                 />
            )}
        </>
    );
};

export default DoctorsListPage;