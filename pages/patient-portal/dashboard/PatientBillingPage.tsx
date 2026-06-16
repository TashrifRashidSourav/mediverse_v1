import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import { Invoice, Plan } from '../../../types';
import { BillingIcon } from '../../../components/icons/BillingIcon';
import PaymentPopup from '../../../components/PaymentPopup';

const PatientBillingPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

    const fetchInvoices = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('You must be logged in to see billing information.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            const allInvoices: Invoice[] = [];
            
            // Use collectionGroup query for efficiency and better rule matching
            const snapshot = await db.collectionGroup('invoices')
                .where('authUid', '==', currentUser.uid)
                .get();

            snapshot.forEach(doc => {
                allInvoices.push({ id: doc.id, ...doc.data() } as Invoice);
            });

            allInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setInvoices(allInvoices);
        } catch (err: any) {
            console.error("Fetch Invoices Error:", err);
            setError(`Failed to fetch invoices: ${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handlePayNow = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentPopupOpen(true);
    };

    const handlePaymentSuccess = async () => {
        if (!selectedInvoice) return;
        
        try {
            // Update in Firestore
            await db.collection('users')
                .doc(selectedInvoice.hospitalId)
                .collection('invoices')
                .doc(selectedInvoice.id)
                .update({ status: 'Paid' });
                
            // Update local state to immediately show as Paid without refetching
            setInvoices(prevInvoices => 
                prevInvoices.map(inv => 
                    inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv
                )
            );
        } catch (error) {
            console.error("Error updating invoice status after payment:", error);
            // Note: If this fails with permission-denied, the user needs to update their Firestore rules
            // to allow patients to update the status field of their own invoices.
            alert("Payment succeeded, but we couldn't update the invoice status. Please contact support.");
        } finally {
            setIsPaymentPopupOpen(false);
            setSelectedInvoice(null);
        }
    };

    const filteredAndSortedInvoices = React.useMemo(() => {
        let result = [...invoices];
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(inv => 
                inv.status.toLowerCase().includes(q) || 
                inv.items.some(item => item.description.toLowerCase().includes(q))
            );
        }
        
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date_asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'date_desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'amount_asc': return a.totalAmount - b.totalAmount;
                case 'amount_desc': return b.totalAmount - a.totalAmount;
                default: return 0;
            }
        });
        
        return result;
    }, [invoices, searchQuery, sortBy]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Billing & Payments</h1>
            
            {/* Search and Sort Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Search by details or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full sm:w-auto bg-slate-50 border border-slate-300 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="date_desc">Date (Newest First)</option>
                        <option value="date_asc">Date (Oldest First)</option>
                        <option value="amount_desc">Amount (High to Low)</option>
                        <option value="amount_asc">Amount (Low to High)</option>
                    </select>
                </div>
            </div>
            
            {isLoading ? (
                <p className="text-center p-8 text-slate-500">Loading invoices...</p>
            ) : error ? (
                <p className="text-center p-8 text-red-500">{error}</p>
            ) : filteredAndSortedInvoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <BillingIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">No Invoices Found</h2>
                    <p className="mt-2 text-slate-600 max-w-md mx-auto">
                        We couldn't find any invoices matching your search.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Date</th>
                                    <th className="p-4 font-semibold text-slate-600">Details</th>
                                    <th className="p-4 font-semibold text-slate-600">Amount</th>
                                    <th className="p-4 font-semibold text-slate-600">Status</th>
                                    <th className="p-4 font-semibold text-slate-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-t border-slate-200">
                                        <td className="p-4 text-slate-700">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-slate-700">
                                            <ul className="list-disc pl-4">
                                                {invoice.items.map((item, idx) => (
                                                    <li key={idx} className="text-sm">{item.description}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">${invoice.totalAmount.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {invoice.status === 'Pending' ? (
                                                <button 
                                                    onClick={() => handlePayNow(invoice)}
                                                    className="bg-primary text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                                >
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <span className="text-slate-500 font-medium text-sm">Paid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <PaymentPopup 
                isOpen={isPaymentPopupOpen}
                onClose={() => setIsPaymentPopupOpen(false)}
                plan={selectedInvoice ? { id: selectedInvoice.id, name: `Invoice #${selectedInvoice.id}`, price: selectedInvoice.totalAmount } as Plan : null}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default PatientBillingPage;
