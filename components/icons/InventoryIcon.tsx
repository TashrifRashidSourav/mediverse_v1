import React from 'react';

export const InventoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M21 8V7a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 7v1"></path>
        <path d="M3.3 9.4 12 14l8.7-4.6"></path>
        <path d="M12 22V14"></path>
        <path d="m7 12.5-4.7 2.6"></path>
        <path d="m17 12.5 4.7 2.6"></path>
    </svg>
);
