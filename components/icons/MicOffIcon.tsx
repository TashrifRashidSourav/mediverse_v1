import React from 'react';

export const MicOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <line x1="2" y1="2" x2="22" y2="22"></line>
        <path d="M18.89 13.23A7.12 7.12 0 0 1 19 12v-2"></path>
        <path d="M5 10v2a7 7 0 0 0 12 5"></path>
        <path d="M12 2a3 3 0 0 0-3 3v7"></path>
        <path d="M9 9.5a3 3 0 0 1 3-3V2a3 3 0 0 0-3 3Z"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
);