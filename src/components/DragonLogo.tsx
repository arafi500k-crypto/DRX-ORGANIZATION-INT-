import React from "react";

interface DragonLogoProps {
  className?: string;
  size?: number;
}

export const DragonLogo: React.FC<DragonLogoProps> = ({ className = "", size = 120 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]`}
    >
      {/* Background soft glow / base circles */}
      <circle cx="250" cy="250" r="210" fill="url(#dragonGlow)" opacity="0.15" />
      <circle cx="250" cy="250" r="200" stroke="url(#dragonBorder)" strokeWidth="4" strokeDasharray="12 6" opacity="0.4" />

      {/* DRAGON HEAD SHAPE (Beautiful Stylized Red and White Angular Cyber Dragon) */}
      <g transform="translate(10, 0)">
        {/* Shadow layer */}
        <path
          d="M 120 180 L 190 80 L 220 120 L 290 120 L 290 150 L 370 190 L 330 220 L 390 240 L 350 270 L 410 290 L 330 330 L 170 380 L 140 310 L 190 280 L 100 240 Z"
          fill="#111"
          opacity="0.3"
        />

        {/* Large red horns & spinal spikes in background */}
        <path
          d="M 180 140 L 190 60 L 215 100 L 260 90 L 265 115 L 300 110 L 275 140 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="3"
        />
        <path
          d="M 160 170 L 130 90 L 170 140 Z"
          fill="#EF4444"
          stroke="#991B1B"
          strokeWidth="2"
        />

        {/* Red spine/neck plating running downwards */}
        <path
          d="M 170 290 L 140 330 L 220 440 L 260 450 L 270 410 L 250 350 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="3"
        />
        <path
          d="M 230 400 L 210 445 L 250 448 Z"
          fill="#EF4444"
        />

        {/* Sharp angular white mechanical main face/neck plates (Main head body) */}
        <path
          d="M 230 180 
             L 300 200 
             L 370 212 
             L 310 235 
             L 380 252 
             L 300 275 
             L 395 292 
             L 315 320 
             L 245 350 
             L 190 290 
             L 165 315 
             L 150 275 
             L 180 235 
             Z"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="6"
          strokeLinejoin="bevel"
        />

        {/* Dynamic silver / dark gray inner contrast panels */}
        <path
          d="M 215 220 L 290 235 L 230 260 L 310 272 L 240 295 L 320 310 L 240 335 L 185 270 Z"
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth="2"
        />

        {/* Sleek RED glowing dragon eye */}
        <path
          d="M 290 215 L 325 220 L 300 232 Z"
          fill="#FF0000"
          stroke="#FF8080"
          strokeWidth="1.5"
          className="animate-pulse"
        />
        
        {/* Extra glowing flame spark in the eye */}
        <circle cx="304" cy="222" r="3" fill="#FFF" />

        {/* Top white skull crest / plate */}
        <path
          d="M 200 150 L 270 170 L 225 190 Z"
          fill="#FFFFFF"
          stroke="#E5E7EB"
          strokeWidth="2"
        />

        {/* Furious chin spikes (white/silver metal) */}
        <path
          d="M 180 300 L 160 365 L 195 330 L 190 395 L 225 350 L 235 410 L 260 355 Z"
          fill="#F9FAFB"
          stroke="#D1D5DB"
          strokeWidth="4"
          strokeLinejoin="bevel"
        />

        {/* Dynamic shadows overlay */}
        <path
          d="M 260 210 L 290 270 M 240 250 L 270 305 M 220 280 L 250 333"
          stroke="#9CA3AF"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Forward teeth details */}
        <path
          d="M 365 220 L 360 228 L 350 220 L 345 227 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 370 262 L 365 255 L 358 261 L 350 254 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Visual glowing effects */}
      <defs>
        <radialGradient id="dragonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dragonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#F9FAFB" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>
    </svg>
  );
};
