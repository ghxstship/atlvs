'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';
import { useMicroInteraction } from '../micro-interactions/MicroInteractions';

// 3D Card variants
const card3DVariants = cva(
  'relative transition-all duration-300 ease-out transform-gpu backface-hidden',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border',
        elevated: 'bg-background shadow-floating border border-border',
        glass: 'bg-background/80 backdrop-blur-sm border border-border/20',
        holographic: 'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20',
        floating: 'bg-background shadow-popover border-0',
      },
      size: {
        sm: 'p-md rounded-lg',
        md: 'p-lg rounded-xl',
        lg: 'p-xl rounded-2xl',
        xl: 'p-2xl rounded-3xl',
      },
      depth: {
        none: '',
        shallow: 'shadow-surface hover:shadow-elevated',
        medium: 'shadow-elevated hover:shadow-floating',
        deep: 'shadow-floating hover:shadow-modal',
        extreme: 'shadow-modal hover:shadow-popover',
      },
      interaction: {
        none: '',
        hover: 'hover:scale-105 hover:-translate-y-2',
        tilt: 'hover:rotate-1 hover:scale-105',
        float: 'hover:-translate-y-4 hover:scale-102',
        flip: 'hover:rotateY-5 hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      depth: 'medium',
      interaction: 'hover',
    },
  }
);

interface Card3DProps extends VariantProps<typeof card3DVariants> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  disabled?: boolean;
  glowColor?: string;
  parallaxIntensity?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
  enableParallax?: boolean;
  holographicEffect?: boolean;
}

export function Card3D({
  children,
  className,
  onClick,
  onHover,
  disabled = false,
  variant,
  size,
  depth,
  interaction,
  glowColor = 'hsl(var(--color-primary) / 0.5)',
  parallaxIntensity = 10,
  enableTilt = true,
  enableGlow = false,
  enableParallax = false,
  holographicEffect = false,
}: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tiltAngles, setTiltAngles] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { trigger } = useMicroInteraction();

  // Mouse move handler for tilt effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / rect.height) * -parallaxIntensity;
    const rotateY = (mouseX / rect.width) * parallaxIntensity;
    
    setMousePosition({ x: mouseX, y: mouseY });
    setTiltAngles({ x: rotateX, y: rotateY });
  }, [enableTilt, parallaxIntensity]);

  // Mouse enter handler
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover?.(true);
    
    if (!disabled) {
      trigger({
        haptic: 'light',
        sound: 'pop',
        intensity: 'subtle',
      });
    }
  }, [onHover, disabled, trigger]);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTiltAngles({ x: 0, y: 0 });
    setMousePosition({ x: 0, y: 0 });
    onHover?.(false);
  }, [onHover]);

  // Click handler
  const handleClick = useCallback(() => {
    if (disabled) return;
    
    trigger({
      haptic: 'medium',
      sound: 'click',
      animation: 'bounce',
      intensity: 'normal',
    });
    
    onClick?.();
  }, [disabled, onClick, trigger]);

  // Dynamic styles based on state
  const dynamicStyles = {
    transform: enableTilt 
      ? `perspective(1000px) rotateX(${tiltAngles.x}deg) rotateY(${tiltAngles.y}deg) ${isHovered ? 'translateZ(20px)' : 'translateZ(0px)'}`
      : undefined,
    boxShadow: enableGlow && isHovered 
      ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}` 
      : undefined,
    background: holographicEffect && isHovered
      ? `linear-gradient(135deg, 
          hsl(${200 + mousePosition.x * 0.1}, 70%, 60%) 0%, 
          hsl(${280 + mousePosition.y * 0.1}, 70%, 60%) 100%)`
      : undefined,
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        card3DVariants({ variant, size, depth, interaction }),
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && onClick && 'cursor-pointer',
        enableTilt && 'transform-style-preserve-3d',
        className
      )}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e: any) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Holographic overlay */}
      {holographicEffect && (
        <div 
          className="absolute inset-0 rounded-inherit opacity-0 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: isHovered ? 0.1 : 0,
            background: `radial-gradient(circle at ${mousePosition.x + 50}% ${mousePosition.y + 50}%, 
              hsl(var(--color-background) / 0.8) 0%, 
              transparent 50%)`,
          }}
        />
      )}

      {/* Parallax content wrapper */}
      {enableParallax ? (
        <div
          className="relative z-10"
          style={{
            transform: `translateX(${mousePosition.x * 0.02}px) translateY(${mousePosition.y * 0.02}px)`,
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}

      {/* Glow effect overlay */}
      {enableGlow && isHovered && (
        <div 
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
}

// Specialized 3D card variants
interface ProjectCard3DProps {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  progress?: number;
  dueDate?: string;
  onClick?: () => void;
}

export function ProjectCard3D({ title, description, status, progress, dueDate, onClick }: ProjectCard3DProps) {
  const statusColors = {
    active: 'bg-success/10 text-success',
    completed: 'bg-accent/10 text-accent',
    pending: 'bg-warning/10 text-warning',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card3D
      variant="elevated"
      size="md"
      depth="deep"
      interaction="tilt"
      enableTilt={true}
      enableGlow={true}
      glowColor={status === 'active' ? 'hsl(var(--color-success) / 0.3)' : 'hsl(var(--color-primary) / 0.3)'}
      onClick={onClick}
      className="group"
    >
      <div className="space-y-md">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <span className={cn('px-sm py-xs rounded-full text-xs font-medium', statusColors[status])}>
            {status}
          </span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {description}
        </p>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="space-y-xs">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Due date */}
        {dueDate && (
          <div className="text-xs text-muted-foreground">
            Due: {dueDate}
          </div>
        )}
      </div>
    </Card3D>
  );
}

interface MetricCard3DProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function MetricCard3D({ title, value, change, trend, icon, onClick }: MetricCard3DProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card3D
      variant="glass"
      size="md"
      depth="medium"
      interaction="float"
      enableTilt={true}
      holographicEffect={true}
      onClick={onClick}
      className="group"
    >
      <div className="space-y-sm">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground group-hover:text-accent transition-colors">
            {icon}
          </div>
          {change !== undefined && trend && (
            <div className={cn('text-sm font-medium', trendColors[trend])}>
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform">
          {value}
        </div>

        {/* Title */}
        <div className="text-sm text-muted-foreground">
          {title}
        </div>
      </div>
    </Card3D>
  );
}

// 3D Card Grid for layouts
interface Card3DGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card3DGrid({ children, columns = 3, gap = 'md', className }: Card3DGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-md',
    md: 'gap-lg',
    lg: 'gap-xl',
  };

  return (
    <div className={cn('grid', gridClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}
