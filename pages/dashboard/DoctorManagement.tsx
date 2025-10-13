import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Doctor } from '../../types';
import DoctorModal from '../../components/dashboard/DoctorModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setHospitalId(currentUser.uid);
        }
    }, []);

    const fetchDoctors = useCallback(async () => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);
        try {
            const snapshot = await db.collection('users').doc(hospitalId).collection('doctors').orderBy('name').get();
            const doctorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
            setDoctors(doctorsData);
        } catch (error: any) {
             if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error fetching doctors:", error);
        }
        setIsLoading(false);
    }, [hospitalId]);

    useEffect(() => {
        if (hospitalId) {
            fetchDoctors();
        }
    }, [hospitalId, fetchDoctors]);

    const handleOpenModal = (doctor: Doctor | null) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
    };

    const handleSaveDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
        if (!hospitalId) return;
        try {
            if (selectedDoctor) {
                // Update existing doctor
                const updateData: Partial<Doctor> = { ...doctorData };
                // Only update password if a new one was entered
                if (!doctorData.password) {
                    delete updateData.password;
                }
                await db.collection('users').doc(hospitalId).collection('doctors').doc(selectedDoctor.id).update(updateData);
            } else {
                // Add new doctor
                await db.collection('users').doc(hospitalId).collection('doctors').add(doctorData);
            }
            fetchDoctors();
            handleCloseModal();
        } catch (error: any) {
             if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error saving doctor:", error);
        }
    };
    
    const handleDeleteDoctor = async (doctorId: string) => {
        if (!hospitalId) return;
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                await db.collection('users').doc(hospitalId).collection('doctors').doc(doctorId).delete();
                fetchDoctors();
            } catch (error: any) {
                 if (error.code === 'permission-denied') {
                    setPermissionError(true);
                }
                console.error("Error deleting doctor:", error);
            }
        }
    };
    
    if (permissionError) {
        return <PermissionGuide firebaseConfig={(firebase.app() as any).options} />;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Doctor Management</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Doctor</span>
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Name</th>
                                <th className="p-4 font-semibold text-slate-600">Specialization</th>
                                <th className="p-4 font-semibold text-slate-600">Contact</th>
                                <th className="p-4 font-semibold text-slate-600">Email Address</th>
                                <th className="p-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">Loading doctors...</td></tr>
                            ) : doctors.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">No doctors found.</td></tr>
                            ) : (
                                doctors.map(doctor => (
                                    <tr key={doctor.id} className="border-t border-slate-200">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-6 w-6 text-slate-400" />}
                                                </div>
                                                <span className="font-semibold text-slate-800">{doctor.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700">{doctor.specialization}</td>
                                        <td className="p-4 text-slate-700">{doctor.phone || 'N/A'}</td>
                                        <td className="p-4 text-slate-700">{doctor.email || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(doctor)} className="text-slate-500 hover:text-primary"><EditIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDeleteDoctor(doctor.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DoctorModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveDoctor}
                doctor={selectedDoctor}
            />
        </div>
    );
};

export default DoctorManagement;
