import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, Doctor, Patient } from '../../types';
import { XIcon } from '../icons/XIcon';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: The onSave prop should only expect the data this modal can provide.
  // The parent component is responsible for adding hospital-specific details.
  onSave: (appointmentData: Omit<Appointment, 'id' | 'patientName' | 'doctorName' | 'hospitalId' | 'hospitalName'>) => void;
  appointment: Appointment | null;
  doctors: Doctor[];
  patients: Patient[];
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave, appointment, doctors, patients }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    status: AppointmentStatus.Scheduled,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId,
        date: new Date(appointment.date).toISOString().split('T')[0],
        time: appointment.time,
        status: appointment.status,
      });
    } else {
      // Reset form
      setFormData({
        patientId: patients.length > 0 ? patients[0].id : '',
        doctorId: doctors.length > 0 ? doctors[0].id : '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        status: AppointmentStatus.Scheduled,
      });
    }
  }, [appointment, isOpen, doctors, patients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // FIX: Construct the full object this modal is responsible for, including patientDetails.
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
        console.error("Selected patient not found!");
        setIsSubmitting(false);
        return;
    }

    const dataToSave: Omit<Appointment, 'id' | 'patientName' | 'doctorName' | 'hospitalId' | 'hospitalName'> = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        authUid: selectedPatient.authUid,
        patientDetails: {
            phone: selectedPatient.phone,
            gender: selectedPatient.gender,
            age: selectedPatient.age,
        },
    };
    
    await onSave(dataToSave);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-slate-900">{appointment ? 'Edit Appointment' : 'New Appointment'}</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="patientId" className="font-semibold text-slate-700 block mb-1.5">Patient*</label>
                <select id="patientId" name="patientId" value={formData.patientId} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="doctorId" className="font-semibold text-slate-700 block mb-1.5">Doctor*</label>
                <select id="doctorId" name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="date" className="font-semibold text-slate-700 block mb-1.5">Date*</label>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>
                <div>
                  <label htmlFor="time" className="font-semibold text-slate-700 block mb-1.5">Time*</label>
                  <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="font-semibold text-slate-700 block mb-1.5">Status*</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                  {Object.values(AppointmentStatus).map(s => <option key={String(s)} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;