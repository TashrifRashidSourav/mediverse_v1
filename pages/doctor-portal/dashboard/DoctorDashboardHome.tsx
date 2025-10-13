import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { Appointment, AppointmentStatus, User } from '../../../types';
import { useParams } from 'react-router-dom';

const DoctorDashboardHome: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<{id: string, name: string} | null>(null);
    const [error, setError] = useState('');

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
                .orderBy('date', 'asc')
                .orderBy('time', 'asc')
                .get();

            const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(appsData);

        } catch (err) {
            console.error("Error fetching appointments:", err);
            setError('Could not load appointments.');
        } finally {
            setIsLoading(false);
        }

    }, [subdomain, doctorProfile]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);
    
    const getStatusColor = (status: AppointmentStatus) => {
        switch(status) {
            case AppointmentStatus.Scheduled: return 'bg-blue-100 text-blue-800';
            case AppointmentStatus.Completed: return 'bg-green-100 text-green-800';
            case AppointmentStatus.Cancelled: return 'bg-red-100 text-red-800';
            case AppointmentStatus.No_Show: return 'bg-slate-200 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(app => app.date === today);
    const upcomingAppointments = appointments.filter(app => app.date > today);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Schedule</h1>
            
            <div className="space-y-8">
                {/* Today's Appointments */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Appointments</h2>
                    {isLoading ? <p>Loading...</p> : todaysAppointments.length > 0 ? (
                        <ul className="space-y-3">
                            {todaysAppointments.map(app => (
                                <li key={app.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800">{app.patientName}</p>
                                        <p className="text-sm text-slate-500">{app.time}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-slate-500">No appointments scheduled for today.</p>}
                </div>

                {/* Upcoming Appointments */}
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
                    {isLoading ? <p>Loading...</p> : upcomingAppointments.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingAppointments.map(app => (
                                <li key={app.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800">{app.patientName}</p>
                                        <p className="text-sm text-slate-500">{new Date(app.date).toLocaleDateString()} at {app.time}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-slate-500">No upcoming appointments.</p>}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardHome;
