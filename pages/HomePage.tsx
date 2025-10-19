import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = db.collection('settings');
        
        const plansDoc = await settingsRef.doc('plans').get();
        if (plansDoc.exists) {
          // Firestore stores array as an object, need to extract values
          const plansData = plansDoc.data();
          if (plansData && Array.isArray(plansData.all)) {
            setPlans(plansData.all);
          }
        }
        
        const landingPageDoc = await settingsRef.doc('landingPage').get();
        if (landingPageDoc.exists) {
          setLandingPage(landingPageDoc.data() as LandingPageSettings);
        }

      } catch (error) {
        console.error("Error fetching homepage settings:", error);
        // Fallback to constants is handled by initial state
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main>
        {isLoading ? (
          <div className="py-32 text-center">Loading...</div>
        ) : (
          <>
            <Hero 
              title={landingPage?.heroTitle}
              subtitle={landingPage?.heroSubtitle}
              imageUrl={landingPage?.heroImageUrl}
            />
            <Features />
            <Pricing plans={plans} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
