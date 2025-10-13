import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db, auth } from '../../firebase';
import { Patient } from '../../types';

const PatientSignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        gender: 'Other' as 'Male' | 'Female' | 'Other',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsSubmitting(true);
        
        try {
            // 1. Create Firebase Auth user
            const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
            const createdUser = userCredential.user;
            if (!createdUser) {
                throw new Error("Failed to create user account.");
            }

            // 2. Create the patient profile in the global /patients collection
            const newPatientProfile: Omit<Patient, 'id' | 'admittedDate' | 'status'> = {
                authUid: createdUser.uid,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                age: Number(formData.age),
                gender: formData.gender,
                profilePictureUrl: '', // Default empty
                weight: 0,
            };

            // This write is critical. The previous code tried to clean this up if it failed,
            // but that caused authentication errors. Removing the cleanup is the direct fix.
            await db.collection('patients').doc(createdUser.uid).set(newPatientProfile);
            
            setSuccess(true);

        } catch (err: any) {
             console.error("[Patient Signup Error]", err);
            // We can't easily clean up the auth user if the DB write fails without causing other errors.
            // So we just report the error to the user.
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email address already exists.');
            } else {
                setError(err.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <MedicalIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Create Your Patient Account</h1>
                    <p className="text-slate-600">Your universal profile for all Mediverse hospitals.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {success ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-primary mb-4">Registration Successful!</h2>
                            <p className="text-slate-600 mb-6">Your account has been created. You can now log in.</p>
                            <button onClick={() => navigate('/patient/login')} className="block w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="font-semibold text-slate-700 block mb-1.5">Full Name*</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number*</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                                </div>
                                <div>
                                    <label htmlFor="age" className="font-semibold text-slate-700 block mb-1.5">Age*</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="font-semibold text-slate-700 block mb-1.5">Gender*</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address*</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                            </div>
                            <div>
                                <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Create Password*</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="font-semibold text-slate-700 block mb-1.5">Confirm Password*</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary" required />
                            </div>

                            {error && <p className="text-red-600 text-sm">{error}</p>}

                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-opacity disabled:bg-primary-300 mt-6">
                                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientSignUpPage;