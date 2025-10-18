import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Doctor } from '../../types';
import DoctorModal from '../../components/dashboard/DoctorModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { firebaseConfig } from '../../firebaseConfig';

const PAGE_SIZE = 15;

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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

    const fetchDoctors = useCallback(async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!hospitalId) return;
        setIsLoading(true);
        setPermissionError(false);

        let query: firebase.firestore.Query;
        const baseQuery = db.collection('users').doc(hospitalId).collection('doctors').orderBy('name');
        
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
                if (direction !== 'first') {
                    // Do nothing, just stay on the current page
                } else {
                    setDoctors([]);
                }
                setIsLoading(false);
                return;
            }

            const doctorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
            setDoctors(doctorsData);
            setFirstVisible(snapshot.docs[0]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            
            // Lookahead query to check if it's the last page
            if (direction === 'next' || direction === 'first') {
                const nextDoc = await baseQuery.startAfter(snapshot.docs[snapshot.docs.length - 1]).limit(1).get();
                setIsLastPage(nextDoc.empty);
            }
            if(direction === 'prev') {
                const prevDoc = await baseQuery.endBefore(snapshot.docs[0]).limit(1).get();
                setIsFirstPage(prevDoc.empty);
            }

        } catch (error: any) {
             if (error.code === 'permission-denied') {
                setPermissionError(true);
            }
            console.error("Error fetching doctors:", error);
        }
        setIsLoading(false);
    }, [hospitalId, lastVisible, firstVisible]);

    useEffect(() => {
        if (hospitalId) {
            fetchDoctors();
        }
    }, [hospitalId]);

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
                if (!doctorData.password) {
                    delete updateData.password;
                }
                await db.collection('users').doc(hospitalId).collection('doctors').doc(selectedDoctor.id).update(updateData);
            } else {
                // Add new doctor
                await db.collection('users').doc(hospitalId).collection('doctors').add(doctorData);
            }
            fetchDoctors('first');
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
                fetchDoctors('first');
            } catch (error: any) {
                 if (error.code === 'permission-denied') {
                    setPermissionError(true);
                }
                console.error("Error deleting doctor:", error);
            }
        }
    };
    
    if (permissionError) {
        return <PermissionGuide firebaseConfig={firebaseConfig} />;
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
            
            <div className="bg-white rounded-xl shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Name</th>
                                <th className="p-4 font-semibold text-slate-600">Specialization</th>
                                <th className="p-4 font-semibold text-slate-600">Phone</th>
                                <th className="p-4 font-semibold text-slate-600">Email</th>
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
                <div className="flex justify-end items-center p-4 gap-4">
                    <button 
                        onClick={() => fetchDoctors('prev')} 
                        disabled={isFirstPage || isLoading}
                        className="font-semibold text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => fetchDoctors('next')} 
                        disabled={isLastPage || isLoading}
                        className="font-semibold text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Next
                    </button>
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