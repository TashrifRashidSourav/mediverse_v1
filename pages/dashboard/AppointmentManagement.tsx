import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';

const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'John Doe', doctorName: 'Dr. Smith', date: new Date('2023-11-10').toISOString(), time: '10:30 AM', status: AppointmentStatus.Scheduled },
  { id: '2', patientName: 'Jane Roe', doctorName: 'Dr. White', date: new Date('2023-11-10').toISOString(), time: '11:00 AM', status: AppointmentStatus.Scheduled },
  { id: '3', patientName: 'Peter Jones', doctorName: 'Dr. Brown', date: new Date('2023-11-09').toISOString(), time: '02:00 PM', status: AppointmentStatus.Completed },
  { id: '4', patientName: 'Emily Clark', doctorName: 'Dr. White', date: new Date('2023-11-08').toISOString(), time: '09:00 AM', status: AppointmentStatus.Cancelled },
];

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    const statusClasses = {
        [AppointmentStatus.Scheduled]: 'bg-amber-100 text-amber-800',
        [AppointmentStatus.Completed]: 'bg-green-100 text-green-800',
        [AppointmentStatus.Cancelled]: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Appointment Management</h1>
            <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                New Appointment
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-600">Patient</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Doctor</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Date & Time</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{appt.patientName}</td>
                                <td className="p-4 text-slate-600">{appt.doctorName}</td>
                                <td className="p-4 text-slate-600">
                                    <div>{new Date(appt.date).toLocaleDateString()}</div>
                                    <div className="text-xs text-slate-500">{appt.time}</div>
                                </td>
                                <td className="p-4"><StatusBadge status={appt.status} /></td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {appt.status === AppointmentStatus.Scheduled && (
                                            <>
                                                <button className="text-green-600 hover:underline text-sm font-semibold">Complete</button>
                                                <button className="text-red-600 hover:underline text-sm font-semibold">Cancel</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AppointmentManagement;
