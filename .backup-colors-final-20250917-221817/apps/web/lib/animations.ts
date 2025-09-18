/**
 * Enterprise-grade animation utilities with enhanced micro-interactions
 * Provides consistent animation patterns across the application with performance optimization
 */

import { useState } from 'react';

export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-[var(--motion-duration-normal)]',
  fadeOut: 'animate-out fade-out duration-[var(--motion-duration-fast)]',
  
  // Slide animations
  slideInFromBottom: 'animate-in slide-in-from-bottom-sm duration-[var(--motion-duration-normal)]',
  slideInFromTop: 'animate-in slide-in-from-top-sm duration-[var(--motion-duration-normal)]',
  slideInFromLeft: 'animate-in slide-in-from-left-md duration-[var(--motion-duration-normal)]',
  slideInFromRight: 'animate-in slide-in-from-right-md duration-[var(--motion-duration-normal)]',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-[var(--motion-duration-fast)]',
  scaleOut: 'animate-out zoom-out-95 duration-[var(--motion-duration-fast)]',
  
  // Combined animations
  fadeSlideIn: 'animate-in fade-in slide-in-from-bottom-sm duration-[var(--motion-duration-normal)]',
  fadeSlideOut: 'animate-out fade-out slide-out-to-bottom-sm duration-[var(--motion-duration-fast)]',
  
  // Progress animations
  progressFill: 'transition-all duration-[var(--motion-duration-slow)] ease-[var(--motion-easing-standard)]',
  
  // Button animations
  buttonPress: 'active:scale-95 transition-transform duration-[var(--motion-duration-instant)]',
  buttonHover: 'hover:scale-105 transition-transform duration-[var(--motion-duration-fast)]',
  
  // Loading animations
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  
  // Stagger animations for lists
  staggerDelay: {
    1: 'animation-delay-[var(--motion-duration-instant)]',
    2: 'animation-delay-[var(--motion-duration-fast)]', 
    3: 'animation-delay-[var(--motion-duration-normal)]',
    4: 'animation-delay-[var(--motion-duration-slow)]'
  }
};

export const transitions = {
  // Standard transitions
  default: 'transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]',
  fast: 'transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]',
  slow: 'transition-all duration-[var(--motion-duration-normal)] ease-[var(--motion-easing-standard)]',
  
  // Specific property transitions
  colors: 'transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]',
  transform: 'transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]',
  opacity: 'transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)]',
  
  // Easing functions
  easing: {
    linear: 'ease-[var(--motion-easing-linear)]',
    in: 'ease-[var(--motion-easing-ease-in)]',
    out: 'ease-[var(--motion-easing-ease-out)]',
    inOut: 'ease-[var(--motion-easing-standard)]',
    bounce: 'ease-[var(--motion-easing-bounce)]'
  }
};

// Animation presets for common UI patterns
export const animationPresets = {
  // Card entrance
  cardEnter: `${animations.fadeSlideIn as string} ${transitions.slow as string}`,
  
  // Form field focus
  fieldFocus: `${transitions.colors as string} focus:ring-primary focus:ring-primary focus:border-transparent`,
  
  // Button interactions
  button: `${animations.buttonPress as string} ${transitions.colors as string}`,
  
  // Progress indicator
  progress: `${animations.progressFill as string}`,
  
  // Step transitions
  stepTransition: `${animations.fadeSlideIn as string}`,
  
  // Error states
  errorShake: 'animate-pulse duration-200',
  
  // Success states
  successScale: `${animations.scaleIn as string}`,
  
  // Loading states
  loadingPulse: `${animations.pulse as string}`,
  
  // Onboarding specific
  onboardingCard: `${animations.fadeSlideIn as string}`,
  stepProgress: `${animations.progressFill as string}`,
  completionIcon: `${animations.scaleIn as string} ${(transitions.easing as any).bounce as string}`
};

// Hook for managing animation states
export function useAnimationState(initialState = false) {
  const [isAnimating, setIsAnimating] = useState(initialState);
  
  const startAnimation = () => setIsAnimating(true);
  const stopAnimation = () => setIsAnimating(false);
  
  return {
    isAnimating,
    startAnimation,
    stopAnimation,
    animationClass: isAnimating ? (animations.fadeIn as string) : ''
  };
}

// Utility for creating staggered animations
export function createStaggeredAnimation(items: any[], baseDelay = 'var(--motion-duration-fast)') {
  return items.map((item, index) => ({
    ...item,
    style: {
      ...(item.style || {}),
      animationDelay: `calc(${baseDelay} * ${index})`
    }
  }));
}
