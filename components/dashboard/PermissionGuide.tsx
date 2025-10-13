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
      allow create: if signedIn() && request.auth.uid == hospitalId;

      // Allow hospital admin to update or delete only their own document
      allow update, delete: if isOwner(hospitalId);

      // --- Doctors Subcollection ---
      match /doctors/{docId} {
        // Public can read doctors for website display
        allow read: if true;

        // Only the hospital admin can manage doctor profiles
        allow create, update, delete: if isOwner(hospitalId);
      }

      // --- Patients Subcollection ---
      match /patients/{docId} {
        // Private to the hospital admin
        allow read, write, create, delete: if isOwner(hospitalId);
      }

      // --- Appointments Subcollection ---
      match /appointments/{docId} {
        // Private to the hospital admin
        allow read, write, create, delete: if isOwner(hospitalId);
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
      allow create: if signedIn() && request.auth.uid == patientId;

      // Allow patients to read or update only their own profile
      allow read, update: if isOwner(patientId);

      // Prevent client-side deletion for safety
      allow delete: if false;
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
                After updating the rules, please refresh this page. These rules ensure that both hospital admins and universal patients can securely access their own data.
            </p>
        </div>
    );
};

export default PermissionGuide;
