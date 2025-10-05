// ==========================================
// MARKETING MOTION SYSTEM
// ==========================================
// Centralized animation tokens and interaction patterns for marketing UI components
// Provides accessibility-compliant, performance-optimized animations

import { DESIGN_TOKENS } from '../../tokens/unified-design-tokens';

// ==========================================
// ANIMATION TOKENS
// ==========================================

export const ANIMATION_TOKENS = {
  // Duration tokens (using design system durations)
  duration: {
    instant: DESIGN_TOKENS.animation.duration.instant,
    fast: DESIGN_TOKENS.animation.duration.fast,
    normal: DESIGN_TOKENS.animation.duration.normal,
    slow: DESIGN_TOKENS.animation.duration.slow,
    slower: DESIGN_TOKENS.animation.duration.slower,
  },

  // Easing tokens (using design system easings)
  easing: DESIGN_TOKENS.animation.easing,

  // Standardized durations for marketing interactions
  interaction: {
    tap: '75ms',      // Instant feedback for taps/clicks
    hover: '150ms',   // Quick hover feedback
    settle: '300ms',  // Natural settling time
    entrance: '500ms', // Page/section entrances
    exit: '200ms',    // Smooth exits
  },
} as const;

// ==========================================
// MARKETING ANIMATION PATTERNS
// ==========================================

export const MARKETING_ANIMATIONS = {
  // Interactive Element Animations
  interactive: {
    // Card hover effects
    card: {
      hover: 'transition-all duration-normal ease-out hover:shadow-elevation-3 hover:-translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-elevation-1',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background',
      active: 'active:scale-95 active:transition-transform active:duration-fast motion-reduce:active:scale-100',
      tap: 'active:scale-98 active:transition-transform active:duration-instant motion-reduce:active:scale-100',
    },

    // Button hover effects
    button: {
      primary: 'transition-all duration-fast ease-out hover:scale-105 hover:shadow-elevation-2 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
      secondary: 'transition-all duration-fast ease-out hover:bg-accent/10 hover:text-accent active:scale-98 motion-reduce:hover:bg-accent/10 motion-reduce:active:scale-100',
      ghost: 'transition-all duration-fast ease-out hover:bg-muted active:scale-98 motion-reduce:hover:bg-muted motion-reduce:active:scale-100',
      cta: 'transition-all duration-normal ease-out hover:scale-105 hover:shadow-primary/25 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
    },

    // Link hover effects
    link: {
      default: 'transition-colors duration-fast ease-out hover:text-accent',
      arrow: 'group transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0',
      underline: 'transition-all duration-fast ease-out hover:underline hover:underline-offset-4',
    },

    // Icon hover effects
    icon: {
      default: 'transition-transform duration-fast ease-out hover:scale-110 motion-reduce:hover:scale-100',
      rotate: 'transition-transform duration-normal ease-out hover:rotate-12 motion-reduce:hover:rotate-0',
      bounce: 'transition-transform duration-normal ease-out hover:scale-110 hover:-translate-y-1 motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0',
    },

    // Image hover effects
    image: {
      lift: 'transition-transform duration-normal ease-out hover:-translate-y-2 motion-reduce:hover:translate-y-0',
      zoom: 'transition-transform duration-normal ease-out hover:scale-105 motion-reduce:hover:scale-100',
      overlay: 'transition-all duration-normal ease-out hover:brightness-110 hover:contrast-105 motion-reduce:hover:brightness-100 motion-reduce:hover:contrast-100',
    },
  },

  // Micro-interactions
  micro: {
    // Subtle entrance animations
    fadeIn: 'opacity-0 animate-[fade-in_0.6s_ease-out_forwards]',
    slideUp: 'translate-y-4 animate-[slide-up_0.5s_ease-out_forwards]',
    scaleIn: 'scale-95 animate-[scale-in_0.3s_ease-out_forwards]',
    slideInLeft: 'translate-x-4 animate-[slide-in-left_0.4s_ease-out_forwards]',
    slideInRight: 'translate-x-4 animate-[slide-in-right_0.4s_ease-out_forwards]',

    // Loading states
    pulse: 'animate-pulse',
    shimmer: 'animate-pulse',
    spin: 'animate-spin',

    // Status feedback
    success: 'bg-success/10 text-success animate-[pulse-glow_0.6s_ease-out]',
    error: 'bg-destructive/10 text-destructive animate-[shake_0.4s_ease-out]',
    warning: 'bg-warning/10 text-warning animate-[pulse-glow_0.6s_ease-out]',
    info: 'bg-info/10 text-info animate-[pulse-glow_0.6s_ease-out]',
  },

  // Page-level animations
  page: {
    // Section entrance animations
    section: 'opacity-0 translate-y-8 animate-[fade-in-up_0.8s_ease-out_forwards]',
    stagger: 'opacity-0 translate-y-4 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]',
    hero: 'opacity-0 scale-95 animate-[hero-entrance_1s_ease-out_forwards]',

    // Content reveal animations
    reveal: 'opacity-0 translate-y-6 animate-[reveal_0.6s_ease-out_forwards]',
    staggerReveal: 'opacity-0 translate-y-4 animate-[reveal_0.6s_ease-out_0.15s_forwards]',
  },

  // Navigation animations
  navigation: {
    dropdown: 'transition-all duration-normal ease-out',
    mobileMenu: 'transition-all duration-fast ease-out',
    tab: 'transition-all duration-fast ease-out hover:bg-muted/50',
    breadcrumb: 'transition-colors duration-fast ease-out hover:text-accent',
  },

  // Form animations
  form: {
    input: 'transition-all duration-fast ease-out focus:ring-2 focus:ring-primary/20 focus:border-primary',
    checkbox: 'transition-all duration-fast ease-out',
    radio: 'transition-all duration-fast ease-out',
    select: 'transition-all duration-fast ease-out',
    validation: 'transition-all duration-normal ease-out',
  },
} as const;

