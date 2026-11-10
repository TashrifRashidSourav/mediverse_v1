import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db, firebase } from '../firebase';
import { User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MedicalIcon } from '../components/icons/MedicalIcon';

const PAGE_SIZE = 12;

const HospitalListPage: React.FC = () => {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/patient/dashboard');
    
    const [hospitals, setHospitals] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const lastDocRef = useRef<firebase.firestore.QueryDocumentSnapshot | null>(null);

    const loadPage = useCallback(async (initial: boolean) => {
        initial ? setIsLoading(true) : setIsLoadingMore(true);
        try {
            // Filter on the server and page through results, instead of
            // downloading every hospital document and filtering in the browser.
            let query = db.collection('users')
                .where('status', '==', 'approved')
                .orderBy(firebase.firestore.FieldPath.documentId())
                .limit(PAGE_SIZE);
            if (!initial && lastDocRef.current) {
                query = query.startAfter(lastDocRef.current);
            }
            const snapshot = await query.get();
            const page = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));

            lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setHospitals(prev => {
                const merged = initial ? page : [...prev, ...page];
                return merged.sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
            });
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadPage(true);
    }, [loadPage]);

    const content = (
        <>
            <div className={isDashboard ? "" : "text-center max-w-3xl mx-auto"}>
                <h1 className={isDashboard ? "text-3xl font-bold text-slate-900 mb-6" : "text-4xl md:text-5xl font-extrabold text-slate-900"}>
                    Our Network of Hospitals
                </h1>
                <p className={isDashboard ? "text-slate-600 mb-8" : "mt-4 text-lg text-slate-600"}>
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
                <div className={isDashboard ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"}>
                    {hospitals.map(hospital => (
                        <div key={hospital.uid} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-40 bg-slate-200 flex items-center justify-center p-4">
                                {hospital.logoUrl ? (
                                    <img loading="lazy" decoding="async" src={hospital.logoUrl} alt={`${hospital.hospitalName} Logo`} className="max-h-24 object-contain"/>
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

            {hasMore && !isLoading && (
                <div className="text-center mt-10">
                    <button
                        onClick={() => loadPage(false)}
                        disabled={isLoadingMore}
                        className="bg-primary text-white font-bold py-2.5 px-8 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                    >
                        {isLoadingMore ? 'Loading...' : 'Load more hospitals'}
                    </button>
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

export default HospitalListPage;
