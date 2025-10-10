'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface OctopusDoodleProps {
  variant?: 'dashboard' | 'marketplace' | 'creative';
  className?: string;
}

export function OctopusDoodle({ variant = 'dashboard', className }: OctopusDoodleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const neonColor = '#ff29d8';
  const neonSecondary = '#ff74f1';

  const leftTentacles = [
    'M -110 10 C -230 20 -270 120 -190 176 S -40 250 -120 320 S -290 360 -200 270',
    'M -80 90 C -180 100 -210 190 -150 232 S -40 296 -90 336 S -200 348 -140 284',
    'M -60 150 C -150 160 -160 240 -110 270 S -30 310 -60 350',
    'M -40 210 C -120 220 -130 290 -80 316 S -10 350 -20 390'
  ];

  return (
    <div
      className={cn(
        'relative flex w-full min-h-[420px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#07010f] via-[#0d041c] to-[#1b052d]',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-[520px] aspect-square transition-all duration-700 ease-out',
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <svg viewBox="0 0 800 800" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="octoBackground" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#1c0a2f" />
              <stop offset="55%" stopColor="#0c0218" />
              <stop offset="100%" stopColor="#05010a" />
            </radialGradient>
            <linearGradient id="neonStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={neonSecondary} />
              <stop offset="100%" stopColor={neonColor} />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="800" height="800" fill="url(#octoBackground)" opacity="0.9" />

          {/* Ambient particles */}
          {[...Array(24)].map((_, index) => {
            const angle = (index / 24) * Math.PI * 2;
            const radius = 260 + (index % 4) * 24;
            const cx = 400 + Math.cos(angle) * radius;
            const cy = 360 + Math.sin(angle) * radius;
            return (
              <circle
                key={`particle-${index}`}
                cx={cx}
                cy={cy}
                r={index % 3 === 0 ? 6 : 4}
                fill={neonSecondary}
                opacity="0.25"
                className="particle"
                style={{ animationDelay: `${index * 0.08}s` }}
              />
            );
          })}

          <g filter="url(#neonGlow)">
            {/* Head */}
            <g transform="translate(400 320)">
              <path
                d="M -160 -40 C -160 -210 160 -210 160 -40 L 160 120 C 160 210 90 270 0 270 C -90 270 -160 210 -160 120 Z"
                fill="none"
                stroke="url(#neonStroke)"
                strokeWidth={18}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="neon-outline"
              />
            </g>

            {/* Eyes */}
            <g className="neon-outline">
              <circle cx="348" cy="310" r="26" fill="none" stroke="url(#neonStroke)" strokeWidth={16} />
              <circle cx="452" cy="310" r="26" fill="none" stroke="url(#neonStroke)" strokeWidth={16} />
            </g>

            {/* Tentacles - mirrored for symmetry */}
            <g transform="translate(400 470)">
              {leftTentacles.map((d, index) => (
                <path
                  key={`left-${index}`}
                  d={d}
                  fill="none"
                  stroke="url(#neonStroke)"
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="tentacle-path"
                  style={{ animationDelay: `${index * 0.15}s` }}
                />
              ))}
              {leftTentacles.map((d, index) => (
                <path
                  key={`right-${index}`}
                  d={d}
                  transform="scale(-1,1)"
                  fill="none"
                  stroke="url(#neonStroke)"
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="tentacle-path"
                  style={{ animationDelay: `${index * 0.15 + 0.2}s` }}
                />
              ))}
            </g>

            {/* Crown ring */}
            <circle
              cx="400"
              cy="460"
              r="210"
              fill="none"
              stroke="url(#neonStroke)"
              strokeWidth={6}
              opacity="0.35"
              className="neon-pulse"
            />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .tentacle-path {
          stroke-dasharray: 620;
          stroke-dashoffset: 620;
          animation: neonDraw 2.6s ease forwards, neonPulse 3.4s ease-in-out infinite;
        }

        .neon-outline {
          animation: neonPulse 3.2s ease-in-out infinite;
        }

        .neon-pulse {
          animation: ripple 6s ease-in-out infinite;
        }

        .particle {
          animation: particleFloat 4.2s ease-in-out infinite;
        }

        @keyframes neonDraw {
          0% {
            stroke-dashoffset: 620;
            opacity: 0;
          }
          25% {
            opacity: 0.6;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes neonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 14px rgba(255, 41, 216, 0.45));
          }
          45% {
            filter: drop-shadow(0 0 22px rgba(255, 116, 241, 0.75));
          }
          60% {
            filter: drop-shadow(0 0 30px rgba(255, 41, 216, 0.9));
          }
        }

        @keyframes ripple {
          0% {
            opacity: 0.1;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            opacity: 0.2;
            transform: translateY(0px);
          }
          50% {
            opacity: 0.45;
            transform: translateY(-12px);
          }
        }
      `}</style>
    </div>
  );
}
