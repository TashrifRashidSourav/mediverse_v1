import React, { useState, useEffect } from 'react';
import { Patient, Doctor } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientId: string, doctorIds: string[]) => void;
  patient: Patient | null;
  doctors: Doctor[];
}

const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({ isOpen, onClose, onSave, patient, doctors }) => {
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setSelectedDoctorIds(patient.assignedDoctorIds || []);
    } else {
      setSelectedDoctorIds([]);
    }
  }, [patient, isOpen]);

  const handleCheckboxChange = (doctorId: string) => {
    setSelectedDoctorIds(prev =>
      prev.includes(doctorId) ? prev.filter(id => id !== doctorId) : [...prev, doctorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setIsSubmitting(true);
    await onSave(patient.id, selectedDoctorIds);
    setIsSubmitting(false);
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Assign Doctors</h2>
                <p className="text-slate-500">For patient: <span className="font-semibold">{patient.name}</span></p>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 max-h-64 overflow-y-auto space-y-3 pr-2">
              {doctors.length === 0 ? (
                <p className="text-slate-500 text-center">No doctors found. Please add doctors first.</p>
              ) : (
                doctors.map(doctor => (
                  <label key={doctor.id} className="flex items-center p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedDoctorIds.includes(doctor.id)}
                      onChange={() => handleCheckboxChange(doctor.id)}
                      className="h-5 w-5 rounded text-primary focus:ring-primary"
                    />
                    <div className="ml-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-6 w-6 text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.specialization}</p>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDoctorModal;