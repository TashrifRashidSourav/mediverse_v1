import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { SignUpFormData, User, PlanTier } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';

const PaymentSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [error, setError] = useState('');

    useEffect(() => {
        const processRegistration = async () => {
            const tranId = searchParams.get('tran_id');
            if (!tranId) {
                setError('Invalid transaction ID.');
                setStatus('error');
                return;
            }

            const storedData = localStorage.getItem(`signup_data_${tranId}`);
            if (!storedData) {
                // This can happen if user refreshes the page, or has already completed this step.
                // We assume success and show the message, but don't re-process.
                setStatus('success');
                return;
            }

            // Remove item immediately to prevent re-processing
            localStorage.removeItem(`signup_data_${tranId}`);
            const formData = JSON.parse(storedData) as SignUpFormData;
            const planTier = searchParams.get('plan') as PlanTier;

            if (!planTier) {
                 setError('Plan information is missing.');
                 setStatus('error');
                 return;
            }

            try {
                // Same logic as original SignUpPage
                const userCredential = await auth.createUserWithEmailAndPassword(
                    formData.email,
                    formData.password
                );
                const createdUser = userCredential.user;
                if (!createdUser) throw new Error("User creation failed.");

                const newUserProfile: User = {
                    uid: createdUser.uid,
                    email: formData.email,
                    hospitalName: formData.hospitalName,
                    subdomain: formData.subdomain,
                    plan: planTier,
                    status: 'pending',
                };
                await db.collection("users").doc(createdUser.uid).set(newUserProfile);
                await auth.signOut(); // Ensure user is not auto-logged in
                setStatus('success');

            } catch (err: any) {
                console.error("[Post-Payment Signup Error]", err);
                if (err.code === 'auth/email-already-in-use') {
                     setError("This email is already registered. If this was a mistake, please contact support.");
                } else {
                    setError("Failed to create your account after payment. Please contact support with your transaction ID.");
                }
                setStatus('error');
            }
        };

        processRegistration();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl text-center p-8 md:p-12">
                    {status === 'processing' && (
                        <>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Processing Your Registration...</h2>
                            <p className="text-slate-600">Please wait while we finalize your account setup.</p>
                            <div className="mt-4 animate-spin h-8 w-8 text-primary mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-primary mb-4">Payment Successful & Registration Submitted!</h2>
                            <p className="text-slate-600 mb-6">Thank you for your payment. Your account is now pending approval from our admin team. You will be notified via email once it's activated.</p>
                            <Link to="/" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">Back to Home</Link>
                        </>
                    )}
                    {status === 'error' && (
                         <>
                            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-red-600 mb-4">An Error Occurred</h2>
                            <p className="text-slate-600 mb-6">{error}</p>
                            <Link to="/#pricing" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">Try Again</Link>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentSuccessPage;
