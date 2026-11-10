import { type Plan, PlanTier } from './types';

/**
 * First URL segments that belong to the app itself. A hospital cannot take one of
 * these as its subdomain, otherwise its public site would be unreachable.
 */
export const RESERVED_SUBDOMAINS: readonly string[] = [
  'signup', 'login', 'patient', 'doctor-portal', 'book-appointment', 'meet',
  'pending-approval', 'super-admin', 'payment', 'hospitals', 'doctors', 'about',
  'contact', 'dashboard', 'admin', 'api', 'www', 'app', 'static', 'assets',
];

/** Turn free text into a URL-safe subdomain (lowercase letters, digits, single hyphens). */
export const slugifySubdomain = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '');

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
