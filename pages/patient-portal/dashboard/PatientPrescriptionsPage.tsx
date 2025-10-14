import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import { Prescription } from '../../../types';
import { ReportsIcon } from '../../../components/icons/ReportsIcon';
import PrescriptionView from '../../../components/PrescriptionView';

const PatientPrescriptionsPage: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    const fetchPrescriptions = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to see prescriptions.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const snapshot = await db.collectionGroup('prescriptions')
                .where('authUid', '==', currentUser.uid)
                .orderBy('date', 'desc')
                .get();
                
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
            setPrescriptions(data);

        } catch (err) {
            console.error(err);
            setError('Failed to fetch prescriptions. This can sometimes be fixed by updating database security rules.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);


    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Prescriptions</h1>
            
            {isLoading ? (
                 <p className="text-center p-8 text-slate-500">Loading prescriptions...</p>
            ) : error ? (
                <p className="text-center p-8 text-red-500">{error}</p>
            ) : prescriptions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <ReportsIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">No Prescriptions Found</h2>
                    <p className="mt-2 text-slate-600 max-w-md mx-auto">
                       Your digital prescriptions from Mediverse hospitals will appear here once they are issued by your doctor.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prescriptions.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedPrescription(p)}
                            className="bg-white p-5 rounded-xl shadow-md text-left hover:shadow-lg hover:border-primary border-2 border-transparent transition-all transform hover:-translate-y-1"
                        >
                            <p className="font-bold text-lg text-slate-800">{p.hospitalName}</p>
                            <p className="text-sm text-slate-500">with Dr. {p.doctorName.split(' ').pop()}</p>
                            <p className="mt-3 text-sm font-semibold text-primary">{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </button>
                    ))}
                </div>
            )}
            
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPrescription(null)}>
                    <div className="bg-slate-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                       <PrescriptionView
                         prescription={selectedPrescription}
                         onClose={() => setSelectedPrescription(null)}
                       />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientPrescriptionsPage;