import React, { useState } from 'react';
import { Doctor } from '../../types';

// Mock data for demonstration
const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. John Smith', specialization: 'Cardiology', phone: '123-456-7890', email: 'john.smith@mediverse.app' },
  { id: '2', name: 'Dr. Emily White', specialization: 'Pediatrics', phone: '234-567-8901', email: 'emily.white@mediverse.app' },
  { id: '3', name: 'Dr. Michael Brown', specialization: 'Neurology', phone: '345-678-9012', email: 'michael.brown@mediverse.app' },
];

const DoctorManagement: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Doctor Management</h1>
                <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    Add Doctor
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Specialization</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Contact</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{doctor.name}</td>
                                    <td className="p-4 text-slate-600">{doctor.specialization}</td>
                                    <td className="p-4 text-slate-600">
                                        <div>{doctor.phone}</div>
                                        <div className="text-xs text-slate-500">{doctor.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                                            <button className="text-red-600 hover:underline text-sm font-semibold">Delete</button>
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

export default DoctorManagement;
