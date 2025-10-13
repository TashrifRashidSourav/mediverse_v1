import React from 'react';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';

const PatientAppointmentsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Appointments</h1>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Feature Coming Soon</h2>
                <p className="mt-2 text-slate-600 max-w-md mx-auto">
                    Soon you'll be able to book new appointments with doctors and view your appointment history right here.
                </p>
            </div>
        </div>
    );
};

export default PatientAppointmentsPage;
