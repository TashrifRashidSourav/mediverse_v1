import React, { useState } from 'react';
import { Patient, PatientStatus } from '../../types';

const mockPatients: Patient[] = [
    { id: '1', name: 'John Doe', age: 45, gender: 'Male', status: PatientStatus.Admitted, admittedDate: new Date('2023-10-25').toISOString() },
    { id: '2', name: 'Jane Roe', age: 32, gender: 'Female', status: PatientStatus.Discharged, admittedDate: new Date('2023-10-22').toISOString() },
    { id: '3', name: 'Peter Jones', age: 67, gender: 'Male', status: PatientStatus.Admitted, admittedDate: new Date('2023-10-26').toISOString() },
    { id: '4', name: 'Emily Clark', age: 28, gender: 'Female', status: PatientStatus.Outpatient, admittedDate: new Date('2023-10-26').toISOString() },
];

const StatusBadge: React.FC<{ status: PatientStatus }> = ({ status }) => {
    const statusClasses = {
        [PatientStatus.Admitted]: 'bg-green-100 text-green-800',
        [PatientStatus.Discharged]: 'bg-slate-200 text-slate-800',
        [PatientStatus.Outpatient]: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const PatientManagement: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>(mockPatients);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
                <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                    Add Patient
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Age</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Gender</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Admitted On</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{patient.name}</td>
                                    <td className="p-4 text-slate-600">{patient.age}</td>
                                    <td className="p-4 text-slate-600">{patient.gender}</td>
                                    <td className="p-4"><StatusBadge status={patient.status} /></td>
                                    <td className="p-4 text-slate-600">{new Date(patient.admittedDate).toLocaleDateString()}</td>
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

export default PatientManagement;
