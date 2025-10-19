import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import { Appointment, AppointmentStatus } from '../../../types';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';
import { Link } from 'react-router-dom';

const PatientAppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAppointments = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to see appointments.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            // Use a more efficient collectionGroup query, enabled by the new security rules.
            const snapshot = await db.collectionGroup('appointments')
                .where('authUid', '==', currentUser.uid)
                .orderBy('date', 'desc')
                .get();

            const allAppointments: Appointment[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            setAppointments(allAppointments);

        } catch (err: any) {
            console.error(err);
             if (err.code === 'failed-precondition') {
                setError('Query requires a database index. Please check the browser console for a link to create it, then refresh the page.');
            } else {
                setError('Failed to fetch appointments. Please ensure your Firestore security rules have been updated.');
            }
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
                                <th className="p-4 font-semibold text-slate-600">Status / Action</th>
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
                                             {app.appointmentType === 'Online' && app.status === AppointmentStatus.Confirmed && app.meetingLink ? (
                                                <Link to={app.meetingLink} className="bg-green-600 text-white font-semibold text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block">
                                                    Join Meeting
                                                </Link>
                                            ) : (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                            )}
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