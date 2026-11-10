

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type User, type SiteSettings, type Doctor } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';
import { FacebookIcon } from '../../components/icons/FacebookIcon';
import { TwitterIcon } from '../../components/icons/TwitterIcon';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { LinkedInIcon } from '../../components/icons/LinkedInIcon';
import ChatWidget from '../../components/ChatWidget';

const socialIcons = {
    Facebook: FacebookIcon,
    Twitter: TwitterIcon,
    Instagram: InstagramIcon,
    LinkedIn: LinkedInIcon,
};

interface TemplateProps {
  hospital: User;
  page?: 'home' | 'about' | 'doctors' | 'contact';
}

const GoldenTemplate: React.FC<TemplateProps> = ({ hospital, page = 'home' }) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!hospital.uid) {
        setLoading(false);
        return;
      }
      try {
        const settingsPromise = db.collection('users').doc(hospital.uid).collection('settings').doc('site').get();
        const doctorsPromise = db.collection('users').doc(hospital.uid).collection('doctors').limit(page === 'home' ? 4 : 100).get();

        const [settingsDoc, doctorsSnapshot] = await Promise.all([settingsPromise, doctorsPromise]);

        if (settingsDoc.exists) {
          setSettings(settingsDoc.data() as SiteSettings);
        }
        
        const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
        setDoctors(doctorsData);

      } catch (error) {
        console.error("Error fetching site data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hospital.uid, page]);

  const appointmentLink = `/${subdomain}/book-appointment`;
  
  const themeColor = settings?.themeColor || '#a16207';
  const buttonColor = settings?.buttonColor || themeColor;
  const textColor = settings?.textColor || '#1f2937';
  const footerColor = settings?.footerColor || '#111827';
  const lightTextColor = textColor === '#1f2937' ? '#4b5563' : textColor;

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mb-4"></div>
          </div>
      );
  }

  return (
    <>
      <style>{`
        .service-card:hover { border-color: ${themeColor} !important; }
        .social-link:hover { color: white !important; }
      `}</style>
      <div className="bg-gray-50 font-serif min-h-screen flex flex-col" style={{ color: textColor }}>
        <header className={`${page === 'home' ? 'absolute' : 'relative bg-slate-900'} top-0 left-0 right-0 z-50 text-white`}>
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <Link to={`/${hospital.subdomain}`} className="flex items-center gap-3">
               {settings?.logoUrl ? (
                  <img loading="lazy" decoding="async" src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10"/>
               ) : (
                  <MedicalIcon className="h-9 w-9 text-white" />
               )}
              <span className="text-3xl font-bold tracking-wider">{hospital.hospitalName}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-lg">
              <Link to={`/${hospital.subdomain}`} className={`hover:opacity-80 transition-opacity ${page === 'home' ? 'font-bold' : ''}`}>Home</Link>
              <Link to={`/${hospital.subdomain}/about`} className={`hover:opacity-80 transition-opacity ${page === 'about' ? 'font-bold' : ''}`}>About Us</Link>
              <Link to={`/${hospital.subdomain}/doctors`} className={`hover:opacity-80 transition-opacity ${page === 'doctors' ? 'font-bold' : ''}`}>Doctors</Link>
              <Link to={`/${hospital.subdomain}/contact`} className={`hover:opacity-80 transition-opacity ${page === 'contact' ? 'font-bold' : ''}`}>Contact</Link>
              {page !== 'home' && (
                <Link to={appointmentLink} style={{ backgroundColor: buttonColor }} className="px-5 py-2 rounded-full text-base font-bold hover:opacity-90 transition-opacity">Book Appointment</Link>
              )}
            </nav>
            <button
              type="button"
              className="md:hidden p-1"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          {menuOpen && (
            <nav className="md:hidden bg-slate-900/95 px-6 pb-6 pt-2 flex flex-col gap-4 text-lg" onClick={() => setMenuOpen(false)}>
              <Link to={`/${hospital.subdomain}`}>Home</Link>
              <Link to={`/${hospital.subdomain}/about`}>About Us</Link>
              <Link to={`/${hospital.subdomain}/doctors`}>Doctors</Link>
              <Link to={`/${hospital.subdomain}/contact`}>Contact</Link>
              <Link to={appointmentLink} style={{ backgroundColor: buttonColor }} className="text-center px-5 py-2.5 rounded-full font-bold">Book Appointment</Link>
            </nav>
          )}
        </header>

        {page === 'home' && (
            <section className="relative h-screen flex items-center justify-center text-white">
              <div className="absolute inset-0 bg-black z-0">
                  <img src={settings?.heroImageUrl || "/images/hero.jpg"} alt="Modern hospital interior" className="w-full h-full object-cover opacity-50"/>
              </div>
              <div className="relative z-10 text-center px-4">
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                  Pioneering Compassionate <br/> and Advanced Healthcare
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-gray-200">
                  Welcome to {hospital.hospitalName}, where your health and well-being are our highest calling.
                </p>
                <Link to={appointmentLink} style={{ backgroundColor: buttonColor }} className="mt-10 inline-block text-white font-bold text-xl px-10 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg">
                  Book an Appointment
                </Link>
              </div>
            </section>
        )}

        <main className="bg-white flex-grow">
          <div className="container mx-auto px-6 py-24">
              
              {(page === 'home' || page === 'about') && (
                  <section id="about" className={`max-w-5xl mx-auto ${page === 'about' ? 'min-h-[50vh] flex flex-col justify-center' : ''}`}>
                      <h2 className="text-4xl font-bold text-center">A Legacy of Healing</h2>
                      <p className="mt-8 text-lg leading-relaxed whitespace-pre-line text-justify" style={{ color: lightTextColor }}>
                          {settings?.aboutUs || `Please add an 'About Us' description in the dashboard. Founded on the principles of integrity, innovation, and inclusivity, ${hospital.hospitalName} has been a cornerstone of community health for decades.`}
                      </p>
                  </section>
              )}
              
              {page === 'home' && settings?.services && settings.services.length > 0 && (
                <section id="services" className="mt-28">
                     <h2 className="text-4xl font-bold text-center mb-16">Our Centers of Excellence</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         {settings.services.map(service => (
                            <div key={service.id} className="service-card border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ borderColor: `${themeColor}20` }}>
                                <h3 className="text-xl font-semibold">{service.name || 'Service Name'}</h3>
                                <p className="mt-2" style={{ color: lightTextColor }}>{service.description || 'Service description not set.'}</p>
                            </div>
                         ))}
                     </div>
                </section>
              )}

              {(page === 'home' || page === 'doctors') && doctors.length > 0 && (
                   <section id="doctors" className={`${page === 'home' ? 'mt-28' : 'min-h-[50vh]'}`}>
                      <h2 className="text-4xl font-bold text-center mb-16">Our Specialists</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {doctors.map(doctor => (
                             <div key={doctor.id} className="text-center">
                                 <img loading="lazy" decoding="async" src={doctor.imageUrl || "/images/doctor-placeholder.svg"} alt={doctor.name} className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg mb-4"/>
                                 <h3 className="text-xl font-bold">{doctor.name}</h3>
                                 <p style={{color: themeColor}} className="font-semibold">{doctor.specialization}</p>
                                 <p style={{ color: lightTextColor }} >{doctor.qualifications}</p>
                             </div>
                          ))}
                       </div>
                       {page === 'home' && doctors.length === 4 && (
                          <div className="text-center mt-12">
                              <Link to={`/${hospital.subdomain}/doctors`} className="text-lg font-semibold hover:opacity-80 transition-opacity" style={{ color: themeColor }}>View All Specialists &rarr;</Link>
                          </div>
                       )}
                   </section>
              )}
              
              {page === 'home' && settings?.testimonials && settings.testimonials.length > 0 && (
                  <section id="testimonials" className="mt-28 bg-slate-50 py-20 -mx-6 px-6">
                       <h2 className="text-4xl font-bold text-center mb-16">What Our Patients Say</h2>
                       <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                           {settings.testimonials.map(t => (
                              <blockquote key={t.id} className="text-center">
                                  <p className="text-lg italic" style={{ color: '#374151' }}>"{t.quote || 'Quote not available.'}"</p>
                                  <footer className="mt-4 font-bold">- {t.patientName || 'Anonymous'}</footer>
                              </blockquote>
                           ))}
                       </div>
                  </section>
              )}

              {page === 'contact' && (
                  <section id="contact" className="min-h-[50vh] flex flex-col items-center justify-center">
                      <h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
                      <div className="max-w-2xl w-full mx-auto text-center border rounded-2xl p-12 shadow-sm" style={{ borderColor: `${themeColor}20` }}>
                          <h3 className="text-2xl font-bold mb-4">{hospital.hospitalName}</h3>
                          <p className="text-lg mb-6" style={{ color: lightTextColor }}>{settings?.address || 'Address not set'}</p>
                          <div className="flex flex-col gap-4 text-xl">
                              <a href={`tel:${settings?.contactPhone || ''}`} className="hover:opacity-80 transition-opacity" style={{ color: themeColor }}>
                                  📞 {settings?.contactPhone || 'Phone not set'}
                              </a>
                              <a href={`mailto:${settings?.contactEmail || ''}`} className="hover:opacity-80 transition-opacity" style={{ color: themeColor }}>
                                  ✉️ {settings?.contactEmail || 'Email not set'}
                              </a>
                          </div>
                      </div>
                  </section>
              )}
          </div>
        </main>

        <footer style={{ backgroundColor: footerColor }} className="text-gray-300 mt-auto">
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                {/* Brand Column */}
                <div className="flex flex-col items-start md:items-start text-left">
                    <Link to={`/${hospital.subdomain}`} className="flex items-center gap-3 mb-6">
                        {settings?.logoUrl ? (
                            <img loading="lazy" decoding="async" src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 brightness-0 invert opacity-90"/>
                        ) : (
                            <MedicalIcon className="h-10 w-10 text-white" />
                        )}
                        <span className="text-2xl font-bold text-white tracking-wide">{hospital.hospitalName}</span>
                    </Link>
                    <p className="text-sm leading-relaxed opacity-80 max-w-xs">
                        Committed to providing compassionate, comprehensive, and advanced healthcare to our community.
                    </p>
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

            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
                
                {settings?.socialLinks && settings.socialLinks.length > 0 && (
                  <div className="flex justify-center gap-6">
                    {settings.socialLinks.map(link => {
                      const Icon = socialIcons[link.platform];
                      return Icon && link.url ? (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link text-gray-400 opacity-60 hover:opacity-100 transition-opacity">
                          <Icon className="h-5 w-5" />
                        </a>
                      ) : null;
                    })}
                  </div>
                )}

                <p className="text-sm opacity-60">Site by <span className="font-semibold text-white">MediVerse</span></p>
            </div>
          </div>
        </footer>
      </div>
      <ChatWidget hospitalId={hospital.uid} hospitalName={hospital.hospitalName} plan={hospital.plan} themeColor={themeColor} />
    </>
  );
};

export default GoldenTemplate;