// ==========================================
// ACCESSIBILITY ENHANCED ANIMATIONS
// ==========================================

export const ACCESSIBLE_ANIMATIONS = {
  // Respect prefers-reduced-motion
  reduced: {
    card: 'transition-shadow duration-fast ease-out hover:shadow-elevation-3',
    button: 'transition-colors duration-fast ease-out',
    link: 'transition-colors duration-fast ease-out',
    icon: 'transition-opacity duration-fast ease-out',
    image: 'transition-opacity duration-fast ease-out',
  },

  // Focus management
  focus: {
    visible: 'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
    subtle: 'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-background',
    inset: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset',
  },

  // Screen reader announcements
  sr: {
    show: 'sr-only animate-[sr-show_0.1s_ease-out_forwards]',
    hide: 'sr-only animate-[sr-hide_0.1s_ease-out_forwards]',
  },
} as const;

// ==========================================
// COMPONENT-SPECIFIC ANIMATION UTILITIES
// ==========================================

export const COMPONENT_ANIMATIONS = {
  // Marketing Section animations
  section: {
    base: 'transition-all duration-normal ease-out',
    hover: MARKETING_ANIMATIONS.interactive.card.hover,
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
    entrance: MARKETING_ANIMATIONS.page.section,
  },

  // Marketing Card animations
  card: {
    base: 'transition-all duration-normal ease-out',
    hover: MARKETING_ANIMATIONS.interactive.card.hover,
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
    active: MARKETING_ANIMATIONS.interactive.card.active,
    tap: MARKETING_ANIMATIONS.interactive.card.tap,
    entrance: MARKETING_ANIMATIONS.micro.fadeIn,
  },

  // CTA Button animations
  cta: {
    primary: MARKETING_ANIMATIONS.interactive.button.primary,
    secondary: MARKETING_ANIMATIONS.interactive.button.secondary,
    ghost: MARKETING_ANIMATIONS.interactive.button.ghost,
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
    loading: 'animate-pulse cursor-not-allowed',
    disabled: 'opacity-50 cursor-not-allowed',
  },

  // Marketing Link animations
  link: {
    default: MARKETING_ANIMATIONS.interactive.link.default,
    arrow: MARKETING_ANIMATIONS.interactive.link.arrow,
    underline: MARKETING_ANIMATIONS.interactive.link.underline,
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
  },

  // Icon animations
  icon: {
    default: MARKETING_ANIMATIONS.interactive.icon.default,
    rotate: MARKETING_ANIMATIONS.interactive.icon.rotate,
    bounce: MARKETING_ANIMATIONS.interactive.icon.bounce,
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
  },

  // Image animations
  image: {
    lift: MARKETING_ANIMATIONS.interactive.image.lift,
    zoom: MARKETING_ANIMATIONS.interactive.image.zoom,
    overlay: MARKETING_ANIMATIONS.interactive.image.overlay,
    lazy: 'opacity-0 animate-[fade-in_0.3s_ease-out_forwards]',
  },

  // Stat Grid animations
  stat: {
    base: 'transition-all duration-normal ease-out',
    hover: 'hover:scale-105 hover:text-accent motion-reduce:hover:scale-100',
    entrance: MARKETING_ANIMATIONS.micro.scaleIn,
  },

  // Form Field animations
  field: {
    base: MARKETING_ANIMATIONS.form.input,
    error: 'ring-2 ring-destructive/20 border-destructive',
    success: 'ring-2 ring-success/20 border-success',
    focus: ACCESSIBLE_ANIMATIONS.focus.visible,
  },
} as const;

