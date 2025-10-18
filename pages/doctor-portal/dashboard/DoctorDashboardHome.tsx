import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { Appointment, AppointmentStatus, Patient } from '../../../types';
import { useParams, Link } from 'react-router-dom';
import PatientProfileModal from '../../../components/doctor-portal/PatientProfileModal';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';
import { ClipboardIcon } from '../../../components/icons/ClipboardIcon';
import { UserIcon } from '../../../components/icons/UserIcon';

const DoctorDashboardHome: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<{id: string, name: string} | null>(null);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('doctorProfile') || 'null');
        if (profile) {
            setDoctorProfile(profile);
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        if (!subdomain || !doctorProfile) return;
        setIsLoading(true);
        setError('');
        try {
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
            if (userQuery.empty) throw new Error('Hospital not found');
            
            const hospitalId = userQuery.docs[0].id;

            const snapshot = await db.collection('users').doc(hospitalId)
                .collection('appointments')
                .where('doctorId', '==', doctorProfile.id)
                .get();

            const appsData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
                .filter(app => app.status === AppointmentStatus.Scheduled || app.status === AppointmentStatus.Confirmed);
            
            // Client-side sorting to avoid composite index requirement
            appsData.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
                const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
                return dateTimeA - dateTimeB; // Ascending order
            });

            setAppointments(appsData);

        } catch (err: any) {
            console.error("Error fetching appointments:", err);
            if (err.code === 'permission-denied') {
                 setError('Permission Denied. Please ensure your Firestore security rules are up to date.');
            } else if (err.code === 'failed-precondition') {
                setError('Query requires a database index. Please check the browser console for a link to create it.');
            } else {
                setError('Could not load appointments.');
            }
        } finally {
            setIsLoading(false);
        }

    }, [subdomain, doctorProfile]);

    useEffect(() => {
        if(doctorProfile) {
            fetchAppointments();
        }
    }, [doctorProfile, fetchAppointments]);
    
    const handleViewProfile = (patientId?: string) => {
        if(patientId) {
            setSelectedPatientId(patientId);
            setIsModalOpen(true);
        }
    };

    const getStatusChip = (status: AppointmentStatus) => {
        const base = "px-2 py-0.5 text-xs font-semibold rounded-full";
        switch(status) {
            case AppointmentStatus.Confirmed: return `${base} bg-green-100 text-green-800`;
            case AppointmentStatus.Scheduled: return `${base} bg-amber-100 text-amber-800`;
            default: return `${base} bg-slate-100 text-slate-800`;
        }
    };
    
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(app => app.date === today);
    const upcomingAppointments = appointments.filter(app => app.date > today);

    const AppointmentCard: React.FC<{app: Appointment}> = ({ app }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-lg">{app.patientName}</p>
                    <span className={getStatusChip(app.status)}>{app.status}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                    <span>Time: <span className="font-semibold text-slate-700">{app.time}</span></span>
                    {app.serialNumber && <span>Serial: <span className="font-bold text-primary-700">#{app.serialNumber}</span></span>}
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 justify-end">
                <button onClick={() => handleViewProfile(app.patientId)} className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4" /> Profile
                </button>
                <Link to={`/${subdomain}/doctor-portal/dashboard/prescription/${app.patientId}`} className="text-sm font-semibold text-primary-700 bg-primary-100 hover:bg-primary-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                    <ClipboardIcon className="h-4 w-4" /> Prescription
                </Link>
            </div>
        </div>
    );

    const renderContent = (content: Appointment[]) => {
        if (isLoading) return <p className="text-center py-8 text-slate-500">Loading appointments...</p>;
        if (error) return <div className="text-center py-8 bg-red-50 text-red-600 rounded-lg border border-dashed border-red-300">{error}</div>;
        if (content.length > 0) {
            return (
                <div className="space-y-3">
                   {content.map(app => <AppointmentCard key={app.id} app={app} />)}
                </div>
            );
        }
        return <div className="text-center py-8 bg-white rounded-lg border border-dashed text-slate-500">No appointments found.</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, Dr. {doctorProfile?.name.split(' ').pop()}!</h1>
            <p className="text-slate-600 mb-8">Here is your schedule for today and the upcoming days.</p>
            
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        Today's Consultations
                    </h2>
                     {renderContent(todaysAppointments)}
                </section>

                <section>
                     <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-slate-500" />
                        Upcoming Appointments
                    </h2>
                     {renderContent(upcomingAppointments)}
                </section>
            </div>
            
            {selectedPatientId && (
                <PatientProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    patientId={selectedPatientId}
                    subdomain={subdomain!}
                />
            )}
        </div>
    );
};

export default DoctorDashboardHome;