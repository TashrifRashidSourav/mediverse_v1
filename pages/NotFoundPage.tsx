import React from 'react';
import { Link } from 'react-router-dom';
import { MedicalIcon } from '../components/icons/MedicalIcon';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <MedicalIcon className="h-16 w-16 text-primary-400 mb-4" />
        <h1 className="text-6xl font-extrabold text-slate-800">404</h1>
        <p className="text-2xl font-semibold text-slate-600 mt-2">Page Not Found</p>
        <p className="text-slate-500 mt-4 max-w-md">
            Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or the URL is incorrect.
        </p>
        <Link 
            to="/" 
            className="mt-8 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
        >
            Go Back to Mediverse Home
        </Link>
    </div>
  );
};

export default NotFoundPage;
