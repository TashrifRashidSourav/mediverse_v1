import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Invoice, Patient } from '../../types';
import { PlusIcon } from '../../components/icons/PlusIcon';
import BillingModal from '../../components/dashboard/BillingModal';
import PermissionGuide from '../../components/dashboard/PermissionGuide';
import { firebaseConfig } from '../../firebaseConfig';

const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setHospitalId(currentUser.uid);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!hospitalId) return;
    setIsLoading(true);
    setPermissionError(false);
    try {
      const snapshot = await db.collection('users').doc(hospitalId).collection('invoices').orderBy('date', 'desc').get();
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(invoicesData);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setPermissionError(`fetchInvoices: ${error.message}`);
      }
      console.error("Error fetching invoices:", error);
    }
    setIsLoading(false);
  }, [hospitalId]);

  const fetchPatients = useCallback(async () => {
    if (!hospitalId) return;
    try {
      const snapshot = await db.collection('users').doc(hospitalId).collection('patients').orderBy('name').get();
      const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(patientsData);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setPermissionError(`fetchPatients: ${error.message}`);
      }
      console.error("Error fetching patients:", error);
    }
  }, [hospitalId]);

  useEffect(() => {
    if (hospitalId) {
      fetchInvoices();
      fetchPatients();
    }
  }, [hospitalId, fetchInvoices, fetchPatients]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    if (!hospitalId) return;
    try {
      const dataToSave = { ...invoiceData, hospitalId };
      await db.collection('users').doc(hospitalId).collection('invoices').add(dataToSave);
      fetchInvoices();
      handleCloseModal();
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setPermissionError(`saveInvoice: ${error.message}`);
      }
      console.error("Error saving invoice:", error);
    }
  };

  const toggleInvoiceStatus = async (invoice: Invoice) => {
    if (!hospitalId) return;
    try {
      const newStatus = invoice.status === 'Pending' ? 'Paid' : 'Pending';
      await db.collection('users').doc(hospitalId).collection('invoices').doc(invoice.id).update({ status: newStatus });
      fetchInvoices();
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setPermissionError(`updateInvoice: ${error.message}`);
      }
      console.error("Error updating invoice status:", error);
    }
  };

  if (permissionError) {
    return <PermissionGuide firebaseConfig={firebaseConfig} errorDetails={permissionError} />;
  }

  const filteredAndSortedInvoices = React.useMemo(() => {
    let result = [...invoices];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.patientName.toLowerCase().includes(q) || 
        inv.status.toLowerCase().includes(q)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
        <button
          onClick={handleOpenModal}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by patient name or status..."
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

      <div className="bg-white rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Date</th>
                <th className="p-4 font-semibold text-slate-600">Patient Name</th>
                <th className="p-4 font-semibold text-slate-600">Items</th>
                <th className="p-4 font-semibold text-slate-600">Total Amount</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-500">Loading invoices...</td></tr>
              ) : filteredAndSortedInvoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-500">No invoices found matching your criteria.</td></tr>
              ) : (
                filteredAndSortedInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-t border-slate-200">
                    <td className="p-4 text-slate-700">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-slate-800">{invoice.patientName}</td>
                    <td className="p-4 text-slate-700">
                      <div className="max-w-[200px] truncate" title={invoice.items.map(i => i.description).join(', ')}>
                        {invoice.items.length} item(s)
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">${invoice.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleInvoiceStatus(invoice)}
                        className={`text-sm font-semibold px-3 py-1 rounded-lg border ${invoice.status === 'Pending' ? 'text-green-600 border-green-600 hover:bg-green-50' : 'text-amber-600 border-amber-600 hover:bg-amber-50'}`}
                      >
                        Mark as {invoice.status === 'Pending' ? 'Paid' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BillingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveInvoice}
        patients={patients}
      />
    </div>
  );
};

export default BillingPage;
