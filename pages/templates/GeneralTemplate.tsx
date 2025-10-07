import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';

interface TemplateProps {
  hospital: User;
}

const GeneralTemplate: React.FC<TemplateProps> = ({ hospital }) => {
  return (
    <div className="bg-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MedicalIcon className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </div>
          <nav>
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Welcome Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Welcome to {hospital.hospitalName}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">Your trusted partner in health. Providing compassionate care for our community.</p>
        </section>

        {/* About Us Section */}
        <section className="mt-20">
          <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">About Our Hospital</h2>
            <p className="text-slate-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="mt-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Our Services</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
                <div className="bg-slate-50 p-6 rounded-lg">Emergency Care</div>
                <div className="bg-slate-50 p-6 rounded-lg">Cardiology</div>
                <div className="bg-slate-50 p-6 rounded-lg">Orthopedics</div>
                <div className="bg-slate-50 p-6 rounded-lg">Pediatrics</div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 mt-20">
        <div className="container mx-auto px-6 py-8 text-center">
          <p>&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-2">Powered by Mediverse</p>
        </div>
      </footer>
    </div>
  );
};

export default GeneralTemplate;