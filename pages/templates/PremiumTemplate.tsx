import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';

interface TemplateProps {
  hospital: User;
}

const PremiumTemplate: React.FC<TemplateProps> = ({ hospital }) => {
  return (
    <div className="bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MedicalIcon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#departments" className="font-semibold text-slate-600 hover:text-blue-600">Departments</a>
            <a href="#contact" className="font-semibold text-slate-600 hover:text-blue-600">Contact</a>
            <Link to="/login" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-400">
        <img src="https://picsum.photos/seed/premium-hero/1600/800" alt="Hospital building" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-extrabold">Excellence in Healthcare</h1>
            <p className="mt-4 text-xl">Welcome to {hospital.hospitalName}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        {/* Departments Section */}
        <section id="departments">
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Our Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Radiology', 'General Surgery'].map(dept => (
              <div key={dept} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                <h3 className="text-2xl font-bold text-slate-900">{dept}</h3>
                <p className="mt-2 text-slate-600">Advanced care with state-of-the-art technology and expert specialists.</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-24 bg-white p-12 rounded-xl shadow-lg">
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-8">Get In Touch</h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            We are here for you. Contact us for appointments, inquiries, or emergencies. Our team is available 24/7 to assist you.
          </p>
           <div className="text-center mt-8">
                <a href="#" className="bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">Contact Us Now</a>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6 py-10 text-center">
          <p>&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-2">Powered by Mediverse</p>
        </div>
      </footer>
    </div>
  );
};

export default PremiumTemplate;