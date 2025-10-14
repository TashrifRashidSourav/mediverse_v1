
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type User, SiteSettings } from '../../types';
import { MedicalIcon } from '../../components/icons/MedicalIcon';
import { db } from '../../firebase';

interface TemplateProps {
  hospital: User;
}

const GeneralTemplate: React.FC<TemplateProps> = ({ hospital }) => {
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

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading Site...</div>
  }

  return (
    <div className="bg-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 max-h-10 object-contain"/>
            ) : (
                <MedicalIcon className="h-8 w-8 text-teal-600" />
            )}
            <span className="text-2xl font-bold text-slate-900">{hospital.hospitalName}</span>
          </div>
          <nav>
            <Link to={`/login`} className="font-semibold text-teal-600 hover:text-teal-700">Admin Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Welcome Section */}
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

        {/* About Us Section */}
        <section className="mt-20">
          <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">About Our Hospital</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {settings.aboutUs || "Please update the 'About Us' section in your dashboard settings. Our hospital is dedicated to providing the highest quality of care to our patients."}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-800 text-slate-300 mt-20">
        <div className="container mx-auto px-6 py-12 text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt={`${hospital.hospitalName} Logo`} className="h-10 brightness-0 invert opacity-80"/>
                ) : (
                    <MedicalIcon className="h-8 w-8 text-white" />
                )}
                <span className="text-2xl font-bold text-white">{hospital.hospitalName}</span>
            </div>
            <div className="max-w-2xl mx-auto space-y-2 text-slate-400">
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
            <div className="mt-8 border-t border-slate-700 pt-8">
            <p>&copy; {new Date().getFullYear()} {hospital.hospitalName}. All rights reserved.</p>
            <p className="text-sm text-slate-500 mt-2">Powered by Mediverse</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default GeneralTemplate;