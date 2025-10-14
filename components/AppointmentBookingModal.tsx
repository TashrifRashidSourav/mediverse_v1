import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { Doctor, User, Patient, AppointmentStatus } from '../types';
import { XIcon } from './icons/XIcon';

interface AppointmentBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor;
    hospital: User;
    patient: Patient;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({ isOpen, onClose, doctor, hospital, patient }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: 0,
        phone: '',
        date: '',
        time: '',
        patientNotes: '',
    });
    
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (patient) {
            setFormData(prev => ({
                ...prev,
                name: patient.name || '',
                age: patient.age || 0,
                phone: patient.phone || '',
            }));
        }
    }, [patient, isOpen]);
    
    useEffect(() => {
        if (!formData.date || !doctor.availability) {
            setAvailableSlots([]);
            return;
        }

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDate = new Date(`${formData.date}T00:00:00`);
        const dayOfWeek = dayNames[selectedDate.getDay()];
        
        if (!doctor.availability.days.includes(dayOfWeek as any)) {
            setAvailableSlots([]);
            return;
        }

        // Generate time slots (e.g., every 30 mins)
        const slots = [];
        const { startTime, endTime } = doctor.availability;
        let currentTime = new Date(`${formData.date}T${startTime}`);
        const lastTime = new Date(`${formData.date}T${endTime}`);
        
        while (currentTime < lastTime) {
            slots.push(currentTime.toTimeString().substring(0, 5));
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        setAvailableSlots(slots);
        setFormData(prev => ({ ...prev, time: '' })); // Reset time when date changes

    }, [formData.date, doctor.availability]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.time) {
            setError('Please select an available time slot.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Authentication error.");

            const newAppointment = {
                patientId: patient.id,
                patientName: formData.name,
                authUid: currentUser.uid,
                doctorId: doctor.id,
                doctorName: doctor.name,
                hospitalId: hospital.uid,
                hospitalName: hospital.hospitalName,
                date: formData.date,
                time: formData.time,
                status: AppointmentStatus.Pending,
                patientNotes: formData.patientNotes,
            };
            
            await db.collection('users').doc(hospital.uid).collection('appointments').add(newAppointment);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
            {success ? (
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-3">Appointment Requested!</h2>
                    <p className="text-slate-600">Your request has been sent to {hospital.hospitalName}. You can check the status in your patient dashboard.</p>
                    <button onClick={onClose} className="mt-6 w-full bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-700">
                        Done
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-2xl font-bold text-slate-900">Book Appointment</h2>
                                <p className="text-slate-500">With Dr. {doctor.name}</p>
                             </div>
                            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="h-6 w-6" /></button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="name" className="font-semibold text-slate-700 block mb-1.5 text-sm">Full Name*</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label htmlFor="age" className="font-semibold text-slate-700 block mb-1.5 text-sm">Age*</label>
                                    <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5 text-sm">Phone*</label>
                                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                            </div>

                             <div>
                                <label htmlFor="patientNotes" className="font-semibold text-slate-700 block mb-1.5 text-sm">Reason for Visit</label>
                                <textarea id="patientNotes" name="patientNotes" value={formData.patientNotes} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Briefly describe your symptoms or reason for visit..."></textarea>
                            </div>
                            
                            <div>
                                <label htmlFor="date" className="font-semibold text-slate-700 block mb-1.5 text-sm">Select Date*</label>
                                <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                            </div>

                            {formData.date && (
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5 text-sm">Select Time*</label>
                                    {availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableSlots.map(slot => (
                                                <button
                                                    type="button"
                                                    key={slot}
                                                    onClick={() => setFormData(prev => ({...prev, time: slot}))}
                                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                                                        formData.time === slot
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-lg">Dr. {doctor.name} is not available on this day. Please select another date.</p>
                                    )}
                                </div>
                            )}

                             {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
                        </div>
                    </div>
                     <div className="bg-slate-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 disabled:bg-primary-300">
                            {isSubmitting ? 'Submitting...' : 'Request Appointment'}
                        </button>
                    </div>
                </form>
            )}
            </div>
        </div>
    );
};

export default AppointmentBookingModal;