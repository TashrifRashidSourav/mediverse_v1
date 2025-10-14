import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Appointment, AppointmentStatus, Doctor, Patient } from '../../types';
import AppointmentModal from '../../components/dashboard/AppointmentModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { XIcon } from '../../components/icons/XIcon';


const ConfirmAppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (serialNumber: number) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [serial, setSerial] = useState(1);
    
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
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setHospitalId(currentUser.uid);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);
        try {
            const appointmentsPromise = db.collection('users').doc(hospitalId).collection('appointments').orderBy('date', 'desc').get();
            const doctorsPromise = db.collection('users').doc(hospitalId).collection('doctors').get();
            const patientsPromise = db.collection('users').doc(hospitalId).collection('patients').get();
            
            const [appointmentsSnapshot, doctorsSnapshot, patientsSnapshot] = await Promise.all([appointmentsPromise, doctorsPromise, patientsPromise]);

            setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
            setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));
            setPatients(patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error fetching data:", error);
        }
        setIsLoading(false);
    }, [hospitalId]);

    useEffect(() => {
        if(hospitalId) {
            fetchData();
        }
    }, [hospitalId, fetchData]);

    const handleOpenModal = (appointment: Appointment | null) => {
        // This modal is now only for legacy/admin-created appointments
        // As patient-created appointments are different. This might need refactoring later.
        // For now, let's disable editing patient-booked appointments.
        if (appointment?.authUid) {
            alert("This appointment was booked by a patient and cannot be edited directly. Please use the confirm/cancel actions.");
            return;
        }
        // This is a placeholder and should be updated to a unified modal.
        alert("This feature is for legacy appointments. Patient-booked appointments should be managed with confirm/cancel.");
    };

    const handleConfirm = async (serialNumber: number) => {
        if (!hospitalId || !selectedAppointment) return;
        try {
            await db.collection('users').doc(hospitalId).collection('appointments').doc(selectedAppointment.id).update({
                status: AppointmentStatus.Confirmed,
                serialNumber: serialNumber,
            });
            fetchData();
            setIsConfirmModalOpen(false);
            setSelectedAppointment(null);
        } catch (error) {
            console.error("Error confirming appointment:", error);
        }
    };

    const handleCancel = async (appointment: Appointment) => {
        if (!hospitalId) return;
        if (window.confirm(`Are you sure you want to cancel the appointment for ${appointment.patientName}?`)) {
            try {
                await db.collection('users').doc(hospitalId).collection('appointments').doc(appointment.id).update({
                    status: AppointmentStatus.Cancelled
                });
                fetchData();
            } catch (error) {
                console.error("Error cancelling appointment:", error);
            }
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
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Patient</th>
                                <th className="p-4 font-semibold text-slate-600">Doctor</th>
                                <th className="p-4 font-semibold text-slate-600">Date & Time</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Serial No.</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-8 text-slate-500">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 text-slate-500">No appointments found.</td></tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-800">{app.patientName}</td>
                                        <td className="p-4 text-slate-700">{app.doctorName}</td>
                                        <td className="p-4 text-slate-700">{new Date(app.date).toLocaleDateString()} at {app.time}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{app.serialNumber || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {app.status === AppointmentStatus.Scheduled && (
                                                    <>
                                                        <button 
                                                            onClick={() => { setSelectedAppointment(app); setIsConfirmModalOpen(true); }} 
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
                                                {app.status !== AppointmentStatus.Scheduled && (
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
            </div>

            <ConfirmAppointmentModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default AppointmentManagement;
