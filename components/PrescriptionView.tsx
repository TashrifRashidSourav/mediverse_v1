import React, { useRef } from 'react';
import { Prescription } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { XIcon } from './icons/XIcon';

// Declare globals from CDN to prevent TypeScript errors
declare const html2canvas: any;
declare const jspdf: any;

interface PrescriptionViewProps {
    prescription: Prescription;
    onClose: () => void;
}

const PrescriptionView: React.FC<PrescriptionViewProps> = ({ prescription, onClose }) => {
    const viewRef = useRef<HTMLDivElement>(null);
    const themeColor = prescription.hospitalLogoUrl ? '#334155' : '#0D9488'; // Default color if no logo

    const handlePrint = () => window.print();

    const handleExportPDF = () => {
        const input = viewRef.current;
        if (!input) return;
        const { jsPDF } = jspdf;

        html2canvas(input, { scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`prescription-${prescription.patientName}-${new Date(prescription.date).toISOString().split('T')[0]}.pdf`);
        });
    };

    return (
        <div className="font-sans">
            <div className="p-4 bg-slate-200 flex justify-between items-center print:hidden">
                <h3 className="font-bold text-slate-700">Prescription Details</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportPDF} className="bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-slate-700 flex items-center gap-2 text-sm"><DownloadIcon className="h-4 w-4"/> PDF</button>
                    <button onClick={handlePrint} className="bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"><PrinterIcon className="h-4 w-4"/> Print</button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon className="h-6 w-6"/></button>
                </div>
            </div>
            <div ref={viewRef} className="prescription-pad bg-white p-6 md:p-8">
                <header className="flex justify-between items-start border-b-2 pb-4" style={{borderColor: themeColor}}>
                    <div>
                        {prescription.hospitalLogoUrl && <img src={prescription.hospitalLogoUrl} alt="logo" className="h-16 mb-2"/>}
                        <h2 className="text-2xl font-bold" style={{color: themeColor}}>{prescription.hospitalName}</h2>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-slate-800">{prescription.doctorName}</h3>
                        <p className="text-sm text-slate-600">{prescription.doctorQualifications}</p>
                    </div>
                </header>
                 <section className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 border-b border-gray-300 py-3 text-sm">
                    <div><strong>Patient:</strong> {prescription.patientName}</div>
                    <div><strong>Age:</strong> {prescription.patientAge}</div>
                    <div><strong>Gender:</strong> {prescription.patientGender}</div>
                    <div><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</div>
                </section>
                <main className="mt-6">
                    <div className="flex">
                        <div className="text-5xl font-bold text-gray-300 mr-4 mt-1">Rx</div>
                        <div className="w-full space-y-3">
                            {prescription.medications.map((med, index) => (
                                <div key={med.id} className="pb-3 border-b border-dashed">
                                    <p className="font-bold text-slate-800">{index + 1}. {med.name}</p>
                                    <div className="text-sm text-slate-600 pl-5 flex flex-wrap gap-x-4">
                                        <span>{med.dosage}</span>
                                        <span>{med.frequency}</span>
                                        <span>{med.timing}</span>
                                        <span>({med.duration})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {(prescription.tests || prescription.advice) && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {prescription.tests && (
                                <div>
                                    <h4 className="font-bold text-gray-700 text-lg block mb-1">Tests</h4>
                                    <p className="whitespace-pre-wrap text-slate-700">{prescription.tests}</p>
                                </div>
                            )}
                            {prescription.advice && (
                                <div>
                                    <h4 className="font-bold text-gray-700 text-lg block mb-1">Advice</h4>
                                    <p className="whitespace-pre-wrap text-slate-700">{prescription.advice}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {prescription.nextVisit && (
                         <div className="mt-6">
                             <h4 className="font-bold text-gray-700 text-lg block mb-1">Next Visit</h4>
                             <p className="text-slate-700">{new Date(prescription.nextVisit).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                         </div>
                    )}
                </main>
                 <footer className="mt-20 text-right">
                    <div className="inline-block border-t-2 border-slate-700 px-8 pt-1">
                        <p className="font-semibold text-slate-800">{prescription.doctorName}</p>
                        <p className="text-sm text-slate-600">Signature</p>
                    </div>
                </footer>
            </div>
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    .prescription-pad, .prescription-pad * { visibility: visible; }
                    .prescription-pad {
                        position: absolute; left: 0; top: 0; width: 100%;
                        box-shadow: none !important; border: none !important;
                        margin: 0; padding: 10mm; font-size: 10pt;
                    }
                }
            `}</style>
        </div>
    );
}

export default PrescriptionView;