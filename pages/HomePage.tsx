import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import { PLANS } from '../constants';
import { db } from '../firebase';
import { Plan, LandingPageSettings } from '../types';


const HomePage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [landingPage, setLandingPage] = useState<LandingPageSettings | null>(null);
  const { hash } = useLocation();

  // navigate('/#pricing') lands here with hash "#pricing"; React Router does not scroll to it by itself.
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
    return () => clearTimeout(t);
  }, [hash]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = db.collection('settings');

        // Independent reads: run in parallel instead of one after the other.
        const [plansDoc, landingPageDoc] = await Promise.all([
          settingsRef.doc('plans').get(),
          settingsRef.doc('landingPage').get(),
        ]);

        if (plansDoc.exists) {
          const plansData = plansDoc.data();
          if (plansData && Array.isArray(plansData.all)) {
            setPlans(plansData.all);
          }
        }

        if (landingPageDoc.exists) {
          setLandingPage(landingPageDoc.data() as LandingPageSettings);
        }
      } catch (error) {
        console.error("Error fetching homepage settings:", error);
        // Fallback to constants is handled by initial state
      }
    };

    fetchSettings();
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main>
        {/* Render immediately with defaults; Firestore overrides arrive when ready. */}
        <Hero
          title={landingPage?.heroTitle}
          subtitle={landingPage?.heroSubtitle}
          imageUrl={landingPage?.heroImageUrl}
        />
        <Features />
        <Pricing plans={plans} />

      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

