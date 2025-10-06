
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
  location: string;
  registrationNumber: string;
  phone: string;
  email: string;
  subdomain: string;
  password: string;
}