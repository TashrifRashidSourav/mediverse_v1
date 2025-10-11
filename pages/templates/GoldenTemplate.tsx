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
  
  const themeColor = settings?.themeColor || '#a16207'; // amber-600 default
  const patientPortalLink = `/#/${subdomain}/patient-portal/login`;

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading Site...</div>
  }

  return (
    <div className="bg-gray-50 font-serif text-gray-800">
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
            <a href="#about" className="hover:text-amber-300 transition-colors">About Us</a>
            <a href="#services" className="hover:text-amber-300 transition-colors">Services</a>
            <a href="#doctors" className="hover:text-amber-300 transition-colors">Doctors</a>
            <a href="#contact" className="hover:text-amber-300 transition-colors">Contact</a>
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
          <a href={patientPortalLink} style={{backgroundColor: themeColor}} className="mt-10 inline-block text-white font-bold text-xl px-10 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg">
            Book an Appointment
          </a>
        </div>
      </section>

      <main className="bg-white">
        <div className="container mx-auto px-6 py-24">
            <section id="about" className="max-w-5xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-900">A Legacy of Healing</h2>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {settings?.aboutUs || `Founded on the principles of integrity, innovation, and inclusivity, ${hospital.hospitalName} has been a cornerstone of community health for decades. Our mission is to deliver world-class medical care with a personal touch.`}
                </p>
            </section>
            
            {settings?.services && settings.services.length > 0 && (
              <section id="services" className="mt-28">
                   <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Our Centers of Excellence</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                       {settings.services.map(service => (
                          <div key={service.id} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-2xl hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-2">
                              <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                              <p className="text-gray-600 mt-2">{service.description}</p>
                          </div>
                       ))}
                   </div>
              </section>
            )}

            {doctors.length > 0 && (
                 <section id="doctors" className="mt-28">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Our Specialists</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {doctors.map(doctor => (
                           <div key={doctor.id} className="text-center">
                               <img src={doctor.imageUrl || `https://i.pravatar.cc/300?u=${doctor.id}`} alt={doctor.name} className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg mb-4"/>
                               <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                               <p style={{color: themeColor}} className="font-semibold">{doctor.specialization}</p>
                               <p className="text-gray-500">{doctor.qualifications}</p>
                           </div>
                        ))}
                     </div>
                 </section>
            )}
            
            {settings?.testimonials && settings.testimonials.length > 0 && (
                <section id="testimonials" className="mt-28 bg-slate-50 py-20 -mx-6 px-6">
                     <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">What Our Patients Say</h2>
                     <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                         {settings.testimonials.map(t => (
                            <blockquote key={t.id} className="text-center">
                                <p className="text-lg italic text-gray-700">"{t.quote}"</p>
                                <footer className="mt-4 font-bold text-gray-800">- {t.patientName}</footer>
                            </blockquote>
                         ))}
                     </div>
                </section>
            )}

        </div>
      </main>

      <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 py-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Contact {hospital.hospitalName}</h3>
          <p className="text-lg">{settings?.address || '123 Health St, Medville'}</p>
          <div className="mt-8 text-lg">
            <p><strong>Phone:</strong> {settings?.contactPhone || '(123) 456-7890'} | <strong>Email:</strong> {settings?.contactEmail || `contact@${hospital.subdomain}.mediverse.app`}</p>
          </div>
          {settings?.socialLinks && settings.socialLinks.length > 0 && (
            <div className="mt-8 flex justify-center gap-6">
              {settings.socialLinks.map(link => {
                const Icon = socialIcons[link.platform];
                return Icon ? (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </a>
                ) : null;
              })}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-12">&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved. | Site by Mediverse</p>
        </div>
      </footer>
    </div>
  );
};

export default GoldenTemplate;