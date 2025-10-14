import React, { useState, useEffect } from 'react';
import { Doctor, Availability } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
const daysOfWeek: Availability['day'][] = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Omit<Doctor, 'id'>) => void;
  doctor: Doctor | null;
}

const imageResizer = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
  const [formData, setFormData] = useState<Omit<Doctor, 'id' | 'availability'>>({
    name: '',
    specialization: '',
    qualifications: '',
    phone: '',
    email: '',
    imageUrl: '',
    password: '',
    experience: '',
    fees: 0,
  });
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
        phone: doctor.phone,
        email: doctor.email,
        imageUrl: doctor.imageUrl || '',
        password: '', // Don't pre-fill password for security
        experience: doctor.experience || '',
        fees: doctor.fees || 0,
      });
      setAvailability(doctor.availability?.map(a => ({...a, id: a.id || generateId()})) || []);
      setImagePreview(doctor.imageUrl || null);
    } else {
      setFormData({
        name: '',
        specialization: '',
        qualifications: '',
        phone: '',
        email: '',
        imageUrl: '',
        password: '',
        experience: '',
        fees: 0,
      });
      setAvailability([]);
      setImagePreview(null);
    }
  }, [doctor, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'fees' ? Number(value) : value }));
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const resizedDataUrl = await imageResizer(file, 400, 400);
      setImagePreview(resizedDataUrl);
      setFormData(prev => ({...prev, imageUrl: resizedDataUrl}));
    }
  };
  
  const handleRemoveImage = () => {
      setImagePreview(null);
      setFormData(prev => ({...prev, imageUrl: ''}));
  };

  const handleAvailabilityChange = (id: string, field: keyof Availability, value: string) => {
    setAvailability(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  const addAvailabilitySlot = () => {
    setAvailability(prev => [...prev, { id: generateId(), day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeAvailabilitySlot = (id: string) => {
    setAvailability(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSave = { ...formData, availability };
    if (doctor && !formData.password) {
      delete dataToSave.password;
    }
    await onSave(dataToSave);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-slate-900">{doctor ? 'Edit Doctor Profile' : 'Add New Doctor'}</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {imagePreview ? <img src={imagePreview} alt="Doctor" className="w-full h-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-slate-400"/>}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="imageUpload" className="cursor-pointer text-sm font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full text-center">
                      Choose Photo
                    </label>
                    <input type="file" id="imageUpload" onChange={handleImageChange} accept="image/png, image/jpeg" className="hidden"/>
                    {imagePreview && (
                        <button type="button" onClick={handleRemoveImage} className="text-sm text-slate-500 hover:text-red-600">Remove Photo</button>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label htmlFor="name" className="font-semibold text-slate-700 block mb-1.5">Full Name*</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                 </div>
                 <div>
                    <label htmlFor="specialization" className="font-semibold text-slate-700 block mb-1.5">Specialization*</label>
                    <input type="text" id="specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                 </div>
              </div>
              <div>
                  <label htmlFor="qualifications" className="font-semibold text-slate-700 block mb-1.5">Qualifications (e.g., MBBS, MD)</label>
                  <input type="text" id="qualifications" name="qualifications" value={formData.qualifications} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                    <label htmlFor="experience" className="font-semibold text-slate-700 block mb-1.5">Experience (e.g., 5 years)</label>
                    <input type="text" id="experience" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
                 </div>
                 <div>
                    <label htmlFor="fees" className="font-semibold text-slate-700 block mb-1.5">Consultation Fee</label>
                    <input type="number" id="fees" name="fees" min="0" value={formData.fees} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" />
                </div>
                <div>
                  <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address* (for login)</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>
              </div>
               <div>
                  <label htmlFor="password" className="font-semibold text-slate-700 block mb-1.5">Password*</label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" placeholder={doctor ? "Leave blank to keep unchanged" : ""} required={!doctor} />
              </div>
              
              <div className="pt-4 border-t">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-700">Weekly Availability</h3>
                    <button type="button" onClick={addAvailabilitySlot} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700"><PlusIcon className="h-4 w-4"/> Add Slot</button>
                 </div>
                 <div className="space-y-2">
                    {availability.map(item => (
                       <div key={item.id} className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center">
                          <select value={item.day} onChange={(e) => handleAvailabilityChange(item.id, 'day', e.target.value)} className="sm:col-span-3 w-full px-3 py-2 border border-slate-300 rounded-lg">
                             {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                          </select>
                          <input type="time" value={item.startTime} onChange={(e) => handleAvailabilityChange(item.id, 'startTime', e.target.value)} className="sm:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                          <span className="text-center hidden sm:block">-</span>
                          <input type="time" value={item.endTime} onChange={(e) => handleAvailabilityChange(item.id, 'endTime', e.target.value)} className="sm:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                          <button type="button" onClick={() => removeAvailabilitySlot(item.id)} className="sm:col-span-1 text-red-500 hover:text-red-700 flex justify-center"><TrashIcon className="h-5 w-5"/></button>
                       </div>
                    ))}
                 </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorModal;
