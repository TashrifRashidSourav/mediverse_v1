

import React, { useState, useEffect, useCallback } from 'react';
import { type Plan, type SignUpFormData } from '../types';
import { XIcon } from './icons/XIcon';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, plan }) => {
  // FIX: Added 'password' to satisfy the SignUpFormData type.
  const [formData, setFormData] = useState<SignUpFormData>({
    hospitalName: '',
    location: '',
    registrationNumber: '',
    phone: '',
    email: '',
    subdomain: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'hospitalName') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName || !formData.location || !formData.registrationNumber || !formData.email) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Simulate an API call to a backend service like Firebase
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure
    if (formData.email.includes('error')) {
         setError('An account with this email already exists.');
         setIsSubmitting(false);
    } else {
        setSubmissionSuccess(true);
        setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animationFillMode: 'forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div className="p-8 relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <XIcon className="h-6 w-6" />
          </button>

          {submissionSuccess ? (
             <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-primary mb-4">Congratulations!</h2>
                <p className="text-slate-600 mb-6">Your hospital website is ready to go.</p>
                <div className="bg-slate-100 p-4 rounded-lg inline-block">
                    <p className="text-slate-700">You can access your new site at:</p>
                    <a 
                        href={`https://${formData.subdomain}.mediverse.app`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-lg font-bold text-primary hover:underline"
                    >
                        {formData.subdomain}.mediverse.app
                    </a>
                </div>
                <button onClick={onClose} className="mt-8 w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
                    Done
                </button>
             </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900">Create Your Account</h2>
              <p className="text-slate-500 mt-2">
                You've selected the <span className="font-bold text-primary">{plan.tier}</span> plan. Let's get you set up.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label htmlFor="hospitalName" className="font-semibold text-slate-700 block mb-1.5">Hospital Name*</label>
                      <input type="text" id="hospitalName" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                   </div>
                   <div>
                      <label htmlFor="subdomain" className="font-semibold text-slate-700 block mb-1.5">Your Website URL</label>
                      <div className="flex items-center">
                        <input type="text" id="subdomain" name="subdomain" value={formData.subdomain} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" />
                        <span className="px-4 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500">.mediverse.app</span>
                      </div>
                   </div>
                </div>
                 <div>
                    <label htmlFor="location" className="font-semibold text-slate-700 block mb-1.5">Location (City, Country)*</label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="registrationNumber" className="font-semibold text-slate-700 block mb-1.5">Hospital Registration Number*</label>
                    <input type="text" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="font-semibold text-slate-700 block mb-1.5">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" />
                  </div>
                </div>
                <div>
                    <label htmlFor="email" className="font-semibold text-slate-700 block mb-1.5">Email Address*</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                 </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Your Site...
                    </>
                  ) : `Create My Website for $${plan.price}/mo`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;