import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { Patient, Prescription, Medication, SiteSettings } from '../../../types';
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { PrinterIcon } from '../../../components/icons/PrinterIcon';
import { SaveIcon } from '../../../components/icons/SaveIcon';
import { DownloadIcon } from '../../../components/icons/DownloadIcon';

// Declare globals from CDN to prevent TypeScript errors
declare const html2canvas: any;
declare const jspdf: any;

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const DoctorPrescriptionPage: React.FC = () => {
    const { subdomain, patientId } = useParams<{ subdomain: string; patientId?: string }>();
    const navigate = useNavigate();
    const prescriptionRef = useRef<HTMLDivElement>(null);

    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [medications, setMedications] = useState<Medication[]>([{ id: generateId(), name: '', dosage: '', frequency: '1-0-1', timing: 'After Meal', duration: '' }]);
    const [tests, setTests] = useState('');
    const [advice, setAdvice] = useState('');
    const [nextVisit, setNextVisit] = useState('');

    const [doctorProfile, setDoctorProfile] = useState<any>(null);

    useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('doctorProfile') || 'null');
        if (profile) {
            setDoctorProfile(profile);
        } else {
            setError('Doctor profile not found. Please log in again.');
        }
    }, []);
    
    useEffect(() => {
        if (!patientId || !subdomain || !doctorProfile) return;

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
        setMedications([...medications, { id: generateId(), name: '', dosage: '', frequency: '1-0-1', timing: 'After Meal', duration: '' }]);
    };

    const removeMedication = (id: string) => {
        setMedications(medications.filter(m => m.id !== id));
    };

    const handleMedicationChange = (id: string, field: keyof Omit<Medication, 'id'>, value: string) => {
        setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handlePrint = () => window.print();
    
    const handleExportPDF = () => {
        const input = prescriptionRef.current;
        if (!input) return;
        const { jsPDF } = jspdf;

        html2canvas(input, { scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`prescription-${patient?.name}-${new Date().toISOString().split('T')[0]}.pdf`);
        });
    };

    const handleSave = async () => {
        if (!patient || !doctorProfile) return;
        setIsSaving(true);
        try {
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('subdomain', '==', subdomain).limit(1).get();
            const hospitalDoc = userQuery.docs[0];
            const hospitalId = hospitalDoc.id;

            const newPrescription: Omit<Prescription, 'id'> = {
                patientId: patient.id,
                authUid: patient.authUid,
                patientName: patient.name,
                patientAge: patient.age,
                patientGender: patient.gender,
                doctorId: doctorProfile.id,
                doctorName: doctorProfile.name,
                doctorQualifications: doctorProfile.qualifications,
                hospitalId: hospitalId,
                hospitalName: doctorProfile.hospitalName,
                hospitalLogoUrl: doctorProfile.settings?.logoUrl || '',
                date: new Date().toISOString(),
                medications: medications.filter(m => m.name.trim() !== ''),
                tests,
                advice,
                nextVisit,
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
    
    const themeColor = doctorProfile?.settings?.themeColor || '#0D9488';
    const buttonColor = doctorProfile?.settings?.buttonColor || themeColor;

    if (isLoading) return <div className="p-4">Loading patient details...</div>;
    if (error) return <div className="p-4 text-red-600 font-bold">{error}</div>;
    if (!patient) return <div className="p-4">No patient data. Please go back and select a patient.</div>

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 print:hidden gap-2">
                <h1 className="text-3xl font-bold text-slate-900">New Prescription</h1>
                <div className="flex gap-2">
                     <button onClick={handleSave} disabled={isSaving} className="text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" style={{backgroundColor: buttonColor}}>
                        <SaveIcon className="h-5 w-5"/> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handleExportPDF} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-opacity flex items-center gap-2">
                        <DownloadIcon className="h-5 w-5"/> PDF
                    </button>
                    <button onClick={handlePrint} className="text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" style={{backgroundColor: themeColor}}>
                        <PrinterIcon className="h-5 w-5"/> Print
                    </button>
                </div>
            </div>

            <div ref={prescriptionRef} className="prescription-pad bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto font-sans">
                <header className="flex justify-between items-start border-b-2 pb-4" style={{borderColor: themeColor}}>
                    <div>
                        {doctorProfile?.settings?.logoUrl && <img src={doctorProfile.settings.logoUrl} alt="logo" className="h-16 mb-2"/>}
                        <h2 className="text-2xl font-bold" style={{color: themeColor}}>{doctorProfile.hospitalName}</h2>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-slate-800">{doctorProfile.name}</h3>
                        <p className="text-sm text-slate-600">{doctorProfile.qualifications}</p>
                    </div>
                </header>
                <section className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 border-b border-gray-300 py-3 text-sm">
                    <div><strong>Patient:</strong> {patient.name}</div>
                    <div><strong>Age:</strong> {patient.age}</div>
                    <div><strong>Gender:</strong> {patient.gender}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                </section>
                <main className="mt-6">
                    <div className="flex">
                        <div className="text-5xl font-bold text-gray-300 mr-4 mt-1">Rx</div>
                        <div className="w-full space-y-3">
                            {medications.map((med, index) => (
                                <div key={med.id} className="grid grid-cols-12 gap-x-3 gap-y-2 pb-3 border-b border-dashed">
                                    <div className="col-span-12 flex items-center">
                                       <span className="font-bold mr-2">{index+1}.</span>
                                       <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => handleMedicationChange(med.id, 'name', e.target.value)} className="w-full prescription-input font-semibold" />
                                       <button onClick={() => removeMedication(med.id)} className="text-red-400 hover:text-red-600 print:hidden ml-2"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                    <div className="col-span-4 sm:col-span-3"><input type="text" placeholder="Dosage" value={med.dosage} onChange={e => handleMedicationChange(med.id, 'dosage', e.target.value)} className="prescription-input"/></div>
                                    <div className="col-span-4 sm:col-span-3"><input type="text" placeholder="e.g., 1-0-1" value={med.frequency} onChange={e => handleMedicationChange(med.id, 'frequency', e.target.value)} className="prescription-input"/></div>
                                    <div className="col-span-4 sm:col-span-3"><select value={med.timing} onChange={e => handleMedicationChange(med.id, 'timing', e.target.value)} className="prescription-input"><option>After Meal</option><option>Before Meal</option><option>With Meal</option></select></div>
                                    <div className="col-span-12 sm:col-span-3"><input type="text" placeholder="Duration" value={med.duration} onChange={e => handleMedicationChange(med.id, 'duration', e.target.value)} className="prescription-input"/></div>
                                </div>
                            ))}
                             <button onClick={addMedication} className="mt-2 text-sm font-semibold hover:opacity-80 flex items-center gap-1 print:hidden" style={{color: themeColor}}>
                                <PlusIcon className="h-4 w-4"/> Add Medication
                            </button>
                        </div>
                    </div>
                     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="font-bold text-gray-700 text-lg block mb-1">C/C (Tests)</label>
                            <textarea value={tests} onChange={e => setTests(e.target.value)} rows={4} className="w-full prescription-input" placeholder="e.g., CBC, Serum Creatinine" style={{'--focus-color': themeColor} as any}></textarea>
                        </div>
                         <div>
                            <label className="font-bold text-gray-700 text-lg block mb-1">O/E (Advice)</label>
                            <textarea value={advice} onChange={e => setAdvice(e.target.value)} rows={4} className="w-full prescription-input" placeholder="e.g., Drink plenty of water" style={{'--focus-color': themeColor} as any}></textarea>
                        </div>
                     </div>
                     <div className="mt-6">
                         <label className="font-bold text-gray-700 text-lg block mb-1">Next Visit</label>
                         <input type="date" value={nextVisit} onChange={e => setNextVisit(e.target.value)} className="prescription-input w-full md:w-1/2"/>
                     </div>
                </main>
                <footer className="mt-20 text-right">
                    <div className="inline-block border-t-2 border-slate-700 px-8 pt-1">
                        <p className="font-semibold text-slate-800">{doctorProfile.name}</p>
                        <p className="text-sm text-slate-600">Signature</p>
                    </div>
                </footer>
            </div>

            <style>{`
                .prescription-input {
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: transparent;
                    padding: 6px 10px;
                    width: 100%;
                    font-size: 14px;
                }
                .prescription-input:focus {
                    outline: none;
                    border-color: var(--focus-color, #0D9488);
                    box-shadow: 0 0 0 1px var(--focus-color, #0D9488);
                }
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    .prescription-pad, .prescription-pad * { visibility: visible; }
                    .prescription-pad {
                        position: absolute; left: 0; top: 0; width: 100%;
                        box-shadow: none !important; border: none !important;
                        margin: 0; padding: 10mm; font-size: 10pt;
                    }
                    .prescription-input {
                        border: none !important;
                        box-shadow: none !important;
                        border-bottom: 1px dotted #999 !important;
                        border-radius: 0 !important;
                        padding: 2px 0 !important;
                    }
                    select { -webkit-appearance: none; appearance: none; }
                }
            `}</style>
        </div>
    );
};

export default DoctorPrescriptionPage;