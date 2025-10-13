import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db, auth } from '../../firebase';
import { Patient } from '../../types';

const PatientLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user) {
                // Check if a patient profile exists in the global collection
                const patientDoc = await db.collection('patients').doc(user.uid).get();

                if (!patientDoc.exists) {
                    await auth.signOut();
                    setError("No patient profile found for this account.");
                } else {
                    const patientData = patientDoc.data() as Patient;
                    localStorage.setItem('patientProfile', JSON.stringify({
                        uid: user.uid,
                        name: patientData.name,
                        profilePictureUrl: patientData.profilePictureUrl || ''
                    }));
                    navigate(`/patient/dashboard`);
                }
            }
        } catch (err: any) {
             setError('Invalid email or password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <MedicalIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Patient Portal Login</h1>
                    <p className="text-slate-600">Access your universal Mediverse account.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Sign In</h2>
                     <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary transition" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary transition" required />
                        </div>

                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-opacity disabled:bg-primary-300">
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                     <p className="text-center text-slate-600 mt-6 text-sm">
                        Don't have an account?{' '}
                        <Link to="/patient/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
                 <p className="text-center text-xs text-slate-500 mt-4">
                    <Link to="/" className="hover:underline">Powered by Mediverse</Link>
                </p>
            </div>
        </div>
    );
};

export default PatientLoginPage;
