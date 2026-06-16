import React, { useState, useEffect } from 'react';
import { Invoice, Patient } from '../../types';
import { XIcon } from '../icons/XIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: Omit<Invoice, 'id'>) => void;
  patients: Patient[];
}

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, onSave, patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState([{ description: '', amount: 0 }]);
  const [status, setStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPatientId('');
      setItems([{ description: '', amount: 0 }]);
      setStatus('Pending');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...items];
    if (field === 'amount') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || items.length === 0) return;

    setIsSubmitting(true);
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) {
      setIsSubmitting(false);
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const invoiceData: Omit<Invoice, 'id'> = {
      hospitalId: '', // Will be set by parent
      patientId: patient.id,
      patientName: patient.name,
      authUid: patient.authUid,
      date: new Date().toISOString(),
      items: items.filter(item => item.description.trim() !== ''),
      totalAmount,
      status,
    };

    await onSave(invoiceData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-slate-900">Create New Invoice</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="patient" className="font-semibold text-slate-700 block mb-1.5">Select Patient*</label>
                <select 
                  id="patient" 
                  value={selectedPatientId} 
                  onChange={(e) => setSelectedPatientId(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" 
                  required
                >
                  <option value="" disabled>Select a patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-slate-700 block">Invoice Items*</label>
                  <button type="button" onClick={handleAddItem} className="text-primary text-sm font-semibold flex items-center gap-1 hover:text-primary-700">
                    <PlusIcon className="h-4 w-4" /> Add Item
                  </button>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input 
                      type="text" 
                      placeholder="Description" 
                      value={item.description} 
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" 
                      required 
                    />
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      min="0"
                      value={item.amount || ''} 
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)} 
                      className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" 
                      required 
                    />
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 px-2">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div>
                  <label htmlFor="status" className="font-semibold text-slate-700 block mb-1.5">Status</label>
                  <select 
                    id="status" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as 'Pending' | 'Paid')} 
                    className="w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium">Total Amount</span>
                  <div className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</div>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !selectedPatientId} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingModal;
