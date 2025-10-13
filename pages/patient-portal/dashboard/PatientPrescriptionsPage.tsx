import React from 'react';
import { ReportsIcon } from '../../../components/icons/ReportsIcon';

const PatientPrescriptionsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Prescriptions</h1>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <ReportsIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Feature Coming Soon</h2>
                <p className="mt-2 text-slate-600 max-w-md mx-auto">
                   Your digital prescriptions will be available here soon, with options to view, download, and search your history.
                </p>
            </div>
        </div>
    );
};

export default PatientPrescriptionsPage;
