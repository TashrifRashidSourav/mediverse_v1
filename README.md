# MediVerse (Deep Cortex Health) - Intelligent Medical Platform

MediVerse is a comprehensive, multi-tenant Software as a Service (SaaS) healthcare platform designed to bridge the gap between hospitals, doctors, and patients. It provides an all-in-one digital ecosystem that allows hospitals to manage their operations, doctors to consult with patients (including video calls and e-prescriptions), and patients to easily access healthcare services.

## 🚀 Core Features

- **Multi-Tenant Architecture**: Every registered hospital gets its own virtual subdomain and customizable website space.
- **Role-Based Access Control (RBAC)**: Distinct, isolated portals and capabilities for Super Admins, Hospital Admins, Doctors, and Patients.
- **Telemedicine Ready**: Built-in real-time video consultation using WebRTC.
- **E-Prescription System**: Doctors can write, manage, and share digital prescriptions securely.
- **Integrated Billing & Invoicing**: Track patient invoices, payments, and hospital revenue.
- **Real-Time Chat**: Direct communication channel between patients and hospital administration.

---

## 👥 User Roles & Capabilities

### 1. Super Admin
The platform owner who oversees the entire MediVerse ecosystem.
- **Platform Management**: Approve, reject, or suspend hospital registrations.
- **Global Configuration**: Manage global site settings and platform-wide configurations.
- **Oversight**: View top-level metrics across all registered medical institutions.

### 2. Hospital Admin (Admin)
The manager of a specific hospital registered on the platform. Accessible via their specific subdomain dashboard (`/:subdomain/dashboard`).
- **Website Customization**: Customize the hospital's public-facing site (Home, About, Contact, Doctors) using pre-built dynamic templates (e.g., Premium, Golden).
- **Staff Management**: Add and manage doctor profiles and credentials.
- **Patient & Appointment Management**: Oversee hospital-specific patient records and schedule/manage appointments.
- **Billing & Inventory**: Generate invoices, track payments, and manage medical inventory.
- **Advertising**: Publish/advertise specific doctors to the global MediVerse directory.
- **Communication**: Chat with patients in real-time.

### 3. Doctors
Medical professionals working within a hospital. Accessible via the Doctor Portal (`/:subdomain/doctor-portal`).
- **Patient Access**: View medical history and records of assigned patients.
- **Appointment Handling**: View daily schedules and manage upcoming appointments.
- **E-Prescriptions**: Create, edit, and issue digital prescriptions to patients.
- **Telehealth**: Conduct remote video consultations with patients directly through the browser.

### 4. Patients
Users seeking medical care. Accessible via the Universal Patient Portal (`/patient/dashboard`).
- **Hospital & Doctor Discovery**: Browse the global directory of hospitals and advertised doctors.
- **Appointment Booking**: Request and book appointments with preferred doctors.
- **Health Dashboard**: View personal medical history, past and upcoming appointments.
- **Digital Records**: Access and download e-prescriptions and billing invoices.
- **Telehealth & Chat**: Join scheduled video calls with doctors and chat with hospital support.

### 5. General Public (Unregistered Users)
- **Browse & Search**: View public hospital pages and directories.
- **Registration**: Sign up as a new patient or register a new hospital onto the platform.

---

## 🏗️ Technical Architecture

MediVerse is built as a modern Single Page Application (SPA) utilizing a robust, serverless backend.

### Frontend
- **Framework**: React 19 + TypeScript.
- **Build Tool**: Vite (for extremely fast HMR and optimized production builds).
- **Routing**: `react-router-dom` (v7) handling complex dynamic multi-tenant routing (e.g., `/:subdomain/...` vs `/patient/...`).
- **UI/UX**: Modern, responsive design principles.

### Backend & Database (Firebase BaaS)
- **Database**: **Firestore (NoSQL)**. 
  - **Hierarchical Data Model**: Uses strict nested collections (e.g., `/users/{hospitalId}/doctors/{doctorId}`) to ensure data separation between different hospitals.
  - **Global Queries**: Utilizes Firebase Collection Groups to allow universal patients to query their data across multiple hospitals securely.
- **Authentication**: **Firebase Auth**. Seamlessly integrated with Firestore Security Rules to enforce strict Role-Based Access Control (RBAC). Only owners or assigned participants can read/write specific records.

### Advanced Technical Implementations
1. **Multi-Tenancy via Routing**: Uses React Router's dynamic parameters to identify the `subdomain`. The application dynamically fetches the hospital's specific data, theme, and settings based on the URL.
2. **WebRTC Video Calling**: Peer-to-peer real-time video communication integrated directly into the app. Firestore is utilized as the signaling server to exchange ICE candidates and session descriptions (`/appointments/{id}/webrtc`).
3. **Real-time Subscriptions**: Chat threads and messaging systems use Firestore's `onSnapshot` listeners to deliver messages instantly without page reloads.
4. **Security**: Extremely rigid `firestore.rules` evaluating `request.auth.uid` against document ownership, preventing data leakage between competing hospitals and protecting patient privacy.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- A Firebase Project (with Firestore and Auth enabled)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env.local` file in the root directory and add your Firebase config keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... other firebase config
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
```