// ==========================================
// RESPONSIVE ANIMATION MODIFIERS
// ==========================================

export const RESPONSIVE_ANIMATIONS = {
  // Disable animations on smaller screens for performance
  mobile: {
    disabled: 'md:transition-all md:duration-normal md:ease-out',
    reduced: 'sm:transition-all sm:duration-fast sm:ease-out',
    minimal: 'transition-colors duration-fast ease-out',
  },

  // Touch-friendly animations
  touch: {
    larger: 'touch-manipulation min-h-[44px] min-w-[44px]',
    feedback: 'active:scale-95 transition-transform duration-fast motion-reduce:active:scale-100',
    highlight: 'active:bg-primary/10 transition-colors duration-fast',
  },

  // Performance optimizations
  performance: {
    gpu: 'transform-gpu', // Force GPU acceleration
    contain: 'contain-layout', // CSS containment for better performance
    layer: 'will-change-transform', // Hint browser for layer creation
  },
} as const;

// ==========================================
// ANIMATION UTILITY FUNCTIONS
// ==========================================

/**
 * Get animation classes for a component with accessibility considerations
 */
export function getAnimationClasses(
  component: keyof typeof COMPONENT_ANIMATIONS,
  states: string[] = ['base'],
  options: {
    reducedMotion?: boolean;
    touchFriendly?: boolean;
    performance?: boolean;
  } = {}
): string {
  const { reducedMotion = false, touchFriendly = false, performance = false } = options;

  let classes = states.map(state => {
    if (state in COMPONENT_ANIMATIONS[component]) {
      return COMPONENT_ANIMATIONS[component][state as keyof typeof COMPONENT_ANIMATIONS[typeof component]];
    }
    return '';
  }).filter(Boolean).join(' ');

  // Add accessibility considerations
  if (reducedMotion) {
    if (component in ACCESSIBLE_ANIMATIONS.reduced) {
      classes += ` ${ACCESSIBLE_ANIMATIONS.reduced[component as keyof typeof ACCESSIBLE_ANIMATIONS.reduced]}`;
    }
  }

  // Add touch-friendly enhancements
  if (touchFriendly && component in RESPONSIVE_ANIMATIONS.touch) {
    classes += ` ${RESPONSIVE_ANIMATIONS.touch[component as keyof typeof RESPONSIVE_ANIMATIONS.touch]}`;
  }

  // Add performance optimizations
  if (performance && component in RESPONSIVE_ANIMATIONS.performance) {
    classes += ` ${RESPONSIVE_ANIMATIONS.performance[component as keyof typeof RESPONSIVE_ANIMATIONS.performance]}`;
  }

  return classes.trim();
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply motion-safe wrapper to animation classes
 */
export function withMotionSafety(classes: string): string {
  return `motion-safe:${classes} motion-reduce:transition-colors motion-reduce:duration-fast`;
}

// ==========================================
// EXPORTS
// ==========================================

export type AnimationTokens = typeof ANIMATION_TOKENS;
export type MarketingAnimations = typeof MARKETING_ANIMATIONS;
export type ComponentAnimations = typeof COMPONENT_ANIMATIONS;
