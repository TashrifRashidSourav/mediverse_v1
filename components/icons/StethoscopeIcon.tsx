import React from 'react';

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"></path>
        <path d="M8 2a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h4v0a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2.3a1.7 1.7 0 0 1-1.5-2.3L15 14"></path>
        <path d="M19 2.3a.3.3 0 1 0 .2-.3a.3.3 0 0 0-.2.3Z"></path>
        <circle cx="6" cy="18" r="2"></circle>
    </svg>
);
