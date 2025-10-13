import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from './icons/XIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { UserIcon } from './icons/UserIcon';

interface LoginOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginOptionsModal: React.FC<LoginOptionsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <XIcon className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 text-center">Log In to Mediverse</h2>
          <p className="text-center text-slate-500 mt-2">Please select your role to continue.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleNavigate('/login')}
              className="group flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border-2 border-transparent hover:border-primary hover:bg-primary-50 transition-all"
            >
              <BuildingOfficeIcon className="h-12 w-12 text-slate-500 group-hover:text-primary transition-colors" />
              <span className="mt-4 text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">Hospital Manager</span>
            </button>
            <button
              onClick={() => handleNavigate('/patient/login')}
              className="group flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border-2 border-transparent hover:border-primary hover:bg-primary-50 transition-all"
            >
              <UserIcon className="h-12 w-12 text-slate-500 group-hover:text-primary transition-colors" />
              <span className="mt-4 text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOptionsModal;
