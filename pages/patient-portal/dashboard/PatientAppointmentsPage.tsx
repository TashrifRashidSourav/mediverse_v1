import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import { Appointment, AppointmentStatus, User } from '../../../types';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';

const PatientAppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [hospitalDetails, setHospitalDetails] = useState<{[key: string]: User}>({});

    const fetchAppointments = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to see appointments.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const snapshot = await db.collectionGroup('appointments')
                .where('authUid', '==', currentUser.uid)
                .orderBy('date', 'desc')
                .get();
                
            const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(appsData);

        } catch (err) {
            console.error(err);
            setError('Failed to fetch appointments.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const getStatusColor = (status: AppointmentStatus) => {
        switch(status) {
            case AppointmentStatus.Scheduled: return 'bg-amber-100 text-amber-800';
            case AppointmentStatus.Confirmed: return 'bg-green-100 text-green-800';
            case AppointmentStatus.Completed: return 'bg-blue-100 text-blue-800';
            case AppointmentStatus.Cancelled: return 'bg-red-100 text-red-800';
            case AppointmentStatus.No_Show: return 'bg-slate-200 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Appointments</h1>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Hospital</th>
                                <th className="p-4 font-semibold text-slate-600">Doctor</th>
                                <th className="p-4 font-semibold text-slate-600">Date & Time</th>
                                <th className="p-4 font-semibold text-slate-600">Serial No.</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">Loading appointments...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} className="text-center p-8 text-red-500">{error}</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">
                                    <CalendarIcon className="h-10 w-10 mx-auto text-slate-400 mb-2"/>
                                    You have no appointments.
                                </td></tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-800">{app.hospitalName}</td>
                                        <td className="p-4 text-slate-700">{app.doctorName}</td>
                                        <td className="p-4 text-slate-700">{new Date(app.date).toLocaleDateString()} at {app.time}</td>
                                        <td className="p-4 font-bold text-slate-700">{app.serialNumber || 'Pending'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointmentsPage;
