import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { Doctor, User, Patient, Appointment, AppointmentStatus, SiteSettings } from '../../types';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { BriefcaseIcon } from '../../components/icons/BriefcaseIcon';
import { DollarSignIcon } from '../../components/icons/DollarSignIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { XIcon } from '../../components/icons/XIcon';
import { MedicalIcon } from '../../components/icons/MedicalIcon';


// --- Appointment Booking Modal (included in this file) ---
interface AppointmentBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor;
    hospital: User;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({ isOpen, onClose, doctor, hospital }) => {
    const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPatient = async () => {
            const user = auth.currentUser;
            if (user) {
                const doc = await db.collection('patients').doc(user.uid).get();
                if (doc.exists) {
                    setPatientProfile({ id: doc.id, ...doc.data() } as Patient);
                }
            }
        };

        if (isOpen) {
            setSuccess(false);
            setError('');
            setDate('');
            setTime('');
            setTimeSlots([]);
            fetchPatient();
        }
    }, [isOpen]);

    useEffect(() => {
        if (date && doctor.availability) {
            const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            const availableSlot = doctor.availability.find(a => a.day === selectedDay);
            
            if (availableSlot) {
                const slots: string[] = [];
                let currentTime = new Date(`${date}T${availableSlot.startTime}`);
                const endTime = new Date(`${date}T${availableSlot.endTime}`);
                
                while (currentTime < endTime) {
                    slots.push(currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
                    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
                }
                setTimeSlots(slots);
            } else {
                setTimeSlots([]);
            }
        }
    }, [date, doctor.availability]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!time || !patientProfile) {
            setError("Please select an available time slot.");
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const user = auth.currentUser;
            if(!user) throw new Error("Not logged in.");

            const appointmentTime = new Date(`${date}T${time.replace(/( AM| PM)/, '')}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            const newAppointment: Omit<Appointment, 'id'> = {
                hospitalId: hospital.uid,
                hospitalName: hospital.hospitalName,
                authUid: user.uid,
                patientName: patientProfile.name,
                patientDetails: {
                    phone: patientProfile.phone,
                    age: patientProfile.age,
                    gender: patientProfile.gender,
                },
                doctorId: doctor.id,
                doctorName: doctor.name,
                date: date,
                time: appointmentTime,
                status: AppointmentStatus.Scheduled,
            };

            await db.collection('users').doc(hospital.uid).collection('appointments').add(newAppointment);
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError("Failed to book appointment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
                    <button onClick={onClose}><XIcon className="h-6 w-6 text-slate-500"/></button>
                </div>
                {success ? (
                    <div className="p-8 text-center">
                        <h3 className="text-2xl font-bold text-primary mb-2">Appointment Requested!</h3>
                        <p className="text-slate-600">The hospital has been notified. You can check the status of your appointment in your dashboard.</p>
                        <Link to="/patient/dashboard/appointments" className="mt-4 inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg">
                            View My Appointments
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-bold text-lg">{doctor.name}</h3>
                                <p className="text-slate-600">{doctor.specialization}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Select Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1.5">Select Time</label>
                                    <select value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required disabled={timeSlots.length === 0}>
                                        <option value="">{timeSlots.length > 0 ? 'Select a time' : 'No slots available'}</option>
                                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                    </select>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                        <div className="bg-slate-50 p-4 flex justify-end gap-3 rounded-b-2xl">
                            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                            <button type="submit" disabled={isSubmitting || !time} className="bg-primary text-white font-bold py-2 px-4 rounded-lg disabled:bg-primary-300">
                                {isSubmitting ? 'Requesting...' : 'Request Appointment'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}


// --- Main Page Component ---
const BookAppointmentPage: React.FC = () => {
    const { subdomain } = useParams<{ subdomain: string }>();
    const [hospital, setHospital] = useState<User | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!subdomain) {
                setError('No hospital specified.');
                setIsLoading(false);
                return;
            }
            try {
                const userQuery = await db.collection('users').where('subdomain', '==', subdomain).limit(1).get();
                if (userQuery.empty) throw new Error("Hospital not found.");

                const hospitalDoc = userQuery.docs[0];
                const hospitalData = { uid: hospitalDoc.id, ...hospitalDoc.data() } as User;
                setHospital(hospitalData);
                
                const settingsDoc = await db.collection('users').doc(hospitalDoc.id).collection('settings').doc('site').get();
                if (settingsDoc.exists) {
                    setSettings(settingsDoc.data() as SiteSettings);
                }

                const doctorsSnapshot = await db.collection('users').doc(hospitalDoc.id).collection('doctors').orderBy('name').get();
                setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [subdomain]);
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading doctors...</p></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

    return (
       <>
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to={`/${subdomain}`} className="flex items-center gap-2">
                         {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt={`${hospital?.hospitalName} Logo`} className="h-10 max-h-10 object-contain" />
                        ) : (
                            <MedicalIcon className="h-8 w-8 text-primary"/>
                        )}
                        <span className="text-2xl font-bold text-slate-800">{hospital?.hospitalName}</span>
                    </Link>
                    <Link to="/patient/dashboard" className="font-semibold text-primary hover:text-primary-700">My Dashboard</Link>
                </div>
            </header>
            <main className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-slate-900 text-center">Our Doctors</h1>
                <p className="text-lg text-slate-600 text-center mt-2 max-w-2xl mx-auto">Choose a specialist to book your appointment. All our doctors are verified and experienced.</p>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                                        {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-full w-full text-slate-400" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                                        <p className="font-semibold text-primary">{doctor.specialization}</p>
                                        <p className="text-sm text-slate-500">{doctor.qualifications}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-slate-700 border-t pt-4">
                                    <div className="flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-slate-500"/><span className="font-semibold">Experience:</span> {doctor.experience || 'N/A'}</div>
                                    <div className="flex items-center gap-2"><DollarSignIcon className="h-4 w-4 text-slate-500"/><span className="font-semibold">Fees:</span> ${doctor.fees || 'N/A'}</div>
                                    <div className="flex items-start gap-2"><ClockIcon className="h-4 w-4 text-slate-500 mt-0.5"/><span className="font-semibold">Availability:</span>
                                        <div>
                                            {doctor.availability && doctor.availability.length > 0
                                                ? doctor.availability.map(a => <p key={a.id}>{a.day}</p>)
                                                : <p>Not available</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-4 bg-slate-50">
                                <button
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className="w-full bg-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
        {selectedDoctor && hospital && (
            <AppointmentBookingModal
                isOpen={!!selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
                doctor={selectedDoctor}
                hospital={hospital}
            />
        )}
       </>
    );
};

export default BookAppointmentPage;