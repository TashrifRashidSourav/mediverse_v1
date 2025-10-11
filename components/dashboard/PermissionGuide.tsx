import React from 'react';

interface PermissionGuideProps {
  projectId: string;
}

const PermissionGuide: React.FC<PermissionGuideProps> = ({ projectId }) => {
  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // Rule: Allow users to read/update their own profile
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create, update: if isOwner(uid);

      // Rule: Allow owners to manage their subcollections
      match /doctors/{docId} {
        allow read, write, create, delete: if isOwner(uid);
      }
      match /patients/{docId} {
        allow read, write, create, delete: if isOwner(uid);
      }
      match /appointments/{docId} {
        allow read, write, create, delete: if isOwner(uid);
      }
    }
  }
}`;

  const rulesUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Action Required: Update Database Rules
      </h2>
      <p className="mt-4">
        Your database is currently protected by default security rules that prevent the app from accessing its data. To enable the dashboard features, you need to update these rules in your Firebase project.
      </p>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Step 1: Copy the rules below</h3>
        <pre className="bg-slate-800 text-slate-100 p-4 rounded-md text-sm whitespace-pre-wrap break-all">
          <code>
            {rules}
          </code>
        </pre>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Step 2: Paste them into your Firestore Rules editor</h3>
        <p>
          Click the link below to go directly to the rules editor for your project. Delete the existing rules and paste the new ones.
        </p>
        <a
          href={rulesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors"
        >
          Open Firebase Rules Editor
        </a>
      </div>
    </div>
  );
};

export default PermissionGuide;
