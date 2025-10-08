/**
 * Animation Utilities — Reusable animation primitives
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import { duration, easing } from '../core/tokens/motion.tokens';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get safe animation duration
 * Returns 0 if user prefers reduced motion
 */
export const getSafeDuration = (animDuration: string): string => {
  return prefersReducedMotion() ? '0ms' : animDuration;
};

/**
 * Fade animation classes
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.easeInOut,
  },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.easeOut,
  },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.easeOut,
  },
};

/**
 * Scale animation classes
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: {
    duration: getSafeDuration(duration.fast),
    easing: easing.easeOut,
  },
};

export const scaleUp = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.spring,
  },
};

/**
 * Slide animation classes
 */
export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.easeOut,
  },
};

export const slideInLeft = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: {
    duration: getSafeDuration(duration.normal),
    easing: easing.easeOut,
  },
};

/**
 * Stagger animation for lists
 */
export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * CSS Animation class generators
 */
export const getAnimationClass = (
  name: 'fade-in' | 'fade-out' | 'slide-up' | 'slide-down' | 'scale-in' | 'scale-out',
  customDuration?: string
) => {
  const dur = customDuration || duration.normal;
  const safeDur = getSafeDuration(dur);
  
  return `animate-${name} duration-[${safeDur}]`;
};

/**
 * Transition utilities
 */
export const transition = {
  fast: `transition-all duration-[${duration.fast}] ease-out`,
  normal: `transition-all duration-[${duration.normal}] ease-out`,
  slow: `transition-all duration-[${duration.slow}] ease-out`,
  colors: `transition-colors duration-[${duration.fast}]`,
  transform: `transition-transform duration-[${duration.normal}] ease-out`,
  opacity: `transition-opacity duration-[${duration.fast}]`,
};

/**
 * Hover animations
 */
export const hoverScale = 'hover:scale-105 transition-transform duration-200';
export const hoverLift = 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200';
export const hoverGlow = 'hover:shadow-glow transition-shadow duration-200';

/**
 * Loading animations
 */
export const spin = 'animate-spin';
export const pulse = 'animate-pulse';
export const bounce = 'animate-bounce';

/**
 * Create a stagger animation sequence
 */
export function createStagger(baseDelay: number = 100) {
  return (index: number) => ({
    animationDelay: `${index * baseDelay}ms`,
  });
}

/**
 * Motion-safe wrapper
 * Only applies animation if user doesn't prefer reduced motion
 */
export function motionSafe(animationClass: string): string {
  return prefersReducedMotion() ? '' : animationClass;
}
