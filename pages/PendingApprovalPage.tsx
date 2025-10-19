import React from 'react';
import { Link } from 'react-router-dom';
import { MedicalIcon } from '../components/icons/MedicalIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

const PendingApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <ClockIcon className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-4xl font-extrabold text-slate-800">Account Pending Approval</h1>
        <p className="text-lg text-slate-600 mt-2">Thank you for your registration!</p>
        <p className="text-slate-500 mt-4 max-w-md">
            Your account is currently under review by our administration team. You will receive an email notification once your hospital account has been approved.
        </p>
        <Link 
            to="/" 
            className="mt-8 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
        >
            Go Back to Mediverse Home
        </Link>
    </div>
  );
};

export default PendingApprovalPage;
