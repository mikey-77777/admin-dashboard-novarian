import React from "react";

export const CornerBottomLeft: React.FC = () => (
  <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none select-none z-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <g fill="none" stroke="#cca573" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <line x1="25" y1="180" x2="25" y2="20" strokeWidth="1.5" />
        <line x1="25" y1="180" x2="180" y2="180" strokeWidth="1.5" />
        <path d="M 25 20 L 22 25 M 25 20 L 28 25 M 180 180 L 175 177 M 180 180 L 175 183" />
        
        <path d="M 25 60 C 40 60, 45 40, 35 30 C 25 20, 29 45, 25 50" />
        <path d="M 60 180 C 60 165, 40 160, 30 170 C 20 180, 45 176, 50 180" />
        <path d="M 25 100 C 70 100, 100 130, 100 180" strokeDasharray="2,3" />

        <circle cx="70" cy="135" r="35" strokeWidth="1.5" />
        <circle cx="70" cy="135" r="31" strokeDasharray="1,2" />
        <circle cx="70" cy="135" r="2" fill="#cca573" />
        
        <line x1="70" y1="135" x2="62" y2="112" strokeWidth="1.5" />
        <line x1="70" y1="135" x2="88" y2="130" strokeWidth="1" />
        
        <path d="M 70 100 L 70 104 M 70 170 L 70 166 M 35 135 L 39 135 M 105 135 L 101 135" />
        <path d="M 87 109 L 85 112 M 53 161 L 55 158 M 53 109 L 55 112 M 87 161 L 85 158" />

        <circle cx="110" cy="165" r="12" />
        <circle cx="110" cy="165" r="8" strokeDasharray="2,2" />
        <path d="M 110 150 L 110 180 M 95 165 L 125 165" opacity="0.5" />
        <path d="M 110 151 L 112 153 M 121 160 L 123 162 M 110 179 L 108 177 M 99 170 L 97 168 M 119 156 L 117 158 M 101 156 L 103 158" />

        <circle cx="38" cy="85" r="15" />
        <polygon points="38,81 41,85 38,89 35,85" fill="#cca573" />
        <path d="M 38 68 L 38 72 M 38 98 L 38 102 M 21 85 L 25 85 M 55 85 L 51 85" />
      </g>
    </svg>
  </div>
);

export const CornerTopRight: React.FC = () => (
  <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none select-none z-0 opacity-40 overflow-hidden">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <g fill="none" stroke="#cca573" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <line x1="175" y1="20" x2="20" y2="20" strokeWidth="1.5" />
        <line x1="175" y1="20" x2="175" y2="180" strokeWidth="1.5" />
        
        <path d="M 40 20 A 135 135 0 0 0 175 155" strokeWidth="1.5" />
        <path d="M 55 20 A 120 120 0 0 0 175 140" strokeDasharray="3,3" />
        <path d="M 70 20 A 105 105 0 0 0 175 125" strokeWidth="0.7" />

        <line x1="175" y1="20" x2="65" y2="130" strokeWidth="0.5" strokeDasharray="1,4" />
        <line x1="175" y1="20" x2="100" y2="160" strokeWidth="0.5" />
        <line x1="175" y1="20" x2="30" y2="85" strokeWidth="0.5" />

        <circle cx="135" cy="55" r="22" strokeWidth="1.2" />
        <circle cx="135" cy="55" r="18" />
        <path d="M 113 55 L 157 55 M 135 33 L 135 77 M 119 39 L 151 71 M 119 71 L 151 39" opacity="0.7" />
        
        <path d="M 100 20 C 100 40, 120 50, 135 55" strokeDasharray="1,3" />
        <circle cx="95" cy="35" r="2" fill="#cca573" />
        <circle cx="115" cy="48" r="1.5" fill="#cca573" />

        <path d="M 175 90 C 160 90, 155 105, 165 115 C 175 125, 170 100, 175 95" />
        <path d="M 130 20 C 130 30, 145 35, 150 20" />
      </g>
    </svg>
  </div>
);
