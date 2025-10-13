import React from 'react';
import { BillingIcon } from '../../../components/icons/BillingIcon';

const PatientBillingPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Billing & Payments</h1>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <BillingIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Feature Coming Soon</h2>
                <p className="mt-2 text-slate-600 max-w-md mx-auto">
                    Online payments (including Bkash and Nagad) and viewing your past invoices will be available here shortly.
                </p>
            </div>
        </div>
    );
};

export default PatientBillingPage;
