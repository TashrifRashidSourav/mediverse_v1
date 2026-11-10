

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type User, type SiteSettings, type Doctor } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';
import ChatWidget from '../../components/ChatWidget';

interface TemplateProps {
  hospital: User;
  page?: 'home' | 'about' | 'doctors' | 'contact';
}

const PremiumTemplate: React.FC<TemplateProps> = ({ hospital, page = 'home' }) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hospital.uid) return;
      try {
        const settingsPromise = db.collection('users').doc(hospital.uid).collection('settings').doc('site').get();
        // Performance fix: Limit doctors on the homepage to prevent slow loads for hospitals with many doctors.
        const doctorsPromise = db.collection('users').doc(hospital.uid).collection('doctors').orderBy('name').limit(9).get();
        
        const [settingsDoc, doctorsSnapshot] = await Promise.all([settingsPromise, doctorsPromise]);

        if (settingsDoc.exists) {
          setSettings(settingsDoc.data() as SiteSettings);
        }
        setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));

      } catch (error) {
        console.error("Error fetching premium site data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hospital.uid]);

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          </div>
      );
  }

  return (
    <>
    <div className="bg-slate-50 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row gap-3 justify-between items-center">
          <Link to={`/${hospital.subdomain}`} className="flex items-center gap-3">
            {settings.logoUrl ? (
                <img loading="lazy" decoding="async" src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 max-h-10 object-contain"/>
            ) : (
                <MedicalIcon className="h-8 w-8 text-blue-600" />
            )}
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to={`/${hospital.subdomain}`} className={`font-semibold ${page === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Home</Link>
            <Link to={`/${hospital.subdomain}/about`} className={`font-semibold ${page === 'about' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>About</Link>
            <Link to={`/${hospital.subdomain}/doctors`} className={`font-semibold ${page === 'doctors' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Our Doctors</Link>
            <Link to={`/${hospital.subdomain}/contact`} className={`font-semibold ${page === 'contact' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Contact</Link>
            <Link to={`/login`} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Only on Home */}
      {page === 'home' && (
          <section className="relative h-96 bg-gray-400">
            <img src={settings.heroImageUrl || "/images/hero.jpg"} alt="Hospital building" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-5xl font-extrabold">Excellence in Healthcare</h1>
                <p className="mt-4 text-xl">Welcome to {hospital.hospitalName}</p>
              </div>
            </div>
          </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20 flex-grow">
        
        {/* About Section */}
        {(page === 'home' || page === 'about') && (
            <section id="about" className={page === 'about' ? 'min-h-[60vh] flex items-center' : 'mb-20'}>
              <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center w-full">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">About Our Hospital</h2>
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                  {settings.aboutUs || `Please add an 'About Us' description in the dashboard. Founded on the principles of integrity, innovation, and inclusivity, ${hospital.hospitalName} has been a cornerstone of community health for decades.`}
                </p>
              </div>
            </section>
        )}

        {/* Doctors Section */}
        {(page === 'home' || page === 'doctors') && (
            <section id="doctors" className={page === 'doctors' ? 'min-h-[60vh]' : ''}>
              <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Meet Our Doctors</h2>
              {doctors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map(doctor => (
                      <div key={doctor.id} className="bg-white p-8 rounded-xl shadow-md text-center transform hover:-translate-y-1 transition-transform">
                          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mx-auto mb-4">
                              {doctor.imageUrl ? <img loading="lazy" decoding="async" src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-slate-400" />}
                          </div>
                        <h3 className="text-2xl font-bold text-slate-900">{doctor.name}</h3>
                        <p className="mt-2 text-blue-600 font-semibold">{doctor.specialization}</p>
                        <p className="mt-1 text-slate-500 text-sm">{doctor.qualifications}</p>
                      </div>
                    ))}
                  </div>
                  {doctors.length === 9 && page === 'home' && (
                    <p className="text-center mt-8 text-slate-500">Showing a selection of our specialists. <Link to={`/${hospital.subdomain}/doctors`} className="text-blue-600 hover:underline">View All</Link></p>
                  )}
                </>
              ) : (
                <p className="text-center text-slate-600">Doctor information coming soon. Please add doctors in the dashboard.</p>
              )}
            </section>
        )}

        {/* Contact Section */}
        {page === 'contact' && (
            <section id="contact" className="min-h-[60vh] flex flex-col justify-center items-center">
                <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Contact Us</h2>
                <div className="max-w-2xl w-full bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                     <p className="text-xl font-semibold text-slate-800 mb-4">{hospital.hospitalName}</p>
                     <p className="text-lg text-slate-600 mb-4">{settings.address || "Address not provided"}</p>
                     <p className="text-lg text-slate-600 mb-4">
                        <strong>Phone:</strong> <a href={`tel:${settings.contactPhone}`} className="text-blue-600 hover:underline">{settings.contactPhone || "Not provided"}</a>
                     </p>
                     <p className="text-lg text-slate-600">
                        <strong>Email:</strong> <a href={`mailto:${settings.contactEmail}`} className="text-blue-600 hover:underline">{settings.contactEmail || "Not provided"}</a>
                     </p>
                </div>
            </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-auto">
        <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                {/* Brand Column */}
                <div className="flex flex-col items-start text-left">
                    <Link to={`/${hospital.subdomain}`} className="flex items-center gap-3 mb-6">
                         {settings.logoUrl ? (
                            <img loading="lazy" decoding="async" src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 brightness-0 invert opacity-90"/>
                        ) : (
                            <MedicalIcon className="h-10 w-10 text-white" />
                        )}
                        <span className="text-2xl font-bold text-white tracking-wide">{hospital.hospitalName}</span>
                    </Link>
                    <p className="text-sm leading-relaxed opacity-80 max-w-xs">
                        Committed to providing compassionate, comprehensive, and advanced healthcare to our community.
                    </p>
                    <div className="mt-8">
                        <Link to={`/${hospital.subdomain}/book-appointment`} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm shadow-md">Book an Appointment</Link>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="flex flex-col md:items-center">
                    <div className="flex flex-col">
                        <h4 className="text-white text-lg font-bold mb-6 tracking-wider uppercase">Quick Links</h4>
                        <div className="flex flex-col gap-3 text-sm font-semibold tracking-wider opacity-80">
                            <Link to={`/${hospital.subdomain}`} className="hover:text-white transition-colors w-fit">Home</Link>
                            <Link to={`/${hospital.subdomain}/about`} className="hover:text-white transition-colors w-fit">About Us</Link>
                            <Link to={`/${hospital.subdomain}/doctors`} className="hover:text-white transition-colors w-fit">Doctors</Link>
                            <Link to={`/${hospital.subdomain}/contact`} className="hover:text-white transition-colors w-fit">Contact</Link>
                        </div>
                    </div>
                </div>

                {/* Contact Column */}
                <div className="flex flex-col md:items-end">
                    <div className="flex flex-col">
                        <h4 className="text-white text-lg font-bold mb-6 tracking-wider uppercase">Contact Info</h4>
                        <div className="flex flex-col gap-4 text-sm opacity-80">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">📍</span>
                                <p className="max-w-[200px] leading-relaxed">{settings?.address || 'Address not set in settings'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📞</span>
                                <a href={`tel:${settings?.contactPhone || ''}`} className="hover:text-white transition-colors">
                                    {settings?.contactPhone || 'Phone not set'}
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✉️</span>
                                <a href={`mailto:${settings?.contactEmail || ''}`} className="hover:text-white transition-colors">
                                    {settings?.contactEmail || 'Email not set'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
                <p className="text-sm opacity-60">Powered by <span className="font-semibold text-white">MediVerse</span></p>
            </div>
        </div>
      </footer>
    </div>
    <ChatWidget hospitalId={hospital.uid} hospitalName={hospital.hospitalName} plan={hospital.plan} themeColor={settings.themeColor} />
    </>
  );
};

export default PremiumTemplate;
