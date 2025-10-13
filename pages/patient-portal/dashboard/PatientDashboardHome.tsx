import React, { useState, useEffect } from 'react';

const PatientDashboardHome: React.FC = () => {
    const [patientName, setPatientName] = useState('');

    useEffect(() => {
        const storedProfile = localStorage.getItem('patientProfile');
        if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            setPatientName(parsed.name);
        }
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {patientName}!</h1>
            <p className="text-slate-600">This is your personal health dashboard. From here you can manage your profile, appointments, and view your medical records.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointment</h2>
                    <p className="text-slate-500">You have no upcoming appointments.</p>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
                    <p className="text-slate-500">No recent activity to show.</p>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboardHome;
