import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { XIcon } from '../icons/XIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Omit<Doctor, 'id'>, imageFile: File | null) => void;
  doctor: Doctor | null; // Pass doctor data for editing
}

const DoctorModal: React.FC<DoctorModalProps> = ({ isOpen, onClose, onSave, doctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualifications: '',
    phone: '',
    email: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      });
      setImagePreview(doctor.imageUrl || null);
    } else {
      // Reset form for 'Add New'
      setFormData({
        name: '',
        specialization: '',
        qualifications: '',
        phone: '',
        email: '',
        imageUrl: '',
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [doctor, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData, imageFile);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-slate-900">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-4">
                {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                    <UserCircleIcon className="h-20 w-20 text-slate-300" />
                )}
                <div className="flex items-center gap-3">
                  <label htmlFor="imageUpload" className="cursor-pointer bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 text-sm">
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview && (
                    <button type="button" onClick={handleRemoveImage} className="text-sm text-red-600 hover:underline">
                        Remove
                    </button>
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
                <label htmlFor="qualifications" className="font-semibold text-slate-700 block mb-1.5">Qualifications*</label>
                <input type="text" id="qualifications" name="qualifications" value={formData.qualifications} placeholder="e.g., MD, FACS" onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number*</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
                </div>
                <div>
                  <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address*</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 transition" required />
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