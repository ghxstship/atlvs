/**
 * Motion Tokens v2.0 — Animation System
 * Apple-grade motion design with GPU acceleration
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Duration tokens
 * Based on 100ms increments for consistent timing
 */
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

/**
 * Easing functions
 * Optimized for natural motion
 */
export const easing = {
  // Standard easings
  linear: 'linear',
  
  // Ease curves
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  
  // Cubic bezier (Apple-style)
  'ease-apple': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  'ease-in-apple': 'cubic-bezier(0.4, 0.0, 1, 1)',
  'ease-out-apple': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  'ease-in-out-apple': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Spring (bouncy)
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'spring-subtle': 'cubic-bezier(0.5, 1.25, 0.75, 1)',
  
  // Sharp (snappy)
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Smooth (gentle)
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

/**
 * Semantic Motion Presets
 * Common animation combinations
 */
export const motion = {
  // Fade animations
  'fade-in': {
    duration: duration.normal,
    easing: easing['ease-out-apple'],
    properties: 'opacity',
  },
  'fade-out': {
    duration: duration.fast,
    easing: easing['ease-in-apple'],
    properties: 'opacity',
  },
  
  // Slide animations
  'slide-in': {
    duration: duration.normal,
    easing: easing['ease-out-apple'],
    properties: 'transform, opacity',
  },
  'slide-out': {
    duration: duration.fast,
    easing: easing['ease-in-apple'],
    properties: 'transform, opacity',
  },
  
  // Scale animations
  'scale-in': {
    duration: duration.normal,
    easing: easing.spring,
    properties: 'transform, opacity',
  },
  'scale-out': {
    duration: duration.fast,
    easing: easing['ease-in'],
    properties: 'transform, opacity',
  },
  
  // Interactive feedback
  hover: {
    duration: duration.fast,
    easing: easing['ease-out'],
    properties: 'all',
  },
  press: {
    duration: duration.instant,
    easing: easing.linear,
    properties: 'transform',
  },
  
  // Loading states
  pulse: {
    duration: duration.slower,
    easing: easing['ease-in-out'],
    properties: 'opacity',
  },
  spin: {
    duration: duration.slowest,
    easing: easing.linear,
    properties: 'transform',
  },
  
  // Page transitions
  'page-enter': {
    duration: duration.normal,
    easing: easing['ease-out-apple'],
    properties: 'transform, opacity',
  },
  'page-exit': {
    duration: duration.fast,
    easing: easing['ease-in-apple'],
    properties: 'transform, opacity',
  },
  
  // Modal/Drawer
  'modal-enter': {
    duration: duration.normal,
    easing: easing['ease-out-apple'],
    properties: 'transform, opacity',
  },
  'modal-exit': {
    duration: duration.fast,
    easing: easing['ease-in-apple'],
    properties: 'transform, opacity',
  },
  
  // Tooltip/Popover
  'tooltip-enter': {
    duration: duration.fast,
    easing: easing['ease-out'],
    properties: 'transform, opacity',
  },
  'tooltip-exit': {
    duration: duration.fast,
    easing: easing['ease-in'],
    properties: 'transform, opacity',
  },
} as const;

/**
 * Transition presets
 * CSS transition strings ready to use
 */
export const transitions = {
  // All properties
  all: `all ${duration.normal} ${easing['ease-apple']}`,
  'all-fast': `all ${duration.fast} ${easing['ease-apple']}`,
  'all-slow': `all ${duration.slow} ${easing['ease-apple']}`,
  
  // Color transitions
  colors: `color ${duration.fast} ${easing['ease-out']}, background-color ${duration.fast} ${easing['ease-out']}, border-color ${duration.fast} ${easing['ease-out']}`,
  
  // Transform transitions
  transform: `transform ${duration.normal} ${easing['ease-out-apple']}`,
  'transform-fast': `transform ${duration.fast} ${easing['ease-out-apple']}`,
  
  // Opacity transitions
  opacity: `opacity ${duration.normal} ${easing['ease-out-apple']}`,
  'opacity-fast': `opacity ${duration.fast} ${easing['ease-out-apple']}`,
  
  // Size transitions
  size: `width ${duration.normal} ${easing['ease-out-apple']}, height ${duration.normal} ${easing['ease-out-apple']}`,
  
  // Shadow transitions
  shadow: `box-shadow ${duration.normal} ${easing['ease-out-apple']}`,
  
  // Interactive
  interactive: `transform ${duration.fast} ${easing['ease-out']}, opacity ${duration.fast} ${easing['ease-out']}, box-shadow ${duration.fast} ${easing['ease-out']}`,
} as const;

/**
 * Keyframe Animations
 * Reusable keyframe definitions
 */
export const keyframes = {
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  'fade-out': {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  'slide-in-up': {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  'slide-in-down': {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  'slide-in-left': {
    from: { transform: 'translateX(-10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  'slide-in-right': {
    from: { transform: 'translateX(10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  'scale-in': {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  'scale-out': {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-5px)' },
    '75%': { transform: 'translateX(5px)' },
  },
} as const;

/**
 * Reduced Motion Support
 * Fallback animations for prefers-reduced-motion
 */
export const reducedMotion = {
  duration: duration.instant,
  easing: easing.linear,
  transition: 'none',
} as const;

/**
 * Motion Types
 */
export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
export type MotionPreset = keyof typeof motion;
export type TransitionPreset = keyof typeof transitions;
export type KeyframeAnimation = keyof typeof keyframes;

/**
 * Get CSS animation string
 */
export function getAnimation(
  name: KeyframeAnimation,
  durationToken: DurationToken = 'normal',
  easingToken: EasingToken = 'ease-apple'
): string {
  return `${name} ${duration[durationToken]} ${easing[easingToken]}`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get motion-safe transition
 * Returns instant transition if reduced motion is preferred
 */
export function getMotionSafeTransition(transitionPreset: TransitionPreset): string {
  if (prefersReducedMotion()) {
    return reducedMotion.transition;
  }
  return transitions[transitionPreset];
}

/**
 * Export all motion tokens
 */
export const motionTokens = {
  duration,
  easing,
  motion,
  transitions,
  keyframes,
  reducedMotion,
} as const;
