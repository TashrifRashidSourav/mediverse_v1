import React from 'react';

export const VideoOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M16 16v-3.27l4 2.53V8.7l-4 2.53V8l-6.73 4.21"></path>
        <path d="M2 16.27V7.73c0-1.1.9-2 2-2h8.52"></path>
        <line x1="2" y1="2" x2="22" y2="22"></line>
    </svg>
);
