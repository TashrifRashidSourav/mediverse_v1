
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { type User, SiteSettings } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';

interface TemplateProps {
  hospital: User;
  page?: 'home' | 'about' | 'doctors' | 'contact';
}

const GeneralTemplate: React.FC<TemplateProps> = ({ hospital, page = 'home' }) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!hospital.uid) return;
      try {
        const settingsDoc = await db.collection('users').doc(hospital.uid).collection('settings').doc('site').get();
        if (settingsDoc.exists) {
          setSettings(settingsDoc.data() as SiteSettings);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [hospital.uid]);

  // This plan has no doctors page; /:subdomain/doctors used to render an empty page.
  if (page === 'doctors') {
    return <Navigate to={`/${hospital.subdomain}`} replace />;
  }

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-600 mb-4"></div>
          </div>
      );
  }

  return (
    <div className="bg-white font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <Link to={`/${hospital.subdomain}`} className="flex items-center gap-3">
            {settings.logoUrl ? (
                <img loading="lazy" decoding="async" src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 max-h-10 object-contain"/>
            ) : (
                <MedicalIcon className="h-8 w-8 text-teal-600" />
            )}
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to={`/${hospital.subdomain}`} className={`font-semibold ${page === 'home' ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'}`}>Home</Link>
            <Link to={`/${hospital.subdomain}/about`} className={`font-semibold ${page === 'about' ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'}`}>About</Link>
            <Link to={`/${hospital.subdomain}/contact`} className={`font-semibold ${page === 'contact' ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'}`}>Contact</Link>
            <Link to={`/login`} className="font-semibold text-teal-600 hover:text-teal-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 flex-grow">
        {/* Welcome Section - Only on Home */}
        {page === 'home' && (
            <section className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Welcome to {hospital.hospitalName}</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">Your trusted partner in health. Providing compassionate care for our community.</p>
               <div className="mt-8">
                    <Link 
                        to={`/${hospital.subdomain}/book-appointment`} 
                        className="bg-teal-600 text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                    >
                        Book an Appointment
                    </Link>
                </div>
            </section>
        )}

        {/* About Us Section */}
        {(page === 'home' || page === 'about') && (
            <section className={`${page === 'about' ? 'min-h-[50vh] flex items-center' : 'mt-20'}`}>
              <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg w-full text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">About Our Hospital</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                  {settings.aboutUs || "Please update the 'About Us' section in your dashboard settings. Our hospital is dedicated to providing the highest quality of care to our patients."}
                </p>
              </div>
            </section>
        )}

        {/* Contact Section */}
        {page === 'contact' && (
            <section className="min-h-[50vh] flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Contact Us</h2>
                <div className="max-w-2xl w-full bg-slate-50 p-12 rounded-lg text-center">
                     <p className="text-xl font-bold text-slate-800 mb-4">{hospital.hospitalName}</p>
                     <p className="text-lg text-slate-600 mb-4">{settings.address || "Address not provided"}</p>
                     <p className="text-lg text-slate-600 mb-2">
                        <strong>Phone:</strong> <a href={`tel:${settings.contactPhone}`} className="text-teal-600 hover:underline">{settings.contactPhone || "Not provided"}</a>
                     </p>
                     <p className="text-lg text-slate-600">
                        <strong>Email:</strong> <a href={`mailto:${settings.contactEmail}`} className="text-teal-600 hover:underline">{settings.contactEmail || "Not provided"}</a>
                     </p>
                </div>
            </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 mt-auto">
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
                        Your trusted partner in health. Providing compassionate care for our community.
                    </p>
                </div>

                {/* Quick Links Column */}
                <div className="flex flex-col md:items-center">
                    <div className="flex flex-col">
                        <h4 className="text-white text-lg font-bold mb-6 tracking-wider uppercase">Quick Links</h4>
                        <div className="flex flex-col gap-3 text-sm font-semibold tracking-wider opacity-80">
                            <Link to={`/${hospital.subdomain}`} className="hover:text-white transition-colors w-fit">Home</Link>
                            <Link to={`/${hospital.subdomain}/about`} className="hover:text-white transition-colors w-fit">About</Link>
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

            <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
                <p className="text-sm opacity-60">Powered by <span className="font-semibold text-white">MediVerse</span></p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default GeneralTemplate;
