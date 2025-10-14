
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type User, type SiteSettings, type Doctor } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';
import { FacebookIcon } from '../../components/icons/FacebookIcon';
import { TwitterIcon } from '../../components/icons/TwitterIcon';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { LinkedInIcon } from '../../components/icons/LinkedInIcon';

const socialIcons = {
    Facebook: FacebookIcon,
    Twitter: TwitterIcon,
    Instagram: InstagramIcon,
    LinkedIn: LinkedInIcon,
};

const GoldenTemplate: React.FC<{ hospital: User }> = ({ hospital }) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hospital.uid) {
        setLoading(false);
        return;
      }
      try {
        const settingsPromise = db.collection('users').doc(hospital.uid).collection('settings').doc('site').get();
        const doctorsPromise = db.collection('users').doc(hospital.uid).collection('doctors').limit(4).get();

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
  }, [hospital.uid]);

  const appointmentLink = `/${subdomain}/book-appointment`;
  
  const themeColor = settings?.themeColor || '#a16207';
  const buttonColor = settings?.buttonColor || themeColor;
  const textColor = settings?.textColor || '#1f2937';
  const footerColor = settings?.footerColor || '#111827';
  const lightTextColor = textColor === '#1f2937' ? '#4b5563' : textColor;

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading Your Custom Site...</div>
  }

  return (
    <>
      <style>{`
        .service-card:hover { border-color: ${themeColor} !important; }
        .social-link:hover { color: white !important; }
      `}</style>
      <div className="bg-gray-50 font-serif" style={{ color: textColor }}>
        <header className="absolute top-0 left-0 right-0 z-50 bg-transparent text-white">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
               {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10"/>
               ) : (
                  <MedicalIcon className="h-9 w-9 text-white" />
               )}
              <span className="text-3xl font-bold tracking-wider">{hospital.hospitalName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-lg">
              <a href="#about" className="hover:opacity-80 transition-opacity">About Us</a>
              <a href="#services" className="hover:opacity-80 transition-opacity">Services</a>
              <a href="#doctors" className="hover:opacity-80 transition-opacity">Doctors</a>
              <a href="#contact" className="hover:opacity-80 transition-opacity">Contact</a>
            </nav>
          </div>
        </header>

        <section className="relative h-screen flex items-center justify-center text-white">
          <div className="absolute inset-0 bg-black z-0">
              <img src={settings?.heroImageUrl || "https://picsum.photos/seed/golden-hero/1920/1080"} alt="Modern hospital interior" className="w-full h-full object-cover opacity-50"/>
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

        <main className="bg-white">
          <div className="container mx-auto px-6 py-24">
              <section id="about" className="max-w-5xl mx-auto text-center">
                  <h2 className="text-4xl font-bold">A Legacy of Healing</h2>
                  <p className="mt-6 text-lg leading-relaxed whitespace-pre-line" style={{ color: lightTextColor }}>
                      {settings?.aboutUs || `Please add an 'About Us' description in the dashboard. Founded on the principles of integrity, innovation, and inclusivity, ${hospital.hospitalName} has been a cornerstone of community health for decades.`}
                  </p>
              </section>
              
              {settings?.services && settings.services.length > 0 && (
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

              {doctors.length > 0 && (
                   <section id="doctors" className="mt-28">
                      <h2 className="text-4xl font-bold text-center mb-16">Our Specialists</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {doctors.map(doctor => (
                             <div key={doctor.id} className="text-center">
                                 <img src={doctor.imageUrl || `https://i.pravatar.cc/300?u=${doctor.id}`} alt={doctor.name} className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg mb-4"/>
                                 <h3 className="text-xl font-bold">{doctor.name}</h3>
                                 <p style={{color: themeColor}} className="font-semibold">{doctor.specialization}</p>
                                 <p style={{ color: lightTextColor }} >{doctor.qualifications}</p>
                             </div>
                          ))}
                       </div>
                   </section>
              )}
              
              {settings?.testimonials && settings.testimonials.length > 0 && (
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
          </div>
        </main>

        <footer id="contact" style={{ backgroundColor: footerColor }} className="text-gray-300">
          <div className="container mx-auto px-6 py-16 text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 brightness-0 invert opacity-80"/>
                ) : (
                    <MedicalIcon className="h-9 w-9 text-white" />
                )}
                <span className="text-2xl font-bold text-white">{hospital.hospitalName}</span>
            </div>
            <div className="max-w-2xl mx-auto space-y-2 text-lg mb-8">
                <p>{settings?.address || 'Address not set in settings'}</p>
                <p>
                    <a href={`tel:${settings?.contactPhone || ''}`} className="hover:text-white">
                        {settings?.contactPhone || 'Phone not set'}
                    </a>
                    <span className="mx-2">|</span>
                    <a href={`mailto:${settings?.contactEmail || ''}`} className="hover:text-white">
                        {settings?.contactEmail || 'Email not set'}
                    </a>
                </p>
            </div>
            
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="mb-8 flex justify-center gap-6">
                {settings.socialLinks.map(link => {
                  const Icon = socialIcons[link.platform];
                  return Icon && link.url ? (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link text-gray-400">
                      <Icon className="h-6 w-6" />
                    </a>
                  ) : null;
                })}
              </div>
            )}

            <div className="border-t pt-8" style={{borderColor: 'rgba(255,255,255,0.2)'}}>
                <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved. | Site by Mediverse</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default GoldenTemplate;