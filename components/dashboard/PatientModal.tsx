import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus } from '../../types';
import { XIcon } from '../icons/XIcon';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Omit<Patient, 'id'>) => void;
  patient: Patient | null;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    gender: 'Other' as 'Male' | 'Female' | 'Other',
    status: PatientStatus.Admitted,
    admittedDate: new Date().toISOString().split('T')[0],
    phone: '',
    weight: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        status: patient.status,
        admittedDate: new Date(patient.admittedDate).toISOString().split('T')[0],
        phone: patient.phone,
        weight: patient.weight || 0,
      });
    } else {
      // Reset form for 'Add New'
      setFormData({
        name: '',
        age: 0,
        gender: 'Other',
        status: PatientStatus.Admitted,
        admittedDate: new Date().toISOString().split('T')[0],
        phone: '',
        weight: 0,
      });
    }
  }, [patient, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Construct the object without the optional fields if they are empty
    const patientDataToSave: Omit<Patient, 'id'> = {
        ...formData,
        ...(formData.weight > 0 ? { weight: formData.weight } : { weight: undefined }),
    };
    await onSave(patientDataToSave);
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
              <h2 className="text-2xl font-bold text-slate-900">{patient ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label htmlFor="name" className="font-semibold text-slate-700 block mb-1.5">Full Name*</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                 </div>
                 <div>
                    <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number*</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="age" className="font-semibold text-slate-700 block mb-1.5">Age*</label>
                  <input type="number" id="age" name="age" min="0" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>
                <div>
                  <label htmlFor="gender" className="font-semibold text-slate-700 block mb-1.5">Gender*</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="weight" className="font-semibold text-slate-700 block mb-1.5">Weight (kg)</label>
                    <input type="number" id="weight" name="weight" min="0" value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition"/>
                  </div>
                   <div>
                    <label htmlFor="status" className="font-semibold text-slate-700 block mb-1.5">Status*</label>
                    <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                      {Object.values(PatientStatus).map(s => <option key={String(s)} value={s}>{s}</option>)}
                    </select>
                  </div>
              </div>

               <div>
                  <label htmlFor="admittedDate" className="font-semibold text-slate-700 block mb-1.5">Admitted Date*</label>
                  <input type="date" id="admittedDate" name="admittedDate" value={formData.admittedDate} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>

            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
