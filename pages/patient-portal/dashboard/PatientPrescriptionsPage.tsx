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

    // New state for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const fetchPrescriptions = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to see prescriptions.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            // Use a more efficient collectionGroup query, enabled by the new security rules.
            const snapshot = await db.collectionGroup('prescriptions')
                .where('authUid', '==', currentUser.uid)
                .orderBy('date', 'desc')
                .get();

            const allPrescriptions: Prescription[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
            setPrescriptions(allPrescriptions);

        } catch (err: any) {
            console.error(err);
            if (err.code === 'failed-precondition') {
                setError('Query requires a database index. Please check the browser console for a link to create it, then refresh the page.');
            } else {
                setError('Failed to fetch prescriptions. Please ensure your Firestore security rules have been updated.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    const filteredPrescriptions = prescriptions.filter(p => {
        const doctorNameMatch = p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
        const dateMatch = !filterDate || p.date.startsWith(filterDate);
        return doctorNameMatch && dateMatch;
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Prescriptions</h1>
            
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row gap-4 items-center print:hidden">
                <input
                    type="text"
                    placeholder="Search by Doctor's Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition"
                    aria-label="Search by doctor name"
                />
                <div className="w-full sm:w-auto flex items-center gap-2">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition"
                        aria-label="Filter by date"
                    />
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterDate('');
                        }}
                        className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                        aria-label="Clear filters"
                    >
                        Clear
                    </button>
                </div>
            </div>

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
            ) : filteredPrescriptions.length === 0 ? (
                 <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <ReportsIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">No Matching Prescriptions</h2>
                    <p className="mt-2 text-slate-600 max-w-md mx-auto">
                       No prescriptions found for the selected filters. Try clearing the filters to see all your prescriptions.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrescriptions.map(p => (
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