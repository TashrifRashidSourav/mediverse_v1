import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Patient, PatientStatus } from '../../types';
import PatientModal from '../../components/dashboard/PatientModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';


const PatientManagement: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setHospitalId(currentUser.uid);
        }
    }, []);

    const fetchPatients = useCallback(async () => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);
        try {
            const snapshot = await db.collection('users').doc(hospitalId).collection('patients').orderBy('name').get();
            const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
            setPatients(patientsData);
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error fetching patients:", error);
        }
        setIsLoading(false);
    }, [hospitalId]);

    useEffect(() => {
        if (hospitalId) {
            fetchPatients();
        }
    }, [hospitalId, fetchPatients]);

    const handleOpenModal = (patient: Patient | null) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const handleSavePatient = async (patientData: Omit<Patient, 'id'>) => {
        if (!hospitalId) return;
        try {
            if (selectedPatient) {
                await db.collection('users').doc(hospitalId).collection('patients').doc(selectedPatient.id).update(patientData);
            } else {
                await db.collection('users').doc(hospitalId).collection('patients').add(patientData);
            }
            fetchPatients();
            handleCloseModal();
        } catch (error: any) {
             if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error saving patient:", error);
        }
    };
    
    const handleDeletePatient = async (patientId: string) => {
        if (!hospitalId) return;
        if (window.confirm("Are you sure you want to delete this patient record?")) {
            try {
                await db.collection('users').doc(hospitalId).collection('patients').doc(patientId).delete();
                fetchPatients();
            } catch (error: any) {
                if (error.code === 'permission-denied') {
                    setPermissionError(true);
                }
                console.error("Error deleting patient:", error);
            }
        }
    };
    
    const getStatusColor = (status: PatientStatus) => {
        switch(status) {
            case PatientStatus.Admitted: return 'bg-green-100 text-green-800';
            case PatientStatus.Discharged: return 'bg-slate-200 text-slate-800';
            case PatientStatus.In_Treatment: return 'bg-blue-100 text-blue-800';
            case PatientStatus.Observation: return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (permissionError) {
        return <PermissionGuide firebaseConfig={(firebase.app() as any).options} />;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Patient</span>
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Name</th>
                                <th className="p-4 font-semibold text-slate-600">Phone</th>
                                <th className="p-4 font-semibold text-slate-600">Age</th>
                                <th className="p-4 font-semibold text-slate-600">Gender</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Admitted Date</th>
                                <th className="p-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center p-8 text-slate-500">Loading patients...</td></tr>
                            ) : patients.length === 0 ? (
                                <tr><td colSpan={7} className="text-center p-8 text-slate-500">No patient records found.</td></tr>
                            ) : (
                                patients.map(patient => (
                                    <tr key={patient.id} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-800">{patient.name}</td>
                                        <td className="p-4 text-slate-700">{patient.phone}</td>
                                        <td className="p-4 text-slate-700">{patient.age}</td>
                                        <td className="p-4 text-slate-700">{patient.gender}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>{patient.status}</span>
                                        </td>
                                        <td className="p-4 text-slate-700">{new Date(patient.admittedDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(patient)} className="text-slate-500 hover:text-primary"><EditIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDeletePatient(patient.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePatient}
                patient={selectedPatient}
            />
        </div>
    );
};

export default PatientManagement;