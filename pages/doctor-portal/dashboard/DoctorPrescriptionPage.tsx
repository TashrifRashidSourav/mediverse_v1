import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { Patient, Prescription, Medication, SiteSettings } from '../../../types';
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { PrinterIcon } from '../../../components/icons/PrinterIcon';
import { SaveIcon } from '../../../components/icons/SaveIcon';

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const DoctorPrescriptionPage: React.FC = () => {
    const { subdomain, patientId } = useParams<{ subdomain: string; patientId?: string }>();
    const navigate = useNavigate();
    const prescriptionRef = useRef<HTMLDivElement>(null);

    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tests, setTests] = useState('');
    const [advice, setAdvice] = useState('');

    const [doctorProfile, setDoctorProfile] = useState<any>(null);
    const [themeSettings, setThemeSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('doctorProfile') || 'null');
        if (profile) {
            setDoctorProfile(profile);
            setThemeSettings(profile.settings);
        }
    }, []);
    
    useEffect(() => {
        if (!patientId || !subdomain || !doctorProfile) {
            if (!doctorProfile) setError('Doctor profile not loaded.');
            else setError('Required information is missing.');
            setIsLoading(false);
            return;
        }

        const fetchPatient = async () => {
            try {
                const usersRef = db.collection('users');
                const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
                if (userQuery.empty) throw new Error('Hospital not found.');
                const hospitalId = userQuery.docs[0].id;

                const patientDoc = await usersRef.doc(hospitalId).collection('patients').doc(patientId).get();
                if (!patientDoc.exists) throw new Error('Patient not found.');
                
                setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient);
            } catch (err: any) {
                setError(err.message || 'Failed to load patient data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatient();
    }, [patientId, subdomain, doctorProfile]);

    const addMedication = () => {
        setMedications([...medications, { id: generateId(), name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedication = (id: string) => {
        setMedications(medications.filter(m => m.id !== id));
    };

    const handleMedicationChange = (id: string, field: keyof Omit<Medication, 'id'>, value: string) => {
        setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handlePrint = () => {
        window.print();
    };
    
    const handleSave = async () => {
        if (!patient || !doctorProfile) return;
        setIsSaving(true);
        try {
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
            const hospitalId = userQuery.docs[0].id;

            const newPrescription: Omit<Prescription, 'id'> = {
                patientId: patient.id,
                patientName: patient.name,
                patientAge: patient.age,
                patientGender: patient.gender,
                doctorId: doctorProfile.id,
                doctorName: doctorProfile.name,
                hospitalId: hospitalId,
                date: new Date().toISOString(),
                medications,
                tests,
                advice,
            };
            
            await usersRef.doc(hospitalId).collection('prescriptions').add(newPrescription);
            alert('Prescription saved successfully!');
            navigate(`/${subdomain}/doctor-portal/dashboard`);
        } catch (err) {
            console.error("Failed to save prescription", err);
            alert('Error: Could not save prescription.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const themeColor = themeSettings?.themeColor || '#0D9488';
    const buttonColor = themeSettings?.buttonColor || themeColor;

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 font-bold p-4">{error}</div>;
    if (!patient) return <div>Select a patient to write a prescription.</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-slate-900">New Prescription</h1>
                <div className="flex gap-2">
                     <button onClick={handleSave} disabled={isSaving} className="text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" style={{backgroundColor: buttonColor}}>
                        <SaveIcon className="h-5 w-5"/> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handlePrint} className="text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" style={{backgroundColor: themeColor}}>
                        <PrinterIcon className="h-5 w-5"/> Print
                    </button>
                </div>
            </div>

            <div ref={prescriptionRef} className="prescription-pad bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto font-serif">
                <header className="text-center border-b-2 border-gray-300 pb-4">
                    <h2 className="text-4xl font-bold text-gray-800">{doctorProfile.hospitalName}</h2>
                    <p className="text-lg font-semibold text-gray-700 mt-2">{doctorProfile.name}</p>
                    <p className="text-sm text-gray-500">{doctorProfile.specialization} | {doctorProfile.qualifications}</p>
                </header>
                <section className="flex justify-between border-b border-gray-300 py-3 text-sm">
                    <div><strong>Patient:</strong> {patient.name}</div>
                    <div><strong>Age:</strong> {patient.age}</div>
                    <div><strong>Gender:</strong> {patient.gender}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                </section>
                <main className="mt-6">
                    <div className="flex">
                        <div className="text-5xl font-bold text-gray-400 mr-4">Rx</div>
                        <div className="w-full">
                            {medications.map((med, index) => (
                                <div key={med.id} className="grid grid-cols-12 gap-2 mb-2 items-center print:mb-1">
                                    <span className="col-span-1 text-right font-bold">{index + 1}.</span>
                                    <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => handleMedicationChange(med.id, 'name', e.target.value)} className="col-span-11 md:col-span-4 prescription-input" />
                                    <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => handleMedicationChange(med.id, 'dosage', e.target.value)} className="col-span-6 md:col-span-2 prescription-input md:col-start-6" />
                                    <input type="text" placeholder="Frequency (e.g., 1+0+1)" value={med.frequency} onChange={e => handleMedicationChange(med.id, 'frequency', e.target.value)} className="col-span-6 md:col-span-2 prescription-input" />
                                    <input type="text" placeholder="Duration (e.g., 7 Days)" value={med.duration} onChange={e => handleMedicationChange(med.id, 'duration', e.target.value)} className="col-span-10 md:col-span-2 prescription-input" />
                                    <button onClick={() => removeMedication(med.id)} className="col-span-2 md:col-span-1 text-red-500 hover:text-red-700 print:hidden"><TrashIcon className="h-5 w-5 mx-auto"/></button>
                                </div>
                            ))}
                             <button onClick={addMedication} className="mt-2 text-sm font-semibold hover:opacity-80 flex items-center gap-1 print:hidden" style={{color: themeColor}}>
                                <PlusIcon className="h-4 w-4"/> Add Medication
                            </button>
                        </div>
                    </div>
                     <div className="mt-8">
                        <label className="font-bold text-gray-700 text-lg">Tests Recommended</label>
                        <textarea value={tests} onChange={e => setTests(e.target.value)} rows={3} className="w-full prescription-input mt-1" style={{'--focus-color': themeColor} as any}></textarea>
                    </div>
                     <div className="mt-6">
                        <label className="font-bold text-gray-700 text-lg">Advice</label>
                        <textarea value={advice} onChange={e => setAdvice(e.target.value)} rows={3} className="w-full prescription-input mt-1" style={{'--focus-color': themeColor} as any}></textarea>
                    </div>
                </main>
                <footer className="mt-20 text-right">
                    <p className="font-semibold">{doctorProfile.name}</p>
                    <p>Signature</p>
                </footer>
            </div>

            <style>{`
                .prescription-input {
                    border: none;
                    border-bottom: 1px dashed #ccc;
                    background: transparent;
                    padding: 4px;
                    width: 100%;
                }
                .prescription-input:focus {
                    outline: none;
                    border-bottom: 1px solid var(--focus-color, #0D9488);
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden { display: none; }
                    .prescription-pad, .prescription-pad * {
                        visibility: visible;
                    }
                    .prescription-pad {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                        border: none;
                        margin: 0;
                        padding: 20px;
                    }
                     .prescription-input {
                        border-bottom: 1px solid #000;
                     }
                }
            `}</style>
        </div>
    );
};

export default DoctorPrescriptionPage;