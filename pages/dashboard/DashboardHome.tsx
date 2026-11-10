import React, { useState, useEffect } from 'react';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { StethoscopeIcon } from '../../components/icons/StethoscopeIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { BillingIcon } from '../../components/icons/BillingIcon';
import { db, auth } from '../../firebase';
import { Appointment, AppointmentStatus, Patient, PatientStatus, Invoice } from '../../types';
import { todayLocalISO, formatLocalDate } from '../../utils/date';
import { formatMoney } from '../../utils/format';

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
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [totalDoctors, setTotalDoctors] = useState<number>(0);
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const [appointmentsToday, setAppointmentsToday] = useState<number>(0);
    const [revenueThisMonth, setRevenueThisMonth] = useState<number>(0);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [recentAdmissions, setRecentAdmissions] = useState<Patient[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) setHospitalId(user.uid);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!hospitalId) return;

        const fetchData = async () => {
            try {
                const today = todayLocalISO(); // local day, not UTC
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                // Fetch data individually but concurrently to prevent one failure from breaking everything
                const doctorsPromise = db.collection('users').doc(hospitalId).collection('doctors').get();
                const patientsPromise = db.collection('users').doc(hospitalId).collection('patients').get();
                const appsPromise = db.collection('users').doc(hospitalId).collection('appointments').where('date', '==', today).get();
                // Removed .orderBy('time') to avoid requiring a composite index which causes the query to fail
                const allAppsPromise = db.collection('users').doc(hospitalId).collection('appointments').where('date', '>=', today).orderBy('date').limit(20).get();
                const invoicesPromise = db.collection('users').doc(hospitalId).collection('invoices').get();

                try {
                    const doctorsSnap = await doctorsPromise;
                    setTotalDoctors(doctorsSnap.size);
                } catch (e) { console.error("Error fetching doctors:", e); }

                try {
                    const patientsSnap = await patientsPromise;
                    setTotalPatients(patientsSnap.size);
                    const patientsData = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
                    const recent = patientsData
                        .filter(p => p.status === PatientStatus.Admitted)
                        .sort((a, b) => new Date(b.admittedDate).getTime() - new Date(a.admittedDate).getTime())
                        .slice(0, 5);
                    setRecentAdmissions(recent);
                } catch (e) { console.error("Error fetching patients:", e); }

                try {
                    const appsSnap = await appsPromise;
                    setAppointmentsToday(appsSnap.docs.filter(d => d.data().status !== AppointmentStatus.Cancelled).length);
                } catch (e) { console.error("Error fetching today's apps:", e); }

                try {
                    const allAppsSnap = await allAppsPromise;
                    const appsData = allAppsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
                    // Cancelled/completed visits are not "upcoming".
                    setUpcomingAppointments(
                        appsData
                            .filter(a => a.status === AppointmentStatus.Scheduled || a.status === AppointmentStatus.Confirmed)
                            .slice(0, 5)
                    );
                } catch (e) { console.error("Error fetching upcoming apps:", e); }

                try {
                    const invoicesSnap = await invoicesPromise;
                    let revenue = 0;
                    invoicesSnap.forEach(doc => {
                        const inv = doc.data() as Invoice;
                        const invDate = new Date(inv.date);
                        if (inv.status === 'Paid' && invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
                            revenue += inv.totalAmount;
                        }
                    });
                    setRevenueThisMonth(revenue);
                } catch (e) { console.error("Error fetching invoices:", e); }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, [hospitalId]);

    const getPatientStatusColor = (status: PatientStatus) => {
        switch (status) {
            case PatientStatus.Admitted: return 'bg-green-100 text-green-800';
            case PatientStatus.Discharged: return 'bg-slate-200 text-slate-800';
            case PatientStatus.In_Treatment: return 'bg-blue-100 text-blue-800';
            case PatientStatus.Observation: return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Doctors" value={totalDoctors.toString()} icon={<StethoscopeIcon className="h-6 w-6 text-white" />} color="bg-blue-500" />
                <StatCard title="Total Patients" value={totalPatients.toString()} icon={<UsersIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
                <StatCard title="Appointments Today" value={appointmentsToday.toString()} icon={<CalendarIcon className="h-6 w-6 text-white" />} color="bg-amber-500" />
                <StatCard title="Revenue (This Month)" value={formatMoney(revenueThisMonth)} icon={<BillingIcon className="h-6 w-6 text-white" />} color="bg-primary-500" />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Appointments */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-slate-500">No upcoming appointments.</p>
                    ) : (
                        <ul className="space-y-4">
                            {upcomingAppointments.map(app => (
                                <li key={app.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-700">{app.patientName} with {app.doctorName}</p>
                                        <p className="text-sm text-slate-500">{formatLocalDate(app.date)} at {app.time}</p>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{app.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Patient Admissions */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Admissions</h2>
                    {recentAdmissions.length === 0 ? (
                        <p className="text-slate-500">No recent admissions.</p>
                    ) : (
                        <ul className="space-y-4">
                            {recentAdmissions.map(patient => (
                                <li key={patient.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-700">{patient.name}</p>
                                        <p className="text-sm text-slate-500">Admitted on {formatLocalDate(patient.admittedDate)}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPatientStatusColor(patient.status)}`}>{patient.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
