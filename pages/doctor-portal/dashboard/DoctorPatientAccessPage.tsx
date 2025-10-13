import React, { useState, useCallback } from 'react';
import { db } from '../../../firebase';
import { Patient, Appointment } from '../../../types';
import { useParams, Link } from 'react-router-dom';

const DoctorPatientAccessPage: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    const doctorProfile = JSON.parse(localStorage.getItem('doctorProfile') || 'null');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || !subdomain || !doctorProfile) return;
        
        setIsLoading(true);
        setError('');
        setMessage('');
        setPatient(null);

        try {
            // 1. Find the hospital ID from subdomain
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
            if (userQuery.empty) throw new Error('Hospital not found.');
            const hospitalId = userQuery.docs[0].id;
            
            // 2. Find the patient by phone number within that hospital
            const patientsRef = usersRef.doc(hospitalId).collection('patients');
            const patientQuery = await patientsRef.where('phone', '==', phone.trim()).limit(1).get();
            if (patientQuery.empty) {
                setMessage('No patient found with this phone number in this hospital.');
                setIsLoading(false);
                return;
            }
            const foundPatient = { id: patientQuery.docs[0].id, ...patientQuery.docs[0].data() } as Patient;
            
            // 3. Verify the doctor has an appointment with this patient
            const appointmentsRef = usersRef.doc(hospitalId).collection('appointments');
            const appointmentQuery = await appointmentsRef
                .where('patientId', '==', foundPatient.id)
                .where('doctorId', '==', doctorProfile.id)
                .limit(1).get();

            if (appointmentQuery.empty) {
                setError('Access Denied. You do not have an appointment with this patient.');
                setIsLoading(false);
                return;
            }
            
            // 4. If all checks pass, set the patient data
            setPatient(foundPatient);

        } catch (err: any) {
            console.error("Patient search error:", err);
            setError(err.message || "An error occurred during search.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Patient Record Access</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto">
                <p className="text-slate-600 mb-4">Enter a patient's phone number to find their record. You can only access records for patients you have an appointment with.</p>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Patient's phone number"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary transition"
                        required
                    />
                    <button type="submit" disabled={isLoading} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && <p className="text-center mt-4 text-red-600 font-semibold">{error}</p>}
            {message && <p className="text-center mt-4 text-slate-600">{message}</p>}

            {patient && (
                <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto mt-8 animate-fade-in">
                    <style>{`@keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.3s ease-out; }`}</style>
                    <div className="flex justify-between items-start">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
                            <p className="text-slate-500">{patient.gender}, {patient.age} years old</p>
                        </div>
                        <Link to={`/${subdomain}/doctor-portal/dashboard/prescription/${patient.id}`} className="bg-primary-50 text-primary font-bold py-2 px-4 rounded-lg hover:bg-primary-100 transition-colors">
                            Write Prescription
                        </Link>
                    </div>
                    <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="text-slate-600">Phone:</strong> {patient.phone}</div>
                        <div><strong className="text-slate-600">Email:</strong> {patient.email || 'N/A'}</div>
                        <div><strong className="text-slate-600">Weight:</strong> {patient.weight ? `${patient.weight} kg` : 'N/A'}</div>
                        <div><strong className="text-slate-600">Status:</strong> <span className="font-semibold">{patient.status}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatientAccessPage;
