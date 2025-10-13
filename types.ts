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

export interface User {
  uid: string;
  email: string;
  hospitalName: string;
  subdomain: string;
  plan: PlanTier;
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    qualifications: string;
    phone: string;
    email: string;
    imageUrl?: string;
}

export enum PatientStatus {
    Admitted = 'Admitted',
    Discharged = 'Discharged',
    In_Treatment = 'In Treatment',
    Observation = 'Observation',
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    status: PatientStatus;
    admittedDate: string; // ISO string
    phone: string; // Mandatory and unique per hospital
    email?: string;
    authUid?: string; // UID from Firebase Auth
    weight?: number; // in kg
    profilePictureUrl?: string;
}

export enum AppointmentStatus {
    Scheduled = 'Scheduled',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    No_Show = 'No Show',
}

export interface Appointment {
    id: string;
    patientName: string;
    doctorName: string;
    date: string; // ISO string date part
    time: string; // HH:mm format
    status: AppointmentStatus;
}

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
}

export interface Testimonial {
    id: string;
    patientName: string;
    quote: string;
}

export interface SocialLink {
    id: string;
    platform: 'Facebook' | 'Twitter' | 'Instagram' | 'LinkedIn';
    url: string;
}

export interface SiteSettings {
    themeColor: string;
    logoUrl: string;
    heroImageUrl: string;
    aboutUs: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    services: ServiceItem[];
    testimonials: Testimonial[];
    socialLinks: SocialLink[];
}