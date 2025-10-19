import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, firebase } from '../../firebase';
import { Doctor, AdvertisedDoctor, Plan, PlanTier, User } from '../../types';
import PaymentPopup from '../../components/PaymentPopup';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';

const advertisementPlan: Plan = {
    tier: PlanTier.General, // This is just a placeholder
    price: 50,
    features: ['Advertise this doctor for one month on the public Medi-Doctor page.'],
    isRecommended: false,
    ctaText: 'Pay to Advertise'
};

const AdvertisePage: React.FC = () => {
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [advertisedDoctors, setAdvertisedDoctors] = useState<AdvertisedDoctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [hospitalProfile, setHospitalProfile] = useState<User | null>(null);

    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [doctorToAdvertise, setDoctorToAdvertise] = useState<Doctor | null>(null);

    const fetchData = useCallback(async (currentHospitalId: string) => {
        setIsLoading(true);
        try {
            const hospitalDoc = await db.collection('users').doc(currentHospitalId).get();
            if(hospitalDoc.exists) {
                const hospitalData = hospitalDoc.data() as User;
                setHospitalProfile(hospitalData);
                setAdvertisedDoctors(hospitalData.advertisedDoctors || []);
            }

            const doctorsSnapshot = await db.collection('users').doc(currentHospitalId).collection('doctors').get();
            setAllDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));

        } catch (error) {
            console.error("Error fetching advertising data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setHospitalId(user.uid);
            fetchData(user.uid);
        }
    }, [fetchData]);

    const handleAdvertiseClick = (doctor: Doctor) => {
        setDoctorToAdvertise(doctor);
        setIsPaymentPopupOpen(true);
    };

    const handlePaymentSuccess = async () => {
        if (!doctorToAdvertise || !hospitalId) return;

        // Create a clean object for the advertisement array.
        // This prevents storing sensitive (password) or complex nested data (availability)
        // that can cause issues with array operations in Firestore.
        const adDoctorData = {
            id: doctorToAdvertise.id,
            name: doctorToAdvertise.name,
            specialization: doctorToAdvertise.specialization,
            qualifications: doctorToAdvertise.qualifications,
            phone: doctorToAdvertise.phone,
            email: doctorToAdvertise.email,
            imageUrl: doctorToAdvertise.imageUrl || '',
            experience: doctorToAdvertise.experience || '',
            fees: doctorToAdvertise.fees || 0,
            advertisedAt: new Date(),
        };

        try {
            await db.collection('users').doc(hospitalId).update({
                advertisedDoctors: firebase.firestore.FieldValue.arrayUnion(adDoctorData)
            });

            setIsPaymentPopupOpen(false);
            setDoctorToAdvertise(null);
            fetchData(hospitalId); // Refresh data
        } catch (error) {
            console.error("Error advertising doctor:", error);
            alert("An error occurred while advertising the doctor. Please check the console for details.");
        }
    };

    const handleStopAdvertising = async (doctorId: string) => {
        if (!hospitalId || !hospitalProfile?.advertisedDoctors) return;

        if (window.confirm("Are you sure you want to stop advertising this doctor? They will be removed from the public directory immediately.")) {
            try {
                const adToRemove = hospitalProfile.advertisedDoctors.find(ad => ad.id === doctorId);
                if (adToRemove) {
                    await db.collection('users').doc(hospitalId).update({
                        advertisedDoctors: firebase.firestore.FieldValue.arrayRemove(adToRemove)
                    });
                    fetchData(hospitalId); // Refresh data
                }
            } catch (error) {
                console.error("Error stopping advertisement:", error);
                alert("An error occurred while stopping the advertisement. Please check the console for details.");
            }
        }
    };

    const advertisedIds = new Set(advertisedDoctors.map(d => d.id));
    const availableToAdvertise = allDoctors.filter(d => !advertisedIds.has(d.id));

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Advertise Your Doctors</h1>
            <p className="text-slate-600 mb-6">Feature your top specialists on our public "Medi-Doctor" page for just 50 BDT/month to attract more patients.</p>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Doctors available to advertise */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Available to Advertise</h2>
                        {availableToAdvertise.length > 0 ? (
                            <ul className="space-y-3">
                                {availableToAdvertise.map(doctor => (
                                    <li key={doctor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                                {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-6 w-6 text-slate-400 m-auto" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{doctor.name}</p>
                                                <p className="text-sm text-slate-500">{doctor.specialization}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAdvertiseClick(doctor)} className="bg-primary text-white font-semibold text-sm py-1.5 px-3 rounded-md hover:bg-primary-700 transition-colors">
                                            Advertise
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 text-center py-8">All your doctors are currently being advertised.</p>
                        )}
                    </div>

                    {/* Currently advertised doctors */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><MegaphoneIcon className="h-6 w-6 text-green-500" /> Currently Advertised</h2>
                        {advertisedDoctors.length > 0 ? (
                            <ul className="space-y-3">
                                {advertisedDoctors.map(doctor => (
                                    <li key={doctor.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                                {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-6 w-6 text-slate-400 m-auto" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{doctor.name}</p>
                                                <p className="text-sm text-green-700">{doctor.specialization}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleStopAdvertising(doctor.id)} className="bg-red-100 text-red-700 font-semibold text-sm py-1.5 px-3 rounded-md hover:bg-red-200 transition-colors">
                                            Stop
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 text-center py-8">You are not currently advertising any doctors.</p>
                        )}
                    </div>
                </div>
            )}
            
            <PaymentPopup 
                isOpen={isPaymentPopupOpen}
                onClose={() => setIsPaymentPopupOpen(false)}
                plan={advertisementPlan}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default AdvertisePage;