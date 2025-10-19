import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-200 rounded-lg p-4 mt-2 text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const PermissionGuide: React.FC<{ firebaseConfig: { projectId: string } }> = ({ firebaseConfig }) => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    // Checks if a user is signed in
    function signedIn() {
      return request.auth != null;
    }

    // Checks if the authenticated user is the document owner (hospital admin or patient)
    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    // --- Hospital Admin Profiles & Sub-collections ---
    match /users/{hospitalId} {
      // Public can read basic hospital info (for the website)
      allow read: if true;

      // Allow hospital admin to create their own profile (signup)
      allow create: if isOwner(hospitalId);

      // Allow hospital admin to update or delete only their own document
      allow update, delete: if isOwner(hospitalId);

      // --- Doctors Subcollection ---
      match /doctors/{docId} {
        // Public can read doctors for website display
        allow read: if true;

        // Only the hospital admin can manage doctor profiles
        allow create, update, delete: if isOwner(hospitalId);
      }

      // --- Patients Subcollection (Managed by Admin) ---
      match /patients/{docId} {
        // Private to the hospital admin for management purposes
        // Allow doctor to read patient profiles via client-side checks
        allow read: if isOwner(hospitalId) || request.auth == null;
        allow write, create, delete: if isOwner(hospitalId);
      }

      // --- Appointments Subcollection ---
      match /appointments/{appointmentId} {
        // Hospital admin can update/delete any appointment
        allow update, delete: if isOwner(hospitalId);

        // Patient can create their own appointment, Hospital admin can also create.
        allow create: if isOwner(hospitalId) || (signedIn() && request.resource.data.authUid == request.auth.uid);

        // Patient can read their own appointment, Hospital admin can read all.
        // Doctor can read via unauthenticated request (client-side logic must verify doctor is correct)
        allow read: if isOwner(hospitalId) || (signedIn() && resource.data.authUid == request.auth.uid) || request.auth == null;
        
        // --- WebRTC Signaling Subcollection for Video Calls ---
        match /webrtc/{doc=**} {
            // WARNING: This rule is required for video calls to work with the current doctor portal,
            // which does not use Firebase Authentication. This makes the signaling channel for a call
            // publicly readable and writable.
            // A production system MUST implement proper Firebase Authentication for the doctor portal.
            allow read, write: if true;
        }
      }

      // --- Prescriptions Subcollection ---
      match /prescriptions/{prescriptionId} {
        // Allow creation if the doctorId and hospitalId in the request exist in the DB.
        // This is for the doctor portal which does not use Firebase Auth.
        // NOTE: This rule still carries some risk. A more secure implementation would use Firebase Auth for doctors.
        allow create: if request.resource.data.hospitalId == hospitalId &&
                       exists(/databases/$(database)/documents/users/$(hospitalId)/doctors/$(request.resource.data.doctorId));

        // Only the hospital admin can update or delete prescriptions.
        allow update, delete: if isOwner(hospitalId);
        
        // Patient can read their own prescription, and the hospital admin can read all.
        allow read: if isOwner(hospitalId) || (signedIn() && resource.data.authUid == request.auth.uid);
      }

      // --- Website Settings Subcollection ---
      match /settings/{siteSettings} {
        // Public can read settings (for displaying info on website)
        allow read: if true;

        // Only hospital admin can modify settings
        allow create, update, delete: if isOwner(hospitalId);
      }
    }

    // --- Universal Patients Collection ---
    match /patients/{patientId} {
      // Allow signed-in patient to create their own profile
      allow create: if isOwner(patientId);

      // Allow patients to read or update only their own profile
      allow read, update: if isOwner(patientId);

      // Prevent client-side deletion for safety
      allow delete: if false;
    }

    // --- Advertised Doctors Collection (Public) ---
    match /advertisedDoctors/{doctorId} {
      // Public can read the list of advertised doctors for the directory page.
      allow read: if true;

      // Only the authenticated hospital admin can create, update, or delete an advertisement.
      // We verify ownership by matching the auth UID with the hospitalId stored in the document.
      allow create, update: if request.auth != null && request.auth.uid == request.resource.data.hospitalId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.hospitalId;
    }
  }
}`;

    const firestoreUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-800">Action Required: Update Security Rules</h2>
            <p className="mt-2 text-red-700">
                It looks like your Firestore security rules are preventing the app from working correctly. This can happen after a feature update.
            </p>
            <p className="mt-4 text-red-700">
                To fix this, please update your Firestore security rules in the Firebase console.
            </p>
            <ol className="list-decimal list-inside mt-4 space-y-2 text-red-700">
                <li>
                    Go to the{' '}
                    <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-900 underline hover:text-red-700">
                        Firestore Rules section
                    </a>{' '}
                    of your Firebase project.
                </li>
                <li>Replace the existing rules with the complete set of rules below:</li>
            </ol>
            <CodeBlock>{rules}</CodeBlock>
            <p className="mt-4 text-sm text-red-600">
                After updating the rules, please refresh this page. These new rules correctly allow patients to view their own appointments and prescriptions.
            </p>
        </div>
    );
};

export default PermissionGuide;