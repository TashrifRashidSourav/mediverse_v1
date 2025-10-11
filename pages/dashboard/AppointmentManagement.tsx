import React, { useState, useEffect, useCallback } from 'react';
import { auth, db, firebase } from '../../firebase';
import { Appointment, Doctor, Patient } from '../../types';
import AppointmentModal from '../../components/dashboard/AppointmentModal';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const getHospitalId = () => auth.currentUser?.uid;

  const fetchData = useCallback(async () => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;

    setLoading(true);
    setError('');
    setHasPermissionError(false);
    try {
      const appointmentsPromise = db.collection('users').doc(hospitalId).collection('appointments').orderBy('date', 'desc').get();
      const doctorsPromise = db.collection('users').doc(hospitalId).collection('doctors').orderBy('name').get();
      const patientsPromise = db.collection('users').doc(hospitalId).collection('patients').orderBy('name').get();

      const [appointmentsSnapshot, doctorsSnapshot, patientsSnapshot] = await Promise.all([appointmentsPromise, doctorsPromise, patientsPromise]);

      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      const patientsData = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));

      setAppointments(appointmentsData);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to fetch data.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (appointment: Appointment | null = null) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      if (editingAppointment) {
        await db.collection('users').doc(hospitalId).collection('appointments').doc(editingAppointment.id).update(appointmentData);
      } else {
        await db.collection('users').doc(hospitalId).collection('appointments').add(appointmentData);
      }
      
      handleCloseModal();
      fetchData();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to save appointment.');
        console.error(err);
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    const hospitalId = getHospitalId();
    if (!hospitalId) return;
    setError('');
    setHasPermissionError(false);

    try {
      await db.collection('users').doc(hospitalId).collection('appointments').doc(appointmentId).delete();
      fetchData();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      } else {
        setError('Failed to delete appointment.');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (hasPermissionError) {
    const projectId = (firebase.app().options as { projectId: string }).projectId;
    return <PermissionGuide projectId={projectId} />;
  }

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Manage Appointments</h1>
        <button
          onClick={() => handleOpenModal()}
          disabled={doctors.length === 0 || patients.length === 0}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:bg-primary-300 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-5 w-5" />
          New Appointment
        </button>
      </div>
      {(doctors.length === 0 || patients.length === 0) && (
          <p className="text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4 text-sm">
            Please add at least one doctor and one patient before creating an appointment.
          </p>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Date & Time</th>
              <th className="p-4 font-semibold text-slate-600">Patient</th>
              <th className="p-4 font-semibold text-slate-600">Doctor</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-b border-slate-200 last:border-b-0">
                <td className="p-4 text-slate-700">
                    <div>{new Date(appt.date).toLocaleDateString()}</div>
                    <div className="text-sm text-slate-500">{appt.time}</div>
                </td>
                <td className="p-4 font-semibold text-slate-800">{appt.patientName}</td>
                <td className="p-4 text-slate-700">{appt.doctorName}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(appt)} className="text-primary hover:text-primary-700 p-2">
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteAppointment(appt.id)} className="text-red-600 hover:text-red-800 p-2 ml-2">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {appointments.length === 0 && !loading && (
          <p className="text-center text-slate-500 py-8">No appointments found.</p>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
        appointment={editingAppointment}
        doctors={doctors}
        patients={patients}
      />
    </div>
  );
};

export default AppointmentManagement;
