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
    // Start animation after component mounts
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getVariantContent = () => {
    switch (variant) {
      case 'dashboard':
        return {
          title: 'Project Dashboard',
          subtitle: 'Manage your creative workflow',
          features: ['Real-time collaboration', 'AI-powered insights', 'Automated reporting']
        };
      case 'marketplace':
        return {
          title: 'Talent Marketplace',
          subtitle: 'Connect with creative professionals',
          features: ['Verified talent pool', 'Instant matching', 'Secure payments']
        };
      case 'creative':
        return {
          title: 'Creative Suite',
          subtitle: 'Everything you need in one place',
          features: ['Asset management', 'Team collaboration', 'Version control']
        };
      default:
        return {
          title: 'GHXSTSHIP Platform',
          subtitle: 'Production management reimagined',
          features: ['Unified workspace', 'Smart automation', 'Enterprise security']
        };
    }
  };

  const content = getVariantContent();

  return (
    <div className={cn('relative w-full h-full min-h-[400px] flex items-center justify-center', className)}>
      {/* Doodle Container */}
      <div className="relative w-full max-w-2xl aspect-square">
        {/* Animated Octopus SVG */}
        <svg
          viewBox="0 0 800 800"
          className={cn(
            'w-full h-full transition-all duration-1000 ease-out',
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Elements */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Doodle pattern */}
            <pattern id="doodlePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.1"/>
              <circle cx="25" cy="25" r="1" fill="currentColor" opacity="0.1"/>
            </pattern>
          </defs>

          {/* Background pattern */}
          <rect width="800" height="800" fill="url(#doodlePattern)" className="text-foreground"/>

          {/* Octopus Body - Main circle */}
          <g className="octopus-body" style={{ transformOrigin: '400px 300px' }}>
            <circle
              cx="400"
              cy="300"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-accent animate-pulse"
              style={{ animationDuration: '3s' }}
            />
            <circle
              cx="400"
              cy="300"
              r="110"
              fill="currentColor"
              className="text-accent/10"
            />
          </g>

          {/* Octopus Eyes */}
          <g className="octopus-eyes">
            {/* Left eye */}
            <circle cx="370" cy="280" r="20" fill="currentColor" className="text-background" />
            <circle 
              cx="375" 
              cy="280" 
              r="10" 
              fill="currentColor" 
              className="text-foreground animate-pulse"
              style={{ animationDuration: '2s' }}
            />
            
            {/* Right eye */}
            <circle cx="430" cy="280" r="20" fill="currentColor" className="text-background" />
            <circle 
              cx="435" 
              cy="280" 
              r="10" 
              fill="currentColor" 
              className="text-foreground animate-pulse"
              style={{ animationDuration: '2s', animationDelay: '0.1s' }}
            />
          </g>

          {/* Smile */}
          <path
            d="M 370 320 Q 400 340 430 320"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-foreground"
          />

          {/* Octopus Tentacles - 8 animated tentacles */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i * 45) - 90;
            const rad = (angle * Math.PI) / 180;
            const startX = 400 + Math.cos(rad) * 120;
            const startY = 300 + Math.sin(rad) * 120;
            const controlX = 400 + Math.cos(rad) * 200;
            const controlY = 300 + Math.sin(rad) * 200;
            const endX = 400 + Math.cos(rad) * 280 + (Math.sin(i) * 30);
            const endY = 300 + Math.sin(rad) * 280 + (Math.cos(i) * 30);

            return (
              <g key={i} className="tentacle">
                <path
                  d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  style={{
                    animation: `tentacle-wave 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    transformOrigin: `${startX}px ${startY}px`
                  }}
                />
                {/* Suction cups */}
                {[0.3, 0.5, 0.7, 0.9].map((t, idx) => {
                  const suctionX = startX + (endX - startX) * t;
                  const suctionY = startY + (endY - startY) * t;
                  return (
                    <circle
                      key={idx}
                      cx={suctionX}
                      cy={suctionY}
                      r="6"
                      fill="currentColor"
                      className="text-secondary"
                      opacity="0.6"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Floating Icons - representing features */}
          <g className="floating-elements">
            {/* Checkmark - top left */}
            <g transform="translate(150, 150)" className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0s' }}>
              <circle cx="0" cy="0" r="25" fill="currentColor" className="text-success/20"/>
              <path
                d="M -10 0 L -5 10 L 10 -10"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              />
            </g>

            {/* Star - top right */}
            <g transform="translate(650, 150)" className="animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>
              <circle cx="0" cy="0" r="25" fill="currentColor" className="text-warning/20"/>
              <path
                d="M 0 -12 L 3 -3 L 12 -3 L 5 3 L 8 12 L 0 6 L -8 12 L -5 3 L -12 -3 L -3 -3 Z"
                fill="currentColor"
                className="text-warning"
              />
            </g>

            {/* Lightning - bottom left */}
            <g transform="translate(150, 500)" className="animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.6s' }}>
              <circle cx="0" cy="0" r="25" fill="currentColor" className="text-accent/20"/>
              <path
                d="M 5 -12 L -5 2 L 2 2 L -3 12 L 5 0 L -2 0 Z"
                fill="currentColor"
                className="text-accent"
              />
            </g>

            {/* Heart - bottom right */}
            <g transform="translate(650, 500)" className="animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.9s' }}>
              <circle cx="0" cy="0" r="25" fill="currentColor" className="text-destructive/20"/>
              <path
                d="M 0 4 L -6 -4 Q -10 -8 -6 -12 Q 0 -8 0 -4 Q 0 -8 6 -12 Q 10 -8 6 -4 Z"
                fill="currentColor"
                className="text-destructive"
              />
            </g>
          </g>

          {/* Decorative circles around octopus */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={400 + Math.cos((i * 72 * Math.PI) / 180) * 200}
              cy={300 + Math.sin((i * 72 * Math.PI) / 180) * 200}
              r="4"
              fill="currentColor"
              className="text-muted-foreground"
              opacity="0.3"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </svg>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={cn(
            'text-center space-y-md transition-all duration-1000 delay-500',
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <h3 className="text-heading-3 text-foreground uppercase">{content.title}</h3>
            <p className="text-body-sm color-muted max-w-md">{content.subtitle}</p>
          </div>
        </div>

        {/* Feature Pills floating around */}
        <div className="absolute inset-0 pointer-events-none">
          {content.features.map((feature, i) => (
            <div
              key={i}
              className={cn(
                'absolute px-md py-sm bg-background/90 border-2 border-accent rounded-full',
                'text-body-sm form-label shadow-lg backdrop-blur-sm',
                'transition-all duration-1000',
                isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              )}
              style={{
                top: `${[20, 50, 80][i]}%`,
                left: i === 1 ? '50%' : i === 0 ? '10%' : '80%',
                transform: i === 1 ? 'translateX(-50%)' : 'translateX(0)',
                transitionDelay: `${(i + 1) * 200}ms`
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes tentacle-wave {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          50% {
            transform: rotate(5deg) translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
