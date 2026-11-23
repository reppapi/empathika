'use client';

import React from 'react';

interface HeroStarryOverlayProps {
  className?: string;
  density?: 'normal' | 'dense' | 'subtle';
  showAurora?: boolean;
  showFlare?: boolean;
}

export default function HeroStarryOverlay({
  className = '',
  density = 'normal',
  showAurora = true,
  showFlare = true,
}: HeroStarryOverlayProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes heroStarPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
          }
        }
        @keyframes heroStarGlow {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes heroFlareBreathe {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }
        .hero-star-twinkle-1 {
          animation: heroStarPulse 3.2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-star-twinkle-2 {
          animation: heroStarPulse 4.5s ease-in-out 1.1s infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-star-twinkle-3 {
          animation: heroStarPulse 3.8s ease-in-out 2.3s infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-star-twinkle-4 {
          animation: heroStarPulse 5.1s ease-in-out 1.7s infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-flare-anim {
          animation: heroFlareBreathe 6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-dust-1 {
          animation: heroStarGlow 4s ease-in-out infinite alternate;
        }
        .hero-dust-2 {
          animation: heroStarGlow 5.5s ease-in-out 1.5s infinite alternate;
        }
      `}</style>

      <svg
        className="w-full h-full"
        viewBox="0 0 1440 360"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 4-pointed Star: Classic celestial sparkle */}
          <g id="hero-sparkle-4">
            <path
              d="M 0,-15 Q 0,-3 3,-3 Q 3,0 15,0 Q 3,0 3,3 Q 0,3 0,15 Q 0,3 -3,3 Q -3,0 -15,0 Q -3,0 -3,-3 Q 0,-3 0,-15 Z"
              fill="white"
            />
            <circle cx="0" cy="0" r="2.2" fill="white" />
          </g>

          {/* 8-pointed Star: Radiant bright star */}
          <g id="hero-sparkle-8">
            <path
              d="M 0,-18 Q 0,-3.5 3.5,-3.5 Q 3.5,0 18,0 Q 3.5,0 3.5,3.5 Q 0,3.5 0,18 Q 0,3.5 -3.5,3.5 Q -3.5,0 -18,0 Q -3.5,0 -3.5,-3.5 Q 0,-3.5 0,-18 Z"
              fill="white"
            />
            <path
              d="M 0,-11 Q 0,-2.2 2.2,-2.2 Q 2.2,0 11,0 Q 2.2,0 2.2,2.2 Q 0,2.2 0,11 Q 0,2.2 -2.2,2.2 Q -2.2,0 -11,0 Q -2.2,0 -2.2,-2.2 Q 0,-2.2 0,-11 Z"
              fill="white"
              transform="rotate(45)"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="2.8" fill="white" />
          </g>

          {/* Soft Flare Burst Gradient */}
          <radialGradient id="heroFlareHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#f3e8ff" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#c084fc" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>

          {/* Linear Gradients for Light Beams */}
          <linearGradient id="heroBeamH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="heroBeamV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Aurora Ribbon Gradient */}
          <linearGradient id="heroAuroraGrad" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="35%" stopColor="#f3e8ff" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#e9d5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Blur Filters */}
          <filter id="heroSoftBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="heroAuroraBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        {/* ── 1. AURORA / LUMINOUS LIGHT STREAM (Upper Right) ── */}
        {showAurora && (
          <g className="hero-flare-anim" opacity="0.8">
            {/* Wide soft glow ribbon */}
            <path
              d="M 940 -40 C 1120 120 1260 110 1480 30"
              fill="none"
              stroke="url(#heroAuroraGrad)"
              strokeWidth="55"
              filter="url(#heroAuroraBlur)"
              opacity="0.5"
            />
            {/* Core light streak */}
            <path
              d="M 980 -30 C 1140 110 1280 100 1480 40"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              filter="url(#heroSoftBlur)"
              opacity="0.4"
            />
          </g>
        )}

        {/* ── 2. PROMINENT LENS FLARE STARBURST (Bottom Left) ── */}
        {showFlare && (
          <g className="hero-flare-anim" transform="translate(180, 240)">
            {/* Glowing Halo */}
            <circle cx="0" cy="0" r="130" fill="url(#heroFlareHalo)" />
            {/* Horizontal Light Ray */}
            <rect x="-140" y="-1.5" width="280" height="3" fill="url(#heroBeamH)" opacity="0.75" />
            {/* Vertical Light Ray */}
            <rect x="-1.5" y="-140" width="3" height="280" fill="url(#heroBeamV)" opacity="0.75" />
            {/* Diagonal Light Rays (45 deg) */}
            <g transform="rotate(45)">
              <rect x="-80" y="-1" width="160" height="2" fill="url(#heroBeamH)" opacity="0.4" />
              <rect x="-1" y="-80" width="2" height="160" fill="url(#heroBeamV)" opacity="0.4" />
            </g>
            {/* Core 8-point bright star */}
            <use href="#hero-sparkle-8" transform="scale(1.4)" />
          </g>
        )}

        {/* ── 3. SECONDARY LENS FLARE STARBURST (Upper Right) ── */}
        {showFlare && (
          <g className="hero-flare-anim" transform="translate(1260, 110)">
            {/* Subtle Glowing Halo */}
            <circle cx="0" cy="0" r="95" fill="url(#heroFlareHalo)" opacity="0.6" />
            {/* Horizontal Light Ray */}
            <rect x="-100" y="-1" width="200" height="2" fill="url(#heroBeamH)" opacity="0.6" />
            {/* Vertical Light Ray */}
            <rect x="-1" y="-100" width="2" height="200" fill="url(#heroBeamV)" opacity="0.6" />
            {/* Core Star */}
            <use href="#hero-sparkle-8" transform="scale(1.2)" />
          </g>
        )}

        {/* ── 4. PRIMARY 4-POINT & 8-POINT SPARKLE STARS ── */}
        {/* Group 1: Twinkle animation 1 */}
        <g className="hero-star-twinkle-1">
          {/* Top Left */}
          <g transform="translate(80, 80) scale(1.1)">
            <use href="#hero-sparkle-8" />
          </g>
          <g transform="translate(260, 60) scale(0.85)">
            <use href="#hero-sparkle-4" />
          </g>
          {/* Bottom Left */}
          <g transform="translate(70, 290) scale(0.9)">
            <use href="#hero-sparkle-4" />
          </g>
          {/* Top Right */}
          <g transform="translate(1120, 60) scale(1.05)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1380, 80) scale(0.85)">
            <use href="#hero-sparkle-4" />
          </g>
          {/* Bottom Right */}
          <g transform="translate(1320, 270) scale(1.15)">
            <use href="#hero-sparkle-8" />
          </g>
        </g>

        {/* Group 2: Twinkle animation 2 */}
        <g className="hero-star-twinkle-2">
          {/* Left Area */}
          <g transform="translate(140, 150) scale(0.8)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(320, 190) scale(0.95)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(50, 210) scale(0.7)">
            <use href="#hero-sparkle-4" />
          </g>
          {/* Right Area */}
          <g transform="translate(1040, 150) scale(0.85)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1180, 230) scale(0.9)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1370, 200) scale(0.8)">
            <use href="#hero-sparkle-4" />
          </g>
        </g>

        {/* Group 3: Twinkle animation 3 */}
        <g className="hero-star-twinkle-3">
          {/* Center-Top & Center-Bottom Framing */}
          <g transform="translate(480, 65) scale(0.75)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(960, 75) scale(0.8)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(430, 280) scale(0.7)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1010, 290) scale(0.75)">
            <use href="#hero-sparkle-4" />
          </g>
          {/* Far edges */}
          <g transform="translate(20, 110) scale(0.65)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1420, 140) scale(0.7)">
            <use href="#hero-sparkle-4" />
          </g>
        </g>

        {/* Group 4: Twinkle animation 4 */}
        <g className="hero-star-twinkle-4">
          <g transform="translate(210, 100) scale(0.75)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(360, 120) scale(0.65)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(290, 270) scale(0.8)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1220, 80) scale(0.75)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1310, 170) scale(0.7)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1100, 310) scale(0.75)">
            <use href="#hero-sparkle-4" />
          </g>
          <g transform="translate(1410, 280) scale(0.65)">
            <use href="#hero-sparkle-4" />
          </g>
        </g>

        {/* ── 5. SCATTERED STAR DUST / PINPOINT STARS ── */}
        {/* Layer A: Subtle small stars */}
        <g className="hero-dust-1" fill="white">
          <circle cx="100" cy="50" r="1.5" opacity="0.6" />
          <circle cx="170" cy="115" r="1.2" opacity="0.5" />
          <circle cx="230" cy="175" r="2.0" opacity="0.75" />
          <circle cx="280" cy="130" r="1.0" opacity="0.4" />
          <circle cx="340" cy="80" r="1.8" opacity="0.65" />
          <circle cx="390" cy="160" r="1.2" opacity="0.45" />
          <circle cx="120" cy="220" r="2.2" opacity="0.8" />
          <circle cx="190" cy="320" r="1.5" opacity="0.55" />
          <circle cx="250" cy="240" r="1.0" opacity="0.35" />
          <circle cx="310" cy="310" r="1.8" opacity="0.7" />

          <circle cx="1070" cy="70" r="1.5" opacity="0.6" />
          <circle cx="1160" cy="120" r="2.2" opacity="0.8" />
          <circle cx="1200" cy="45" r="1.0" opacity="0.45" />
          <circle cx="1240" cy="190" r="1.7" opacity="0.65" />
          <circle cx="1300" cy="60" r="1.3" opacity="0.5" />
          <circle cx="1350" cy="130" r="2.0" opacity="0.75" />
          <circle cx="1400" cy="220" r="1.2" opacity="0.4" />
          <circle cx="1130" cy="260" r="1.6" opacity="0.6" />
          <circle cx="1220" cy="315" r="1.2" opacity="0.45" />
          <circle cx="1270" cy="235" r="2.0" opacity="0.7" />
          <circle cx="1360" cy="320" r="1.4" opacity="0.55" />
        </g>

        {/* Layer B: Center & framing star dust */}
        {density !== 'subtle' && (
          <g className="hero-dust-2" fill="white">
            <circle cx="450" cy="110" r="1.3" opacity="0.5" />
            <circle cx="510" cy="150" r="1.0" opacity="0.35" />
            <circle cx="580" cy="80" r="1.8" opacity="0.65" />
            <circle cx="640" cy="60" r="1.2" opacity="0.4" />
            <circle cx="720" cy="50" r="1.5" opacity="0.55" />
            <circle cx="800" cy="65" r="1.2" opacity="0.4" />
            <circle cx="870" cy="90" r="1.6" opacity="0.6" />
            <circle cx="940" cy="130" r="1.0" opacity="0.35" />
            <circle cx="990" cy="85" r="1.7" opacity="0.6" />

            <circle cx="470" cy="240" r="1.2" opacity="0.4" />
            <circle cx="540" cy="290" r="1.5" opacity="0.5" />
            <circle cx="620" cy="310" r="1.1" opacity="0.35" />
            <circle cx="710" cy="320" r="1.6" opacity="0.6" />
            <circle cx="810" cy="305" r="1.0" opacity="0.35" />
            <circle cx="890" cy="280" r="1.5" opacity="0.55" />
            <circle cx="970" cy="240" r="1.3" opacity="0.45" />

            <circle cx="40" cy="180" r="1.6" opacity="0.6" />
            <circle cx="150" cy="20" r="1.2" opacity="0.4" />
            <circle cx="1420" cy="40" r="1.4" opacity="0.5" />
            <circle cx="1430" cy="230" r="1.8" opacity="0.65" />
          </g>
        )}
      </svg>
    </div>
  );
}
