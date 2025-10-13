import React from 'react';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { StethoscopeIcon } from '../../components/icons/StethoscopeIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { BillingIcon } from '../../components/icons/BillingIcon';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

const DashboardHome: React.FC = () => {
  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Doctors" value="12" icon={<StethoscopeIcon className="h-6 w-6 text-white"/>} color="bg-blue-500" />
            <StatCard title="Total Patients" value="348" icon={<UsersIcon className="h-6 w-6 text-white"/>} color="bg-green-500" />
            <StatCard title="Appointments Today" value="27" icon={<CalendarIcon className="h-6 w-6 text-white"/>} color="bg-amber-500" />
            <StatCard title="Revenue (This Month)" value="2506700 BDT" icon={<BillingIcon className="h-6 w-6 text-white"/>} color="bg-primary-500" />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
                <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Md. Rakib Hossain</p>
                            <p className="text-sm text-slate-500">10:30 AM - Cardiology</p>
                        </div>
                        <span className="text-sm font-medium text-slate-600">In 30 mins</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Sakib Mahmud</p>
                            <p className="text-sm text-slate-500">11:00 AM - Pediatrics</p>
                        </div>
                        <span className="text-sm font-medium text-slate-600">In 1 hour</span>
                    </li>
                     <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Borhan Uddin</p>
                            <p className="text-sm text-slate-500">02:00 PM - Neurology</p>
                        </div>
                        <span className="text-sm font-medium text-slate-600">Today</span>
                    </li>
                </ul>
            </div>
            
            {/* Recent Patient Admissions */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Admissions</h2>
                <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Mahmud Hossain</p>
                            <p className="text-sm text-slate-500">Admitted to Room 302</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Admitted</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Muntasir mahid</p>
                            <p className="text-sm text-slate-500">Discharged from Room 104</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">Discharged</span>
                    </li>
                     <li className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-700">Ramisa Ahmaed</p>
                            <p className="text-sm text-slate-500">Admitted to ER</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Admitted</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  );
};

export default DashboardHome;
