import React from 'react';
import { ReportsIcon } from '../../components/icons/ReportsIcon';

const ReportsPage: React.FC = () => {
  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Reports & Analytics</h1>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <ReportsIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Feature Coming Soon</h2>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
                Get ready for powerful analytics. Our upcoming reports will provide daily and monthly insights into your hospital's performance, helping you make data-driven decisions.
            </p>
        </div>
    </div>
  );
};

export default ReportsPage;
