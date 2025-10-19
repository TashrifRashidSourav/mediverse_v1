import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MedicalIcon } from '../components/icons/MedicalIcon';

const HospitalListPage: React.FC = () => {
    const [hospitals, setHospitals] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHospitals = async () => {
            setIsLoading(true);
            try {
                // Fetch all users and filter client-side to include older accounts without a status field.
                // This matches the login logic but can be inefficient at scale.
                const snapshot = await db.collection('users').get();
                
                const hospitalData = snapshot.docs
                    .map(doc => ({ uid: doc.id, ...doc.data() } as User))
                    // IMPORTANT: Show hospitals that are 'approved' OR have no status field (for legacy compatibility)
                    .filter(user => user.status === 'approved' || !user.status);

                // Perform sorting on the client-side.
                hospitalData.sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));

                setHospitals(hospitalData);
            } catch (error) {
                console.error("Error fetching hospitals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="container mx-auto px-6 py-12 md:py-20">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Our Network of Hospitals</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Browse our directory of trusted healthcare providers. Each hospital is dedicated to providing excellent patient care.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">Loading hospitals...</div>
                ) : hospitals.length === 0 ? (
                    <div className="text-center py-20">
                        <MedicalIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700">No Approved Hospitals Found</h2>
                        <p className="text-slate-500 mt-2">There are currently no active hospitals to display in the directory.</p>
                    </div>
                ) : (
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {hospitals.map(hospital => (
                            <div key={hospital.uid} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="h-40 bg-slate-200 flex items-center justify-center p-4">
                                    {hospital.logoUrl ? (
                                        <img src={hospital.logoUrl} alt={`${hospital.hospitalName} Logo`} className="max-h-24 object-contain"/>
                                    ) : (
                                        <MedicalIcon className="h-16 w-16 text-primary/50" />
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold text-slate-800">{hospital.hospitalName}</h2>
                                    <p className="text-slate-500 mt-1 flex-grow">{hospital.location || 'Location not specified'}</p>
                                    <a
                                        href={`/#/${hospital.subdomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-6 w-full block text-center bg-primary-100 text-primary font-bold py-2.5 px-4 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300"
                                    >
                                        Visit Website
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default HospitalListPage;