import { type Plan, PlanTier } from './types';

export const PLANS: Plan[] = [
  {
    tier: PlanTier.General,
    price: 550,
    features: [
      'Custom Subdomain',
      'Basic Website Template',
      'Contact & Location Info',
      'Up to 10 Doctor Profiles',
      '5GB Storage',
      'Email Support',
    ],
    isRecommended: false,
    ctaText: 'Get Started',
  },
  {
    tier: PlanTier.Premium,
    price: 850,
    features: [
      'Everything in General',
      'Advanced Website Templates',
      'Online Appointment Booking',
      'Basic Patient Portal',
      'Up to 50 Doctor Profiles',
      '20GB Storage',
      'Priority Support',
    ],
    isRecommended: true,
    ctaText: 'Choose Premium',
  },
  {
    tier: PlanTier.Golden,
    price: 1000,
    features: [
      'Everything in Premium',
      'Customizable Website Design',
      'Online Video Consultation',
      'Advanced Patient Portal',
      'Unlimited Doctor Profiles',
      'Unlimited Storage',
      '24/7 Phone Support & MediBot AI',
    ],
    isRecommended: false,
    ctaText: 'Go Golden',
  },
];
