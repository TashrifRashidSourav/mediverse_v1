import React from 'react';

// A simple component to render code blocks
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-200 rounded-lg p-4 mt-2 text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const PermissionGuide: React.FC<{ firebaseConfig: { projectId: string } }> = ({ firebaseConfig }) => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rule: Allow users to read their own profile
    match /users/{uid} {
      allow read: if request.auth != null;
      allow create, update: if request.auth.uid == uid;
      
      // Rule: Allow owners to manage their subcollections
      match /doctors/{docId} {
        allow read, write: if request.auth.uid == uid;
      }
      match /patients/{docId} {
        allow read, write: if request.auth.uid == uid;
      }
      match /appointments/{docId} {
        allow read, write: if request.auth.uid == uid;
      }
      match /settings/site {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}`;

    const firestoreUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-800">Action Required: Update Security Rules</h2>
            <p className="mt-2 text-red-700">
                It looks like your Firestore security rules are not set up correctly. This prevents the application from reading or writing data for doctors, patients, and website settings.
            </p>
            <p className="mt-4 text-red-700">
                To fix this, please update your Firestore security rules in the Firebase console. This is a one-time setup.
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
                After updating the rules, please refresh this page. These rules ensure that a logged-in user can only access and modify their own hospital's data.
            </p>
        </div>
    );
};

export default PermissionGuide;