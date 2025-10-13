import React, { useState, useEffect, useCallback } from 'react';
import { db, auth, storage } from '../../../firebase';
import { Patient } from '../../../types';
import { UserCircleIcon } from '../../../components/icons/UserCircleIcon';
import { UploadIcon } from '../../../components/icons/UploadIcon';
import firebase from 'firebase/compat/app';

const PatientProfilePage: React.FC = () => {
    const [patientData, setPatientData] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);
        } else {
            setError('You must be logged in to view this page.');
            setIsLoading(false);
        }
    }, []);

    const fetchPatientData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const docRef = db.collection('patients').doc(currentUser.uid);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = { id: doc.id, ...doc.data() } as Patient;
                setPatientData(data);
                setImagePreview(data.profilePictureUrl || null);
            } else {
                setError('Patient record not found.');
            }
        } catch (err) {
            setError('Failed to fetch patient data.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);
    
    useEffect(() => {
        if(currentUser) {
            fetchPatientData();
        }
    }, [currentUser, fetchPatientData]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if(patientData) {
            setPatientData({
                ...patientData,
                [name]: name === 'age' || name === 'weight' ? Number(value) : value
            });
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientData || !currentUser) {
            setError('No patient data to save.');
            return;
        }
        setIsSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const docRef = db.collection('patients').doc(currentUser.uid);
            // Create a partial object to avoid overwriting fields not in the form
            let updatedData: Partial<Patient> = {
                name: patientData.name,
                age: patientData.age,
                gender: patientData.gender,
                weight: patientData.weight || 0,
            };
            
            if (imageFile) {
                const storageRef = storage.ref(`profile_pictures/${currentUser.uid}/${imageFile.name}`);
                const snapshot = await storageRef.put(imageFile);
                const downloadURL = await snapshot.ref.getDownloadURL();
                updatedData.profilePictureUrl = downloadURL;
            }
            
            await docRef.update(updatedData);
            setSuccess('Profile updated successfully!');
            // After successful save, refetch data to get the latest state
            fetchPatientData();

        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading profile...</div>;
    if (error && !patientData) return <div className="text-red-500">{error}</div>;
    if (!patientData) return <div>No patient data found.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Profile</h1>
            <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="space-y-6">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {imagePreview ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-slate-400"/>}
                        </div>
                        <div className="flex flex-col gap-2">
                             <label htmlFor="imageUpload" className="cursor-pointer text-sm font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full text-center flex items-center gap-2">
                              <UploadIcon className="h-4 w-4" />
                              Upload Photo
                            </label>
                            <input type="file" id="imageUpload" onChange={handleImageChange} accept="image/png, image/jpeg" className="hidden"/>
                            <p className="text-xs text-slate-500">PNG or JPG, max 2MB.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label htmlFor="name" className="font-semibold text-slate-700 block mb-1.5">Full Name</label>
                              <input type="text" id="name" name="name" value={patientData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                          </div>
                          <div>
                              <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email</label>
                              <input type="email" id="email" name="email" value={patientData.email || ''} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 transition cursor-not-allowed" disabled readOnly />
                          </div>
                          <div>
                              <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone</label>
                              <input type="tel" id="phone" name="phone" value={patientData.phone} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 transition cursor-not-allowed" disabled readOnly />
                          </div>
                          <div>
                              <label htmlFor="age" className="font-semibold text-slate-700 block mb-1.5">Age</label>
                              <input type="number" id="age" name="age" value={patientData.age} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                          </div>
                          <div>
                              <label htmlFor="gender" className="font-semibold text-slate-700 block mb-1.5">Gender</label>
                               <select id="gender" name="gender" value={patientData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                          </div>
                          <div>
                              <label htmlFor="weight" className="font-semibold text-slate-700 block mb-1.5">Weight (kg)</label>
                              <input type="number" step="0.1" id="weight" name="weight" value={patientData.weight || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
                          </div>
                      </div>
                      
                      <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
                        {success && <p className="text-green-600 text-sm font-semibold mr-auto">{success}</p>}
                        {error && !success && <p className="text-red-600 text-sm font-semibold mr-auto">{error}</p>}
                         <button type="submit" disabled={isSaving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>

                </form>
            </div>
        </div>
    );
};

export default PatientProfilePage;
