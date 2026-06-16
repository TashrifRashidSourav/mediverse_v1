import React, { useState, useEffect } from 'react';

const PermissionGuide: React.FC<{ firebaseConfig: { projectId: string }, errorDetails?: string }> = ({ firebaseConfig, errorDetails }) => {
    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-800">Action Required: Update Security Rules</h2>
            <p className="mt-2 text-red-700">
                It looks like your Firestore security rules are preventing the app from working correctly. This can happen after a feature update.
            </p>
            {errorDetails && (
                <div className="mt-4 p-4 bg-red-100 rounded text-red-800 font-mono text-sm">
                    <strong>Error Details:</strong> {errorDetails}
                </div>
            )}
            <p className="mt-4 text-red-700">
                If you have just updated your rules, please note that <strong>Firestore rules can take up to 2-3 minutes to fully propagate</strong> across Google's servers. 
                Please wait a few minutes and refresh this page.
            </p>
            <p className="mt-4 text-red-700">
                If the error persists, there may be a mismatch in your queries. Please share the "Error Details" above.
            </p>
        </div>
    );
};

export default PermissionGuide;