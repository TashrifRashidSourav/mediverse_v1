

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

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
}

export enum PatientStatus {
  Admitted = 'Admitted',
  Discharged = 'Discharged',
  Outpatient = 'Outpatient',
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  status: PatientStatus;
  admittedDate: string; // ISO string
}

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string; // ISO string
  time: string; // e.g., '10:30 AM'
  status: AppointmentStatus;
}