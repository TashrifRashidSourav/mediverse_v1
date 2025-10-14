import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { Patient, PatientStatus } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  subdomain: string;
}

const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose, patientId, subdomain }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patientId && subdomain) {
      const fetchPatient = async () => {
        setIsLoading(true);
        setError('');
        try {
          const usersRef = db.collection('users');
          const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
          if (userQuery.empty) throw new Error('Hospital not found.');
          const hospitalId = userQuery.docs[0].id;

          const patientDoc = await usersRef.doc(hospitalId).collection('patients').doc(patientId).get();
          if (!patientDoc.exists) throw new Error('Patient record not found.');
          
          setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient);
        } catch (err: any) {
          setError(err.message || 'Failed to load patient data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatient();
    }
  }, [isOpen, patientId, subdomain]);
  
  const getStatusColor = (status: PatientStatus) => {
        switch(status) {
            case PatientStatus.Admitted: return 'bg-green-100 text-green-800';
            case PatientStatus.Discharged: return 'bg-slate-200 text-slate-800';
            case PatientStatus.In_Treatment: return 'bg-blue-100 text-blue-800';
            case PatientStatus.Observation: return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Patient Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <p>Loading profile...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : patient ? (
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {patient.profilePictureUrl ? <img src={patient.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-slate-400"/>}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{patient.name}</h3>
                        <p className="text-slate-500">{patient.gender}, {patient.age} years old</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-4 border-t">
                    <div className="font-semibold text-slate-500">Phone</div>
                    <div className="text-slate-800">{patient.phone}</div>
                    
                    <div className="font-semibold text-slate-500">Email</div>
                    <div className="text-slate-800">{patient.email || 'N/A'}</div>

                    <div className="font-semibold text-slate-500">Weight</div>
                    <div className="text-slate-800">{patient.weight ? `${patient.weight} kg` : 'N/A'}</div>
                    
                     <div className="font-semibold text-slate-500">Current Status</div>
                     <div><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>{patient.status}</span></div>

                    <div className="font-semibold text-slate-500">Admitted On</div>
                    <div className="text-slate-800">{new Date(patient.admittedDate).toLocaleDateString()}</div>
                </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PatientProfileModal;