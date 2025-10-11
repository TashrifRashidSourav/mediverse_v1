import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { auth, db, storage } from '../../firebase';
import DoctorModal from '../../components/dashboard/DoctorModal';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const doctorsCollectionRef = db.collection('users').doc(currentUser.uid).collection('doctors');
        
        const unsubscribe = doctorsCollectionRef.onSnapshot(snapshot => {
            const doctorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
            setDoctors(doctorsData);
            setLoading(false);
        }, error => {
            console.error("Error fetching doctors:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddNew = () => {
        setEditingDoctor(null);
        setModalOpen(true);
    };

    const handleEdit = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        setModalOpen(true);
    };
    
    const handleDelete = async (doctor: Doctor) => {
        if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // Delete Firestore document
            await db.collection('users').doc(currentUser.uid).collection('doctors').doc(doctor.id).delete();
            
            // Delete image from Storage if it exists
            if (doctor.imageUrl) {
                const imageRef = storage.refFromURL(doctor.imageUrl);
                await imageRef.delete();
            }
        } catch (error) {
            console.error("Error deleting doctor:", error);
            alert("Failed to delete doctor. Please try again.");
        }
    };
    
    const handleSave = async (doctorData: Omit<Doctor, 'id'>, imageFile: File | null) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const collectionRef = db.collection('users').doc(currentUser.uid).collection('doctors');

        try {
            let imageUrl = editingDoctor?.imageUrl || doctorData.imageUrl || '';

            // Handle image upload
            if (imageFile) {
                const imageId = editingDoctor ? editingDoctor.id : collectionRef.doc().id;
                const imagePath = `doctors/${currentUser.uid}/${imageId}/${imageFile.name}`;
                const imageRef = storage.ref(imagePath);
                await imageRef.put(imageFile);
                imageUrl = await imageRef.getDownloadURL();
            }
            
            const dataToSave = { ...doctorData, imageUrl };
            
            if (editingDoctor) {
                // Update existing doctor
                await collectionRef.doc(editingDoctor.id).update(dataToSave);
            } else {
                // Add new doctor
                await collectionRef.add(dataToSave);
            }
            
            setModalOpen(false);
            setEditingDoctor(null);

        } catch (error) {
            console.error("Error saving doctor:", error);
            alert("Failed to save doctor data. Please try again.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Doctor Management</h1>
                <button 
                    onClick={handleAddNew}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Doctor
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Specialization</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Qualifications</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Contact</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">Loading doctors...</td></tr>
                            ) : doctors.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-slate-500">No doctors found. Add one to get started.</td></tr>
                            ) : (
                                doctors.map((doctor) => (
                                    <tr key={doctor.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                                            {doctor.imageUrl ? (
                                                <img src={doctor.imageUrl} alt={doctor.name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <UserCircleIcon className="h-10 w-10 text-slate-400" />
                                            )}
                                            {doctor.name}
                                        </td>
                                        <td className="p-4 text-slate-600">{doctor.specialization}</td>
                                        <td className="p-4 text-slate-600">{doctor.qualifications}</td>
                                        <td className="p-4 text-slate-600">
                                            <div>{doctor.phone}</div>
                                            <div className="text-xs text-slate-500">{doctor.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-4">
                                                <button onClick={() => handleEdit(doctor)} className="text-slate-500 hover:text-blue-600"><EditIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDelete(doctor)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <DoctorModal 
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingDoctor(null);
                    }}
                    onSave={handleSave}
                    doctor={editingDoctor}
                />
            )}
        </div>
    );
};

export default DoctorManagement;