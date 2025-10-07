
export enum PlanTier {
  General = 'General',
  Premium = 'Premium',
  Golden = 'Golden',
}

export interface Plan {
  tier: PlanTier;
  price: number;
  features: string[];
  isRecommended: boolean;
  ctaText: string;
}

export interface SignUpFormData {
  hospitalName: string;
  location?: string; // Made optional for simplicity
  registrationNumber?: string; // Made optional for simplicity
  phone?: string; // Made optional for simplicity
  email: string;
  subdomain: string;
  password: string;
}

export interface User {
  uid: string; // From Firebase Auth
  email: string;
  hospitalName: string;
  subdomain: string;
  plan: PlanTier;
}