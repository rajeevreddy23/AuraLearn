'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TeacherAvatarProps {
  styleId: 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier';
  state: 'idle' | 'speaking' | 'thinking' | 'happy';
  isFemale: boolean;
  className?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  styleId,
  state = 'idle',
  isFemale = true,
  className,
}) => {
  // Define theme colors based on teacher style
  const colors: Record<string, { primary: string; secondary: string; dark: string; light: string }> = {
    professor: { primary: '#6366f1', secondary: '#818cf8', dark: '#312e81', light: '#e0e7ff' },
    coach: { primary: '#f59e0b', secondary: '#fbbf24', dark: '#78350f', light: '#fef3c7' },
    friend: { primary: '#ec4899', secondary: '#f472b6', dark: '#831843', light: '#fce7f3' },
    expert: { primary: '#8b5cf6', secondary: '#a78bfa', dark: '#4c1d95', light: '#ede9fe' },
    simplifier: { primary: '#06b6d4', secondary: '#22d3ee', dark: '#164e63', light: '#ecfeff' },
  };

  const activeColor = colors[styleId] || colors.professor;

  // Mouth path/shape animations based on state
  const getMouthPath = () => {
    switch (state) {
      case 'speaking':
        return 'M 46 62 Q 50 68 54 62'; // Changing curves
      case 'happy':
        return 'M 44 60 Q 50 68 56 60'; // Wide smile
      case 'thinking':
        return 'M 47 62 Q 50 62 53 62'; // Straight line
      case 'idle':
      default:
        return 'M 45 61 Q 50 64 55 61'; // Gentle smile
    }
  };

  // Eyes height/angle based on state
  const getEyeHeight = () => {
    if (state === 'thinking') return 2;
    if (state === 'happy') return 1.5;
    return 4;
  };

  // Animations with framer-motion
  const breathingAnimation = {
    y: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  const gestureAnimation = () => {
    if (state === 'speaking') {
      return {
        rotate: [0, 8, -5, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
      };
    }
    if (state === 'thinking') {
      return {
        y: [0, -2, 0],
        x: [0, 1, 0],
        transition: { duration: 2, repeat: Infinity },
      };
    }
    return {};
  };

  const renderAccessories = () => {
    switch (styleId) {
      case 'professor':
        return (
          <g id="professor-caps-glasses">
            {/* Academic Glasses */}
            <rect x="36" y="44" width="10" height="7" rx="2" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="54" y="44" width="10" height="7" rx="2" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 46 47 L 54 47" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 36 47 Q 32 46 30 50" stroke="#1e293b" strokeWidth="1" fill="none" />
            <path d="M 64 47 Q 68 46 70 50" stroke="#1e293b" strokeWidth="1" fill="none" />
            
            {/* Academic Cap or Badge */}
            <path d="M 32 20 L 50 12 L 68 20 L 50 28 Z" fill={activeColor.dark} />
            <rect x="47" y="22" width="6" height="8" fill={activeColor.primary} />
            <circle cx="50" cy="12" r="2.5" fill="#f59e0b" />
            <path d="M 60 20 L 64 35 Q 63 38 61 38" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          </g>
        );
      case 'coach':
        return (
          <g id="coach-whistle-cap">
            {/* Sports Cap */}
            <path d="M 32 30 Q 50 14 68 30 Z" fill={activeColor.primary} />
            <path d="M 50 18 L 82 23 Q 84 26 80 29 L 62 29" stroke={activeColor.dark} strokeWidth="2.5" fill={activeColor.secondary} />
            
            {/* Whistle around Neck */}
            <circle cx="50" cy="85" r="4.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <path d="M 38 78 L 47 82 M 62 78 L 53 82" stroke="#475569" strokeWidth="1.5" />
          </g>
        );
      case 'friend':
        return (
          <g id="friend-hoodie-headphones">
            {/* Casual Headphones around neck */}
            <path d="M 30 75 Q 50 90 70 75" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <rect x="25" y="68" width="8" height="12" rx="3" fill={activeColor.primary} />
            <rect x="67" y="68" width="8" height="12" rx="3" fill={activeColor.primary} />
            
            {/* Friendly Cap/Hair Bow (if female) */}
            {isFemale ? (
              <path d="M 42 22 C 40 12, 60 12, 58 22 Z" fill="#f43f5e" />
            ) : (
              <path d="M 30 32 Q 50 16 70 32" stroke={activeColor.dark} strokeWidth="3" fill="none" />
            )}
          </g>
        );
      case 'expert':
        return (
          <g id="expert-scifi-tablet">
            {/* Smart Glasses / Earpiece */}
            <path d="M 60 45 L 68 45 L 68 52" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
            <circle cx="60" cy="45" r="2" fill="#06b6d4" />
            
            {/* Floating holo-diagram */}
            <motion.g
              animate={{
                opacity: [0.6, 0.9, 0.6],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <line x1="72" y1="35" x2="88" y2="35" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2" />
              <circle cx="80" cy="35" r="1.5" fill="#22d3ee" />
              <rect x="75" y="42" width="16" height="10" rx="1.5" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
              <path d="M 78 48 L 82 45 L 85 47 L 88 44" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
            </motion.g>
          </g>
        );
      case 'simplifier':
      default:
        return (
          <g id="simplifier-bulb">
            {/* Large round cute glasses */}
            <circle cx="38" cy="48" r="9" fill="none" stroke="#475569" strokeWidth="1.5" />
            <circle cx="62" cy="48" r="9" fill="none" stroke="#475569" strokeWidth="1.5" />
            <path d="M 47 48 L 53 48" stroke="#475569" strokeWidth="1.5" />
            
            {/* Floating idea light bulb */}
            {state === 'speaking' || state === 'happy' ? (
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                transition={{ duration: 0.5, repeat: state === 'speaking' ? Infinity : 0, repeatType: "reverse" }}
                className="origin-bottom"
              >
                {/* Bulb head */}
                <circle cx="82" cy="18" r="5" fill="#fbbf24" />
                <path d="M 79 22 L 85 22 L 83 25 L 81 25 Z" fill="#94a3b8" />
                {/* Glow lines */}
                <line x1="82" y1="10" x2="82" y2="7" stroke="#fbbf24" strokeWidth="1" />
                <line x1="75" y1="15" x2="72" y2="14" stroke="#fbbf24" strokeWidth="1" />
                <line x1="89" y1="15" x2="92" y2="14" stroke="#fbbf24" strokeWidth="1" />
              </motion.g>
            ) : null}
          </g>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dynamic Speech Bubble */}
      {state === 'speaking' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-16 -left-12 bg-white text-slate-800 text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 font-semibold z-30 max-w-[170px] leading-snug whitespace-normal text-left after:content-[''] after:absolute after:bottom-[-6px] after:right-[40px] after:w-3 after:h-3 after:bg-white after:rotate-45 after:border-r after:border-b after:border-slate-100 animate-bounce"
        >
          {styleId === 'professor' && "Let us verify this concept..."}
          {styleId === 'coach' && "Let's build this together! Go!"}
          {styleId === 'friend' && "So, think of it this way..."}
          {styleId === 'expert' && "This is a key best practice."}
          {styleId === 'simplifier' && "Step 1 is very simple..."}
        </motion.div>
      )}

      {/* SVG Character representation */}
      <motion.div animate={breathingAnimation} className="w-full h-full">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradients */}
          <defs>
            <radialGradient id="skinGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#fed7aa" />
            </radialGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activeColor.dark} />
              <stop offset="100%" stopColor={activeColor.primary} />
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={activeColor.primary} />
              <stop offset="100%" stopColor={activeColor.dark} />
            </linearGradient>
          </defs>

          {/* Neck */}
          <rect x="46" y="65" width="8" height="12" rx="2" fill="#fed7aa" stroke="#fdba74" strokeWidth="1" />

          {/* Torso/Shirt */}
          <path
            d="M 25 88 C 25 78, 38 72, 50 72 C 62 72, 75 78, 75 88 L 75 100 L 25 100 Z"
            fill="url(#shirtGrad)"
            stroke={activeColor.dark}
            strokeWidth="1"
          />

          {/* Hair (Back for long hair) */}
          {isFemale && (
            <path
              d="M 26 40 C 20 52, 22 75, 32 75 C 36 75, 40 70, 40 60 C 60 70, 64 75, 68 75 C 78 75, 80 52, 74 40 C 70 28, 30 28, 26 40 Z"
              fill="url(#hairGrad)"
            />
          )}

          {/* Head Base */}
          <circle cx="50" cy="50" r="19" fill="url(#skinGlow)" stroke="#fdba74" strokeWidth="1" />

          {/* Ears */}
          <circle cx="30" cy="50" r="3.5" fill="#fdba74" />
          <circle cx="70" cy="50" r="3.5" fill="#fdba74" />

          {/* Eyes */}
          <g id="eyes">
            {/* Left Eye */}
            <ellipse cx="40" cy="47" rx="2.5" ry={getEyeHeight()} fill="#1e293b" />
            <circle cx="39" cy="46" r="0.8" fill="#ffffff" />
            {/* Right Eye */}
            <ellipse cx="60" cy="47" rx="2.5" ry={getEyeHeight()} fill="#1e293b" />
            <circle cx="59" cy="46" r="0.8" fill="#ffffff" />
          </g>

          {/* Eyebrows */}
          <path
            d="M 36 41 Q 40 39 44 42"
            stroke="#1e293b"
            strokeWidth="1.2"
            fill="none"
            style={{
              transform: state === 'thinking' ? 'translateY(1.5px) rotate(4deg)' : 'none',
              transformOrigin: '40px 41px',
            }}
          />
          <path
            d="M 64 41 Q 60 39 56 42"
            stroke="#1e293b"
            strokeWidth="1.2"
            fill="none"
            style={{
              transform: state === 'thinking' ? 'translateY(-1px) rotate(-4deg)' : 'none',
              transformOrigin: '60px 41px',
            }}
          />

          {/* Nose */}
          <path d="M 50 49 L 49 54 L 52 54" stroke="#e0a96d" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Mouth */}
          <path
            d={getMouthPath()}
            stroke={state === 'speaking' ? activeColor.dark : '#475569'}
            strokeWidth="2"
            fill={state === 'speaking' ? '#f43f5e' : 'none'}
            strokeLinecap="round"
          />

          {/* Blush (if happy or speaking) */}
          {(state === 'happy' || state === 'speaking') && (
            <g id="blush" opacity="0.35">
              <circle cx="35" cy="54" r="2.5" fill="#f43f5e" />
              <circle cx="65" cy="54" r="2.5" fill="#f43f5e" />
            </g>
          )}

          {/* Hair (Front/Bangs) */}
          <path
            d={
              isFemale
                ? 'M 31 34 Q 50 25 69 34 C 64 28, 36 28, 31 34 Z'
                : 'M 29 36 Q 50 18 71 36 Q 73 28 65 24 Q 50 28 35 24 Q 27 28 29 36 Z'
            }
            fill="url(#hairGrad)"
            stroke={activeColor.dark}
            strokeWidth="0.5"
          />

          {/* Dynamic Accessories based on teacher style */}
          {renderAccessories()}

          {/* Hand Gestures */}
          <motion.g animate={gestureAnimation()} className="origin-bottom-right">
            {state === 'speaking' && (
              <path
                d="M 72 82 Q 88 64 85 58 C 82 52, 75 58, 70 70"
                stroke={activeColor.dark}
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            {state === 'speaking' && (
              // Teacher pointer stick
              <line x1="82" y1="56" x2="94" y2="35" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            )}
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};
