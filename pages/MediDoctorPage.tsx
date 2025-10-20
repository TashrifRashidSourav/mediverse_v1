import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { AdvertisedDoctor, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';

const MediDoctorPage: React.FC = () => {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/patient/dashboard');

    const [allDoctors, setAllDoctors] = useState<AdvertisedDoctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<AdvertisedDoctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalSearch, setHospitalSearch] = useState('');
    const [specializationSearch, setSpecializationSearch] = useState('');


    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            try {
                // Fetch all users and filter client-side to find approved hospitals
                const snapshot = await db.collection('users').get();
                const allAdvertisedDoctors: AdvertisedDoctor[] = [];

                const approvedHospitals = snapshot.docs.filter(doc => {
                    const data = doc.data() as User;
                    // Show hospitals that are 'approved' OR have no status field (for legacy compatibility)
                    return data.status === 'approved' || !data.status;
                });

                approvedHospitals.forEach(doc => {
                    const hospital = doc.data() as User;
                    if (hospital.advertisedDoctors && Array.isArray(hospital.advertisedDoctors)) {
                        const doctorsFromHospital = hospital.advertisedDoctors.map(ad => ({
                            ...ad,
                            hospitalId: doc.id,
                            hospitalName: hospital.hospitalName,
                            subdomain: hospital.subdomain,
                        }));
                        allAdvertisedDoctors.push(...doctorsFromHospital);
                    }
                });
                
                // Robust sorting for different date/timestamp formats
                const getTime = (date: any): number => {
                    if (!date) return 0;
                    if (typeof date.toMillis === 'function') return date.toMillis(); // Firestore Timestamp
                    if (date instanceof Date) return date.getTime(); // JS Date object
                    const parsed = new Date(date).getTime(); // String or other parsable format
                    return isNaN(parsed) ? 0 : parsed;
                };

                allAdvertisedDoctors.sort((a, b) => getTime(b.advertisedAt) - getTime(a.advertisedAt));
                
                setAllDoctors(allAdvertisedDoctors);
                setFilteredDoctors(allAdvertisedDoctors);

            } catch (error) {
                console.error("Error fetching advertised doctors:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        let result = allDoctors;

        if (hospitalSearch) {
            result = result.filter(doctor =>
                doctor.hospitalName.toLowerCase().includes(hospitalSearch.toLowerCase())
            );
        }

        if (specializationSearch) {
            result = result.filter(doctor =>
                doctor.specialization.toLowerCase().includes(specializationSearch.toLowerCase())
            );
        }

        setFilteredDoctors(result);
    }, [hospitalSearch, specializationSearch, allDoctors]);

    const content = (
        <>
            <div className={isDashboard ? "" : "text-center max-w-3xl mx-auto"}>
                <h1 className={isDashboard ? "text-3xl font-bold text-slate-900 mb-6" : "text-4xl md:text-5xl font-extrabold text-slate-900"}>
                    Find a Specialist
                </h1>
                <p className={isDashboard ? "text-slate-600" : "mt-4 text-lg text-slate-600"}>
                    Discover and book appointments with leading doctors from our network of partner hospitals.
                </p>
            </div>

            {/* Search Filters */}
            <div className={isDashboard ? "mb-8 bg-white p-6 rounded-xl shadow-md" : "mt-12 mb-10 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md"}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="hospitalSearch" className="block text-sm font-medium text-slate-700">Hospital Name</label>
                        <input
                            type="text"
                            id="hospitalSearch"
                            value={hospitalSearch}
                            onChange={(e) => setHospitalSearch(e.target.value)}
                            placeholder="Search by hospital..."
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="specializationSearch" className="block text-sm font-medium text-slate-700">Specialization</label>
                        <input
                            type="text"
                            id="specializationSearch"
                            value={specializationSearch}
                            onChange={(e) => setSpecializationSearch(e.target.value)}
                            placeholder="e.g., Cardiology, Dermatology"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="md:col-span-1">
                            <button
                            onClick={() => {
                                setHospitalSearch('');
                                setSpecializationSearch('');
                            }}
                            className="w-full bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>


            {isLoading ? (
                <div className="text-center py-20">Loading doctors...</div>
            ) : allDoctors.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-600">No doctors are currently being featured. Please check back later.</p>
                </div>
            ): filteredDoctors.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-600">No doctors found matching your search criteria.</p>
                </div>
            ) : (
                <div className={isDashboard ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"}>
                    {filteredDoctors.map(doctor => (
                        <div key={`${doctor.hospitalId}-${doctor.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="h-56 bg-slate-200">
                                {doctor.imageUrl ? (
                                    <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserCircleIcon className="w-24 h-24 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                                <p className="text-primary font-semibold">{doctor.specialization}</p>
                                <p className="text-sm text-slate-500 mt-1">{doctor.qualifications}</p>
                                <div className="mt-4 border-t pt-3 text-sm">
                                    <p className="text-slate-600">
                                        Practicing at <a href={`/#/${doctor.subdomain}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 hover:text-primary">{doctor.hospitalName}</a>
                                    </p>
                                    {doctor.experience && <p className="text-slate-600">Experience: {doctor.experience}</p>}
                                </div>
                                <div className="mt-auto pt-4">
                                    <Link
                                        to={`/${doctor.subdomain}/book-appointment`}
                                        className="w-full block text-center bg-primary text-white font-bold py-2.5 px-4 rounded-lg group-hover:bg-primary-700 transition-colors duration-300"
                                    >
                                        Book Appointment
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    if (isDashboard) {
        return <div>{content}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="container mx-auto px-6 py-12 md:py-20">
                {content}
            </main>
            <Footer />
        </div>
    );
};

export default MediDoctorPage;