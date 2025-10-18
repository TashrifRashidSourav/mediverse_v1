import React from 'react';
import { DatabaseIcon } from '../icons/DatabaseIcon';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-800 text-slate-200 rounded-lg p-4 mt-2 text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const IndexCreationGuide: React.FC<{ firebaseConfig: { projectId: string } }> = ({ firebaseConfig }) => {
    const firestoreUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes`;

    return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex items-start">
                 <div className="flex-shrink-0">
                    <DatabaseIcon className="h-8 w-8 text-amber-500" />
                </div>
                <div className="ml-4">
                    <h2 className="text-2xl font-bold text-amber-800">Database Index Required</h2>
                    <p className="mt-2 text-amber-700">
                        This is a one-time setup. To efficiently search and sort your assigned patients, your Firestore database needs a special configuration called a "composite index".
                    </p>
                    <p className="mt-1 text-amber-700">
                        The database returned an error because this index is missing. Please create it by following the steps below.
                    </p>
                </div>
            </div>
            
            <div className="mt-6">
                <h3 className="font-bold text-amber-800 text-lg">How to Fix:</h3>
                 <ol className="list-decimal list-inside mt-2 space-y-3 text-amber-700">
                    <li>
                        Open the{' '}
                        <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-900 underline hover:text-amber-700">
                            Firestore Indexes Panel
                        </a>{' '}
                        in a new tab. You may need to log in to your Google account.
                    </li>
                    <li>
                        Click on <strong>"Create Index"</strong> to open the index editor.
                    </li>
                    <li>
                        Fill in the form with these exact values:
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2 text-sm">
                           <div className="bg-white p-3 rounded-md border">
                                <p className="font-semibold text-slate-600">Collection ID</p>
                                <p className="font-mono text-slate-800">patients</p>
                           </div>
                            <div className="bg-white p-3 rounded-md border">
                                <p className="font-semibold text-slate-600">Query Scope</p>
                                <p className="font-mono text-slate-800">Collection</p>
                           </div>
                        </div>
                        <p>Add the following two fields for indexing:</p>
                        <CodeBlock>
                            1. Field Path: <span className="text-green-300">assignedDoctorIds</span> | Index Mode: <span className="text-green-300">Array</span>
                            <br />
                            2. Field Path: <span className="text-green-300">name</span>              | Index Mode: <span className="text-green-300">Ascending</span>
                        </CodeBlock>
                    </li>
                    <li>
                       Click <strong>"Create"</strong>. The index will start building, which may take a few minutes.
                    </li>
                    <li>
                        Once the index status is "Enabled", come back here and <strong>refresh this page</strong>. Your patient list will then load correctly.
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default IndexCreationGuide;