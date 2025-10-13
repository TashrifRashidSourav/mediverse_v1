
import { type Plan, PlanTier } from './types';

export const PLANS: Plan[] = [
  {
    tier: PlanTier.General,
    price: 1200,
    features: [
      'Custom Subdomain',
      'Basic Website Template',
      'Contact Form',
      'Location Map',
      '5GB Storage',
      'Email Support',
    ],
    isRecommended: false,
    ctaText: 'Get Started',
  },
  {
    tier: PlanTier.Premium,
    price: 2500,
    features: [
      'Everything in General',
      'Advanced Website Templates',
      'Online Appointment Booking',
      'Patient Portal (Basic)',
      '20GB Storage',
      'Priority Email Support',
    ],
    isRecommended: true,
    ctaText: 'Choose Premium',
  },
  {
    tier: PlanTier.Golden,
    price: 4000,
    features: [
      'Everything in Premium',
      'Custom Website Design',
      'E-commerce for Pharmacy',
      'Advanced Patient Portal',
      'Unlimited Storage',
      '24/7 Phone Support',
    ],
    isRecommended: false,
    ctaText: 'Go Golden',
  },
];
