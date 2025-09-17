'use client';

// Standardized animation system for consistent UI behavior
export const animations = {
  // Duration constants
  duration: {
    instant: 'duration-0',
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500'
  },
  
  // Easing functions
  easing: {
    default: 'ease-out',
    smooth: 'ease-in-out',
    bounce: 'ease-bounce',
    sharp: 'ease-in'
  },
  
  // Common transition combinations
  transitions: {
    // Standard hover effects
    hover: 'transition-all duration-200 ease-out',
    hoverSlow: 'transition-all duration-300 ease-out',
    
    // Color transitions
    colors: 'transition-colors duration-200 ease-out',
    
    // Transform effects
    transform: 'transition-transform duration-200 ease-out',
    
    // Shadow effects
    shadow: 'transition-shadow duration-200 ease-out',
    
    // Opacity changes
    opacity: 'transition-opacity duration-200 ease-out',
    
    // Layout changes (use sparingly for performance)
    layout: 'transition-all duration-300 ease-in-out'
  },
  
  // Hover effects
  hover: {
    // Scale effects
    scaleUp: 'hover:scale-105',
    scaleDown: 'hover:scale-95',
    scaleSubtle: 'hover:scale-102',
    
    // Shadow effects
    shadowSm: 'hover:shadow-sm',
    shadowMd: 'hover:shadow-md',
    shadowLg: 'hover:shadow-lg',
    shadowXl: 'hover:shadow-xl',
    shadow2xl: 'hover:shadow-2xl',
    
    // Transform effects
    translateX: 'hover:translate-x-1',
    translateY: 'hover:-translate-y-1',
    
    // Opacity effects
    opacityUp: 'hover:opacity-100',
    opacityDown: 'hover:opacity-80'
  },
  
  // Loading animations
  loading: {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    ping: 'animate-ping'
  },
  
  // Group hover effects (for parent-child interactions)
  groupHover: {
    scaleUp: 'group-hover:scale-105',
    translateX: 'group-hover:translate-x-1',
    translateY: 'group-hover:-translate-y-1',
    opacityUp: 'group-hover:opacity-100',
    opacityDown: 'group-hover:opacity-80'
  }
};

// Utility function to combine animation classes
export function combineAnimations(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

// Pre-built animation combinations for common use cases
export const animationPresets = {
  // Button animations
  button: combineAnimations(
    animations.transitions.hover,
    animations.hover.scaleSubtle
  ),
  
  buttonPrimary: combineAnimations(
    animations.transitions.hover,
    animations.hover.scaleSubtle,
    animations.hover.shadowMd
  ),
  
  // Card animations
  card: combineAnimations(
    animations.transitions.shadow,
    animations.hover.shadowLg
  ),
  
  cardInteractive: combineAnimations(
    animations.transitions.hover,
    animations.hover.scaleSubtle,
    animations.hover.shadowXl
  ),
  
  // Icon animations
  icon: combineAnimations(
    animations.transitions.transform,
    animations.groupHover.translateX
  ),
  
  iconRotate: combineAnimations(
    animations.transitions.transform,
    'group-hover:rotate-12'
  ),
  
  // Loading states
  loadingSkeleton: combineAnimations(
    animations.loading.pulse,
    'bg-secondary rounded'
  ),
  
  loadingSpinner: combineAnimations(
    animations.loading.spin,
    'rounded-full border-2 border-muted border-t-primary'
  ),
  
  // Fade transitions
  fadeIn: combineAnimations(
    animations.transitions.opacity,
    'opacity-0 animate-in fade-in'
  ),
  
  fadeOut: combineAnimations(
    animations.transitions.opacity,
    'opacity-100 animate-out fade-out'
  )
};

export default animations;
