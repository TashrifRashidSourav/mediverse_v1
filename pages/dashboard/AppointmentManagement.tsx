import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Appointment, AppointmentStatus, Doctor, Patient } from '../../types';
import AppointmentModal from '../../components/dashboard/AppointmentModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';

const AppointmentManagement: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        if (!hospitalId) return;
        try {
            if (selectedAppointment) {
                await db.collection('users').doc(hospitalId).collection('appointments').doc(selectedAppointment.id).update(appointmentData);
            } else {
                await db.collection('users').doc(hospitalId).collection('appointments').add(appointmentData);
            }
            fetchData();
            handleCloseModal();
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error saving appointment:", error);
        }
    };
    
    const handleDeleteAppointment = async (appointmentId: string) => {
        if (!hospitalId) return;
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                await db.collection('users').doc(hospitalId).collection('appointments').doc(appointmentId).delete();
                fetchData();
            } catch (error: any) {
                if (error.code === 'permission-denied') {
                    setPermissionError(true);
                }
                console.error("Error deleting appointment:", error);
            }
        }
    };
    
    const getStatusColor = (status: AppointmentStatus) => {
        switch(status) {
            case AppointmentStatus.Scheduled: return 'bg-blue-100 text-blue-800';
            case AppointmentStatus.Completed: return 'bg-green-100 text-green-800';
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
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>New Appointment</span>
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Patient</th>
                                <th className="p-4 font-semibold text-slate-600">Doctor</th>
                                <th className="p-4 font-semibold text-slate-600">Date & Time</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">No appointments found.</td></tr>
                            ) : (
                                appointments.map(app => (
                                    <tr key={app.id} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-800">{app.patientName}</td>
                                        <td className="p-4 text-slate-700">{app.doctorName}</td>
                                        <td className="p-4 text-slate-700">{new Date(app.date).toLocaleDateString()} at {app.time}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(app)} className="text-slate-500 hover:text-primary"><EditIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDeleteAppointment(app.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveAppointment}
                appointment={selectedAppointment}
                doctors={doctors}
                patients={patients}
            />
        </div>
    );
};

export default AppointmentManagement;