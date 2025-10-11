import React, { useState, useEffect, useCallback } from 'react';
import { auth, db, firebase } from '../../firebase';
import { Patient } from '../../types';
import PatientModal from '../../components/dashboard/PatientModal';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const getHospitalId = () => auth.currentUser?.uid;

  const fetchPatients = useCallback(async () => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;

    setLoading(true);
    setError('');
    setHasPermissionError(false);
    try {
      const snapshot = await db.collection('users').doc(hospitalId).collection('patients').orderBy('name').get();
      const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientsData);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to fetch patients.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleOpenModal = (patient: Patient | null = null) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSavePatient = async (patientData: Omit<Patient, 'id'>) => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      if (editingPatient) {
        await db.collection('users').doc(hospitalId).collection('patients').doc(editingPatient.id).update(patientData);
      } else {
        await db.collection('users').doc(hospitalId).collection('patients').add(patientData);
      }
      
      handleCloseModal();
      fetchPatients();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to save patient.');
        console.error(err);
      }
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      await db.collection('users').doc(hospitalId).collection('patients').doc(patientId).delete();
      fetchPatients();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to delete patient.');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Admitted': return 'bg-green-100 text-green-800';
      case 'Discharged': return 'bg-slate-200 text-slate-800';
      case 'Outpatient': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (hasPermissionError) {
    const projectId = (firebase.app().options as { projectId: string }).projectId;
    return <PermissionGuide projectId={projectId} />;
  }

  if (loading) return <div>Loading patients...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Manage Patients</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Name</th>
              <th className="p-4 font-semibold text-slate-600">Age</th>
              <th className="p-4 font-semibold text-slate-600">Gender</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Admitted On</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-200 last:border-b-0">
                <td className="p-4 font-semibold text-slate-800">{patient.name}</td>
                <td className="p-4 text-slate-700">{patient.age}</td>
                <td className="p-4 text-slate-700">{patient.gender}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </td>
                <td className="p-4 text-slate-700">{new Date(patient.admittedDate).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(patient)} className="text-primary hover:text-primary-700 p-2">
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeletePatient(patient.id)} className="text-red-600 hover:text-red-800 p-2 ml-2">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && !loading && (
          <p className="text-center text-slate-500 py-8">No patients found. Add one to get started.</p>
        )}
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        patient={editingPatient}
      />
    </div>
  );
};

export default PatientManagement;
