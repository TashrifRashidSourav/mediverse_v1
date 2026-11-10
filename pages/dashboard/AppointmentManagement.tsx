import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Appointment, AppointmentStatus } from '../../types';
import { formatLocalDate } from '../../utils/date';
import { slotId } from '../../utils/slots';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { VideoCameraIcon } from '../../components/icons/VideoCameraIcon';

const PAGE_SIZE = 15;

const ConfirmAppointmentModal: React.FC<{
    isOpen: boolean;
    defaultSerial: number;
    onClose: () => void;
    onConfirm: (serialNumber: number) => void;
}> = ({ isOpen, defaultSerial, onClose, onConfirm }) => {
    const [serial, setSerial] = useState(defaultSerial);

    // Start from the suggested serial each time the dialog opens (it used to keep the last value).
    useEffect(() => {
        if (isOpen) setSerial(defaultSerial);
    }, [isOpen, defaultSerial]);

    if(!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(serial);
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800">Confirm Appointment</h3>
                        <p className="text-sm text-slate-600 mt-1">Please assign a serial number for the patient.</p>
                        <label htmlFor="serialNumber" className="font-semibold text-slate-700 block mt-4 mb-1">Serial Number</label>
                        <input
                            type="number"
                            id="serialNumber"
                            value={serial}
                            onChange={e => setSerial(Number(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>
                    <div className="bg-slate-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


const AppointmentManagement: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [defaultSerial, setDefaultSerial] = useState(1);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    const [lastVisible, setLastVisible] = useState<firebase.firestore.QueryDocumentSnapshot | null>(null);
    const [firstVisible, setFirstVisible] = useState<firebase.firestore.QueryDocumentSnapshot | null>(null);
    const [isFirstPage, setIsFirstPage] = useState(true);
    const [isLastPage, setIsLastPage] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setHospitalId(currentUser.uid);
        }
    }, []);

    const fetchAppointments = useCallback(async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);

        let query: firebase.firestore.Query;
        const baseQuery = db.collection('users').doc(hospitalId).collection('appointments').orderBy('date', 'desc');

        if (direction === 'next' && lastVisible) {
            query = baseQuery.startAfter(lastVisible).limit(PAGE_SIZE);
            setIsFirstPage(false);
        } else if (direction === 'prev' && firstVisible) {
            query = baseQuery.endBefore(firstVisible).limitToLast(PAGE_SIZE);
            setIsLastPage(false);
        } else {
            query = baseQuery.limit(PAGE_SIZE);
            setIsFirstPage(true);
        }

        try {
            const snapshot = await query.get();
            if (snapshot.empty) {
                if (direction === 'next') setIsLastPage(true);
                if (direction === 'prev') setIsFirstPage(true);
                if (direction !== 'first') {} else { setAppointments([]); }
                setIsLoading(false);
                return;
            }

            setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
            setFirstVisible(snapshot.docs[0]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

            if (direction === 'next' || direction === 'first') {
                const nextDoc = await baseQuery.startAfter(snapshot.docs[snapshot.docs.length - 1]).limit(1).get();
                setIsLastPage(nextDoc.empty);
            }
            if(direction === 'prev') {
                const prevDoc = await baseQuery.endBefore(snapshot.docs[0]).limit(1).get();
                setIsFirstPage(prevDoc.empty);
            }

        } catch (error: any) {
            if (error.code === 'permission-denied') setPermissionError(true);
            console.error("Error fetching appointments:", error);
        }
        setIsLoading(false);
    }, [hospitalId, lastVisible, firstVisible]);

    useEffect(() => {
        if(hospitalId) {
            fetchAppointments('first');
        }
    }, [hospitalId]);

    const releaseSlot = async (app: Appointment) => {
        if (!hospitalId) return;
        try {
            await db.collection('users').doc(hospitalId).collection('slots').doc(slotId(app.doctorId, app.date, app.time)).delete();
        } catch (error) {
            // Slot docs only exist once slot rules are deployed; nothing to release otherwise.
            console.warn('Could not release slot', error);
        }
    };

    /** Suggest the next serial number for this doctor on this day. */
    const openConfirm = async (app: Appointment) => {
        setSelectedAppointment(app);
        setDefaultSerial(1);
        setIsConfirmModalOpen(true);
        if (!hospitalId) return;
        try {
            const snap = await db.collection('users').doc(hospitalId).collection('appointments')
                .where('doctorId', '==', app.doctorId)
                .where('date', '==', app.date)
                .get();
            const maxSerial = snap.docs.reduce((max, d) => Math.max(max, Number(d.data().serialNumber) || 0), 0);
            setDefaultSerial(maxSerial + 1);
        } catch (error) {
            console.warn('Could not suggest serial number', error);
        }
    };

    const updateStatus = async (app: Appointment, status: AppointmentStatus, extra: Record<string, unknown> = {}) => {
        if (!hospitalId) return false;
        try {
            await db.collection('users').doc(hospitalId).collection('appointments').doc(app.id).update({ status, ...extra });
            if (status === AppointmentStatus.Cancelled || status === AppointmentStatus.No_Show) await releaseSlot(app);
            return true;
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Could not update the appointment. Please try again.');
            return false;
        }
    };

    const handleConfirm = async (serialNumber: number) => {
        if (!selectedAppointment) return;
        const extra: Record<string, unknown> = { serialNumber };
        if (selectedAppointment.appointmentType === 'Online') {
            extra.meetingLink = `/meet/${hospitalId}/${selectedAppointment.id}`;
        }
        if (await updateStatus(selectedAppointment, AppointmentStatus.Confirmed, extra)) {
            fetchAppointments('first');
            setIsConfirmModalOpen(false);
            setSelectedAppointment(null);
        }
    };

    const handleCancel = async (appointment: Appointment) => {
        if (window.confirm(`Are you sure you want to cancel the appointment for ${appointment.patientName}?`)) {
            if (await updateStatus(appointment, AppointmentStatus.Cancelled)) fetchAppointments('first');
        }
    };

    const handleComplete = async (appointment: Appointment) => {
        if (await updateStatus(appointment, AppointmentStatus.Completed)) fetchAppointments('first');
    };

    const handleNoShow = async (appointment: Appointment) => {
        if (window.confirm(`Mark ${appointment.patientName} as a no-show?`)) {
            if (await updateStatus(appointment, AppointmentStatus.No_Show)) fetchAppointments('first');
        }
    };

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
    
    if (permissionError) {
        return <PermissionGuide firebaseConfig={(firebase.app() as any).options} />;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
                <p className="text-slate-500 text-sm">Patient-booked appointments appear here automatically.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Patient</th>
                                <th className="p-4 font-semibold text-slate-600">Doctor</th>
                                <th className="p-4 font-semibold text-slate-600">Date & Time</th>
                                <th className="p-4 font-semibold text-slate-600">Type</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Serial No.</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center p-8 text-slate-500">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={7} className="text-center p-8 text-slate-500">No appointments found.</td></tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-800">{app.patientName}</td>
                                        <td className="p-4 text-slate-700">{app.doctorName}</td>
                                        <td className="p-4 text-slate-700">{formatLocalDate(app.date)} at {app.time}</td>
                                        <td className="p-4">
                                            {app.appointmentType === 'Online' ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    <VideoCameraIcon className="h-4 w-4" />
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">In-Person</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{app.serialNumber || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {app.status === AppointmentStatus.Scheduled && (
                                                    <>
                                                        <button 
                                                            onClick={() => openConfirm(app)} 
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Confirm"
                                                        >
                                                            <CheckCircleIcon className="h-6 w-6" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCancel(app)} 
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Cancel"
                                                        >
                                                            <XCircleIcon className="h-6 w-6" />
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === AppointmentStatus.Confirmed && (
                                                    <>
                                                        <button onClick={() => handleComplete(app)} className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md" title="Mark as completed">Complete</button>
                                                        <button onClick={() => handleNoShow(app)} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md" title="Patient did not attend">No-show</button>
                                                        <button onClick={() => handleCancel(app)} className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md" title="Cancel appointment">Cancel</button>
                                                    </>
                                                )}
                                                {app.status !== AppointmentStatus.Scheduled && app.status !== AppointmentStatus.Confirmed && (
                                                    <span className="text-xs text-slate-400">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end items-center p-4 gap-4">
                    <button 
                        onClick={() => fetchAppointments('prev')} 
                        disabled={isFirstPage || isLoading}
                        className="font-semibold text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => fetchAppointments('next')} 
                        disabled={isLastPage || isLoading}
                        className="font-semibold text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ConfirmAppointmentModal 
                isOpen={isConfirmModalOpen}
                defaultSerial={defaultSerial}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default AppointmentManagement;
