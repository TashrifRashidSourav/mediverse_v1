import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';

interface TemplateProps {
  hospital: User;
}

const GoldenTemplate: React.FC<TemplateProps> = ({ hospital }) => {
  const specialists = [
    { name: 'Dr. Jane Doe', title: 'Chief of Cardiology', img: 'https://picsum.photos/seed/doctor1/400/400' },
    { name: 'Dr. John Smith', title: 'Head of Neurology', img: 'https://picsum.photos/seed/doctor2/400/400' },
    { name: 'Dr. Emily White', title: 'Lead Pediatrician', img: 'https://picsum.photos/seed/doctor3/400/400' },
  ];

  return (
    <div className="bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MedicalIcon className="h-9 w-9 text-amber-500" />
            <span className="text-3xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#specialists" className="font-bold text-slate-700 hover:text-amber-600 text-lg">Our Specialists</a>
            <a href="#testimonials" className="font-bold text-slate-700 hover:text-amber-600 text-lg">Testimonials</a>
            <Link to="/login" className="bg-amber-500 text-white font-bold px-5 py-2.5 rounded-full hover:bg-amber-600 transition-transform hover:scale-105">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-[600px] bg-gray-300">
        <img src="https://picsum.photos/seed/golden-hero/1800/1000" alt="Modern hospital interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        <div className="relative text-left px-12 text-white max-w-3xl">
          <h1 className="text-6xl font-extrabold leading-tight">Pioneering the Future of Medicine</h1>
          <p className="mt-6 text-2xl text-slate-200">At {hospital.hospitalName}, we combine cutting-edge technology with world-class expertise.</p>
          <a href="#" className="mt-10 inline-block bg-amber-500 text-white font-bold text-xl px-10 py-4 rounded-full hover:bg-amber-600 transition-transform hover:scale-105">Book an Appointment</a>
        </div>
      </section>

      {/* Main Content */}
      <main>
        {/* Specialists Section */}
        <section id="specialists" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-bold text-slate-800 text-center mb-16">Meet Our Specialists</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {specialists.map(doc => (
                <div key={doc.name} className="text-center">
                  <img src={doc.img} alt={doc.name} className="w-48 h-48 rounded-full mx-auto shadow-xl mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-amber-600 font-semibold">{doc.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-bold text-slate-800 text-center mb-16">What Our Patients Say</h2>
            <div className="max-w-4xl mx-auto space-y-12">
              <blockquote className="text-center">
                <p className="text-2xl italic text-slate-700">"{hospital.hospitalName} provided the best care I have ever received. The staff was incredibly attentive and professional."</p>
                <cite className="inline-block mt-4 font-bold text-slate-900 text-lg">- Patient A</cite>
              </blockquote>
               <blockquote className="text-center">
                <p className="text-2xl italic text-slate-700">"From diagnosis to recovery, my experience was seamless. I highly recommend their specialists."</p>
                <cite className="inline-block mt-4 font-bold text-slate-900 text-lg">- Patient B</cite>
              </blockquote>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-slate-300">
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-lg">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
          <p className="text-md text-slate-400 mt-2">A new standard in healthcare. | Powered by Mediverse</p>
        </div>
      </footer>
    </div>
  );
};

export default GoldenTemplate;