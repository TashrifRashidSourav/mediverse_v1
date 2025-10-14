
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type User, type SiteSettings, type Doctor } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';
import { UserCircleIcon } from '../../components/icons/UserCircleIcon';

interface TemplateProps {
  hospital: User;
}

const PremiumTemplate: React.FC<TemplateProps> = ({ hospital }) => {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hospital.uid) return;
      try {
        const settingsPromise = db.collection('users').doc(hospital.uid).collection('settings').doc('site').get();
        const doctorsPromise = db.collection('users').doc(hospital.uid).collection('doctors').orderBy('name').get();
        
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
      return <div className="min-h-screen flex items-center justify-center">Loading Site...</div>
  }

  return (
    <div className="bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 max-h-10 object-contain"/>
            ) : (
                <MedicalIcon className="h-8 w-8 text-blue-600" />
            )}
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#doctors" className="font-semibold text-slate-600 hover:text-blue-600">Our Doctors</a>
            <a href="#contact" className="font-semibold text-slate-600 hover:text-blue-600">Contact</a>
            <Link to={`/login`} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-400">
        <img src={settings.heroImageUrl || "https://picsum.photos/seed/premium-hero/1600/800"} alt="Hospital building" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-extrabold">Excellence in Healthcare</h1>
            <p className="mt-4 text-xl">Welcome to {hospital.hospitalName}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        {/* Doctors Section */}
        <section id="doctors">
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Meet Our Doctors</h2>
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-white p-8 rounded-xl shadow-md text-center transform hover:-translate-y-1 transition-transform">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mx-auto mb-4">
                        {doctor.imageUrl ? <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-slate-400" />}
                    </div>
                  <h3 className="text-2xl font-bold text-slate-900">{doctor.name}</h3>
                  <p className="mt-2 text-blue-600 font-semibold">{doctor.specialization}</p>
                  <p className="mt-1 text-slate-500 text-sm">{doctor.qualifications}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-600">Doctor information coming soon. Please add doctors in the dashboard.</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6 py-16 text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                 {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 brightness-0 invert opacity-80"/>
                ) : (
                    <MedicalIcon className="h-8 w-8 text-white" />
                )}
                <span className="text-2xl font-bold text-white">{hospital.hospitalName}</span>
            </div>
             <div className="text-slate-300 max-w-2xl mx-auto space-y-2 text-lg mb-8">
                <p>{settings.address || "Address not set in settings"}</p>
                <p>
                     <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                        {settings.contactPhone || "Phone not set"}
                    </a>
                    <span className="mx-2">|</span>
                    <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                        {settings.contactEmail || "Email not set"}
                    </a>
                </p>
            </div>
            <div className="text-center">
                <Link to={`/${hospital.subdomain}/book-appointment`} className="bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">Book an Appointment</Link>
            </div>
            <div className="mt-12 border-t border-slate-800 pt-8">
            <p>&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
            <p className="text-sm text-slate-400 mt-2">Powered by Mediverse</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumTemplate;