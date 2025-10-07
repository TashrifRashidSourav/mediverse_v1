import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { type User, PlanTier } from '../types';
import NotFoundPage from './NotFoundPage';
import { db } from '../firebase';

// Import the new templates
import GeneralTemplate from './templates/GeneralTemplate';
import PremiumTemplate from './templates/PremiumTemplate';
import GoldenTemplate from './templates/GoldenTemplate';

const HospitalSitePage: React.FC = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [hospital, setHospital] = useState<User | 'loading' | 'not_found'>('loading');

  useEffect(() => {
    const fetchHospitalData = async () => {
        if (!subdomain) {
            setHospital('not_found');
            return;
        }
        try {
            // Fetch hospital data using v8 syntax
            const usersCollection = db.collection('users');
            const q = usersCollection.where('subdomain', '==', subdomain);
            const querySnapshot = await q.get();

            if (querySnapshot.empty) {
                setHospital('not_found');
            } else {
                // Should only be one document with a unique subdomain
                const hospitalData = querySnapshot.docs[0].data() as User;
                setHospital(hospitalData);
            }
        } catch (error) {
            console.error("Error fetching hospital data:", error);
            setHospital('not_found');
        }
    };
    
    fetchHospitalData();
  }, [subdomain]);

  if (hospital === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><p>Loading hospital site...</p></div>;
  }

  if (hospital === 'not_found') {
    return <NotFoundPage />;
  }

  // Render the correct template based on the hospital's plan
  switch (hospital.plan) {
    case PlanTier.General:
      return <GeneralTemplate hospital={hospital} />;
    case PlanTier.Premium:
      return <PremiumTemplate hospital={hospital} />;
    case PlanTier.Golden:
      return <GoldenTemplate hospital={hospital} />;
    default:
      // Fallback to the General template if plan is unknown
      return <GeneralTemplate hospital={hospital} />;
  }
};

export default HospitalSitePage;