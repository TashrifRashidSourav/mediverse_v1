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

export interface Availability {
    id: string;
    day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}


export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    qualifications: string;
    phone: string;
    email: string;
    imageUrl?: string;
    password?: string; // For doctor portal login
    experience?: string; // e.g. "5 Years"
    fees?: number;
    availability?: Availability[];
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
    Confirmed = 'Confirmed',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    No_Show = 'No Show',
}

export interface Appointment {
    id: string;
    hospitalId: string;
    hospitalName: string;
    authUid?: string; // Patient's global auth UID
    patientId?: string; // Patient's ID within the hospital subcollection
    patientName: string;
    patientDetails: {
        phone: string;
        gender: 'Male' | 'Female' | 'Other';
        age: number;
    };
    doctorId: string;
    doctorName: string;
    date: string; // ISO string date part
    time: string; // HH:mm format
    status: AppointmentStatus;
    serialNumber?: number;
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
    buttonColor?: string;
    textColor?: string;
    footerColor?: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string; // e.g., "500mg"
    frequency: string; // e.g., "1-0-1"
    timing: 'Before Meal' | 'After Meal' | 'With Meal';
    duration: string; // e.g., "7 Days"
}


export interface Prescription {
    id: string;
    patientId: string; // Hospital-specific patient ID
    authUid?: string; // Global patient auth ID for querying
    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    doctorId: string;
    doctorName: string;
    doctorQualifications: string;
    hospitalId: string;
    hospitalName: string;
    hospitalLogoUrl?: string;
    date: string; // ISO string
    medications: Medication[];
    tests?: string;
    advice?: string;
    nextVisit?: string; // Optional date string
}