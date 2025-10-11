import React, { useState, useEffect, useCallback } from 'react';
import { auth, db, storage, firebase } from '../../firebase';
import { Doctor } from '../../types';
import DoctorModal from '../../components/dashboard/DoctorModal';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const getHospitalId = () => auth.currentUser?.uid;

  const fetchDoctors = useCallback(async () => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;

    setLoading(true);
    setError('');
    setHasPermissionError(false);
    try {
      const snapshot = await db.collection('users').doc(hospitalId).collection('doctors').orderBy('name').get();
      const doctorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(doctorsData);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to fetch doctors.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleOpenModal = (doctor: Doctor | null = null) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSaveDoctor = async (doctorData: Omit<Doctor, 'id' | 'imageUrl'> & { imageUrl?: string }, imageFile: File | null) => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      let imageUrl = editingDoctor?.imageUrl || '';

      if (imageFile) {
        if (imageUrl) {
          try {
            const oldImageRef = storage.refFromURL(imageUrl);
            await oldImageRef.delete();
          } catch (deleteError: any) {
            if (deleteError.code !== 'storage/object-not-found') console.warn("Could not delete old image:", deleteError);
          }
        }
        const imageRef = storage.ref(`doctors/${hospitalId}/${Date.now()}_${imageFile.name}`);
        const snapshot = await imageRef.put(imageFile);
        imageUrl = await snapshot.ref.getDownloadURL();
      } else if (!doctorData.imageUrl && imageUrl) {
         try {
            const oldImageRef = storage.refFromURL(imageUrl);
            await oldImageRef.delete();
          } catch (deleteError: any) {
             if (deleteError.code !== 'storage/object-not-found') console.warn("Could not delete old image on removal:", deleteError);
          }
        imageUrl = '';
      }

      const finalDoctorData = { ...doctorData, imageUrl };

      if (editingDoctor) {
        await db.collection('users').doc(hospitalId).collection('doctors').doc(editingDoctor.id).update(finalDoctorData);
      } else {
        await db.collection('users').doc(hospitalId).collection('doctors').add(finalDoctorData);
      }
      
      handleCloseModal();
      fetchDoctors();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to save doctor.');
        console.error(err);
      }
    }
  };

  const handleDeleteDoctor = async (doctorId: string, imageUrl?: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      await db.collection('users').doc(hospitalId).collection('doctors').doc(doctorId).delete();
      
      if (imageUrl) {
         try {
            const imageRef = storage.refFromURL(imageUrl);
            await imageRef.delete();
          } catch (deleteError: any) {
             if (deleteError.code !== 'storage/object-not-found') console.warn("Could not delete image on doctor deletion:", deleteError);
          }
      }

      fetchDoctors();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to delete doctor.');
        console.error(err);
      }
    }
  };

  if (hasPermissionError) {
    const projectId = (firebase.app().options as { projectId: string }).projectId;
    return <PermissionGuide projectId={projectId} />;
  }

  if (loading) return <div>Loading doctors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Manage Doctors</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Doctor</th>
              <th className="p-4 font-semibold text-slate-600">Specialization</th>
              <th className="p-4 font-semibold text-slate-600">Contact</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-slate-200 last:border-b-0">
                <td className="p-4 flex items-center gap-3">
                    {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt={doctor.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-10 w-10 text-slate-300" />
                    )}
                    <div>
                        <p className="font-semibold text-slate-800">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.qualifications}</p>
                    </div>
                </td>
                <td className="p-4 text-slate-700">{doctor.specialization}</td>
                <td className="p-4 text-slate-700">
                    <div>{doctor.phone}</div>
                    <div className="text-sm text-slate-500">{doctor.email}</div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(doctor)} className="text-primary hover:text-primary-700 p-2">
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteDoctor(doctor.id, doctor.imageUrl)} className="text-red-600 hover:text-red-800 p-2 ml-2">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && !loading && (
          <p className="text-center text-slate-500 py-8">No doctors found. Add one to get started.</p>
        )}
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDoctor}
        doctor={editingDoctor}
      />
    </div>
  );
};

export default DoctorManagement;
