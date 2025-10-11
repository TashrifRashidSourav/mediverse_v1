import React from 'react';

export const ReportsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M3 3v18h18"></path>
        <path d="M18.7 8a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1.5a2 2 0 0 1 2 2.3l-2.5 6"></path>
        <path d="M12 18a4.5 4.5 0 0 0 7-5.5"></path>
    </svg>
);
