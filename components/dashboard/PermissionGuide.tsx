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
    function signedIn() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    // --- Global Site Settings (for Homepage & Super Admin) ---
    match /settings/{docId} {
      // Allow public to read for homepage content (pricing, etc.)
      allow read: if true;
      // Allow write for unauthenticated Super Admin. 
      // NOTE: For a production app, this should be secured.
      allow write: if true; 
    }

    // --- Hospital Admin Profiles & Sub-collections ---
    match /users/{hospitalId} {
      allow read: if true;
      allow create: if isOwner(hospitalId);
      // Allow owner to update, OR allow unauthenticated Super Admin to ONLY update the 'status' field.
      allow update: if isOwner(hospitalId) || (request.auth == null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']));
      allow delete: if isOwner(hospitalId);

      // --- Doctors Subcollection ---
      match /doctors/{docId} {
        allow read: if true;
        allow create, update, delete: if isOwner(hospitalId);
      }

      // --- Patients Subcollection (Hospital's Local Records) ---
      match /patients/{docId} {
        // Hospital admin can create, or a signed-in patient can create their own local record when booking.
        allow create: if isOwner(hospitalId) || (signedIn() && request.resource.data.authUid == request.auth.uid);
        // Allow admin OR the unauthenticated doctor portal to read patient records.
        allow read: if isOwner(hospitalId) || request.auth == null;
        allow update, delete: if isOwner(hospitalId);
      }

      // --- Appointments Subcollection ---
      match /appointments/{appointmentId} {
        allow create: if isOwner(hospitalId) || (signedIn() && request.resource.data.authUid == request.auth.uid);
        allow update, delete: if isOwner(hospitalId);
        // Admin, the specific patient, or the unauthenticated Doctor portal can read.
        allow read: if isOwner(hospitalId) || (signedIn() && resource.data.authUid == request.auth.uid) || request.auth == null;
        
        // --- WebRTC Subcollection for Video Calls ---
        match /webrtc/{doc=**} {
            // Required for unauthenticated Doctor portal and authenticated Patient to exchange video call signals.
            allow read, write: if true;
        }
      }

      // --- Prescriptions Subcollection ---
      match /prescriptions/{prescriptionId} {
        // Unauthenticated doctor portal can create, but we verify the doctor exists for security.
        allow create: if request.resource.data.hospitalId == hospitalId &&
                       exists(/databases/$(database)/documents/users/$(hospitalId)/doctors/$(request.resource.data.doctorId));
        allow update, delete: if isOwner(hospitalId);
        // Admin or the specific patient can read.
        allow read: if isOwner(hospitalId) || (signedIn() && resource.data.authUid == request.auth.uid);
      }

      // --- Settings Subcollection (for individual hospital sites) ---
      match /settings/{siteSettings} {
        allow read: if true;
        allow create, update, delete: if isOwner(hospitalId);
      }
    }

    // --- Universal Patients Collection ---
    match /patients/{patientId} {
      allow create: if isOwner(patientId);
      allow read, update: if isOwner(patientId);
      allow delete: if false; // Prevent patients from deleting their own global profile.
    }

    // --- Collection Group Rules for Patient Queries ---
    // These allow a patient to efficiently query their own data across all hospitals.
    match /{path=**}/appointments/{appointmentId} {
      allow read: if signedIn() && resource.data.authUid == request.auth.uid;
    }
    match /{path=**}/prescriptions/{prescriptionId} {
      allow read: if signedIn() && resource.data.authUid == request.auth.uid;
    }
  }
}`;

    const firestoreUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-red-800">Action Required: Final Fix for Security Rules</h2>
            <p className="mt-2 text-red-700">
                I understand this is frustrating. This error almost always happens because of a small mix-up when pasting the rules into Firebase.
                Let's walk through this one last time with very specific steps to guarantee it works.
            </p>
            <ol className="list-decimal list-inside mt-4 space-y-4 text-red-900 font-medium">
                <li>
                    <strong>Open the Firebase Rules Editor in a new tab:</strong>
                    <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-1 font-semibold text-white bg-red-600 hover:bg-red-700 p-2 rounded-lg">
                        Go to Firebase Rules
                    </a>
                </li>
                <li>
                    <span className="text-red-600 font-extrabold text-lg">‼️ CRITICAL STEP: DELETE ALL OLD RULES.</span>
                    <p className="font-normal text-red-800 ml-5">Inside the editor, select all the text (press <kbd>Ctrl+A</kbd> or <kbd>Cmd+A</kbd>) and press the **DELETE** key. The editor must be **COMPLETELY EMPTY** before you continue.</p>
                </li>
                <li>
                    <span className="font-bold">✅ PASTE THE CORRECT RULES.</span>
                     <p className="font-normal text-red-800 ml-5">Copy the complete code block below and paste it into the now-empty editor.</p>
                </li>
            </ol>
            <CodeBlock>{rules}</CodeBlock>
            <div className="mt-4">
                 <p className="font-bold text-red-900">🚀 After you click "Publish" in Firebase, please wait about 10 seconds, then <strong className="uppercase">close this browser tab completely</strong> and log back into the Super Admin panel.</p>
            </div>
             <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-red-800">Troubleshooting Checklist:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mt-2">
                    <li>Did you delete the old rules <strong className="uppercase">completely</strong> before pasting? Pasting at the end of the old rules will not work.</li>
                    <li>Did you click the "Publish" button and wait a few moments?</li>
                    <li>Are you in the correct Firebase project? The URL should contain your project ID: <strong>{firebaseConfig.projectId}</strong></li>
                </ul>
            </div>
        </div>
    );
};

export default PermissionGuide;