'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

// 2026 Enhancement System - Micro-animations, AI Personalization, Dynamic Theming
// Future-ready enhancements for cinematic aesthetics and intelligent adaptation

// =============================================================================
// MICRO-ANIMATION SYSTEM
// =============================================================================

// Enhanced Animation Variants
const animationVariants = cva('', {
  variants: {
    // Entrance animations
    entrance: {
      fadeIn: 'animate-in fade-in duration-300 ease-out',
      slideUp: 'animate-in slide-in-from-bottom-4 duration-300 ease-out',
      slideDown: 'animate-in slide-in-from-top-4 duration-300 ease-out',
      slideLeft: 'animate-in slide-in-from-right-4 duration-300 ease-out',
      slideRight: 'animate-in slide-in-from-left-4 duration-300 ease-out',
      scaleIn: 'animate-in zoom-in-95 duration-200 ease-out',
      bounceIn: 'animate-in zoom-in-50 duration-500 ease-bounce',
      flipIn: 'animate-in flip-in-x duration-400 ease-out',
      rotateIn: 'animate-in spin-in-180 duration-400 ease-out',
    },
    
    // Exit animations
    exit: {
      fadeOut: 'animate-out fade-out duration-200 ease-in',
      slideUp: 'animate-out slide-out-to-top-4 duration-200 ease-in',
      slideDown: 'animate-out slide-out-to-bottom-4 duration-200 ease-in',
      slideLeft: 'animate-out slide-out-to-left-4 duration-200 ease-in',
      slideRight: 'animate-out slide-out-to-right-4 duration-200 ease-in',
      scaleOut: 'animate-out zoom-out-95 duration-200 ease-in',
      bounceOut: 'animate-out zoom-out-50 duration-300 ease-bounce',
      flipOut: 'animate-out flip-out-x duration-300 ease-in',
      rotateOut: 'animate-out spin-out-180 duration-300 ease-in',
    },
    
    // Hover animations
    hover: {
      lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out',
      scale: 'hover:scale-105 transition-transform duration-200 ease-out',
      glow: 'hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-200 ease-out',
      rotate: 'hover:rotate-3 transition-transform duration-200 ease-out',
      skew: 'hover:skew-x-3 transition-transform duration-200 ease-out',
      pulse: 'hover:animate-pulse',
      bounce: 'hover:animate-bounce',
      wiggle: 'hover:animate-wiggle',
    },
    
    // Focus animations
    focus: {
      ring: 'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200',
      glow: 'focus:shadow-lg focus:shadow-brand-500/50 transition-all duration-200',
      scale: 'focus:scale-105 transition-transform duration-200',
      lift: 'focus:-translate-y-0.5 focus:shadow-md transition-all duration-200',
    },
    
    // Loading animations
    loading: {
      spin: 'animate-spin',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      ping: 'animate-ping',
      dots: 'animate-dots',
      wave: 'animate-wave',
      skeleton: 'animate-skeleton',
    },
    
    // Micro-interactions
    micro: {
      ripple: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:transition-opacity active:before:opacity-100 active:before:duration-75',
      press: 'active:scale-95 transition-transform duration-75',
      tap: 'active:brightness-90 transition-all duration-75',
      elastic: 'active:scale-110 transition-transform duration-150 ease-elastic',
      rubber: 'active:scale-90 transition-transform duration-200 ease-rubber',
    },
    
    // Stagger animations
    stagger: {
      children: '[&>*]:animate-in [&>*]:slide-in-from-bottom-2 [&>*]:fade-in [&>*]:duration-300 [&>*:nth-child(1)]:delay-0 [&>*:nth-child(2)]:delay-75 [&>*:nth-child(3)]:delay-150 [&>*:nth-child(4)]:delay-225 [&>*:nth-child(5)]:delay-300',
      list: '[&>li]:animate-in [&>li]:slide-in-from-left-4 [&>li]:fade-in [&>li]:duration-200 [&>li:nth-child(odd)]:delay-0 [&>li:nth-child(even)]:delay-100',
      grid: '[&>*]:animate-in [&>*]:zoom-in-95 [&>*]:fade-in [&>*]:duration-300 [&>*:nth-child(3n+1)]:delay-0 [&>*:nth-child(3n+2)]:delay-100 [&>*:nth-child(3n+3)]:delay-200',
    },
  },
});

// Animation Timing Functions
export const ANIMATION_TIMINGS = {
  // Standard easing
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom easing
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  rubber: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.25, 1, 0.5, 1)',
  
  // Duration presets
  durations: {
    instant: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
} as const;

// =============================================================================
// DYNAMIC THEMING SYSTEM
// =============================================================================

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accent: string;
  contrast: 'normal' | 'high';
  motion: 'normal' | 'reduced';
  density: 'compact' | 'normal' | 'comfortable';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animations: boolean;
}

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  setAccent: (color: string) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  accent: 'brand',
  contrast: 'normal',
  motion: 'normal',
  density: 'normal',
  borderRadius: 'md',
  animations: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : prev.mode === 'dark' ? 'system' : 'light',
    }));
  };

  const setAccent = (color: string) => {
    setTheme(prev => ({ ...prev, accent: color }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Mode
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.toggle('dark', mediaQuery.matches);
    } else {
      root.classList.toggle('dark', theme.mode === 'dark');
    }
    
    // Contrast
    root.classList.toggle('contrast-more', theme.contrast === 'high');
    
    // Motion
    root.classList.toggle('motion-reduce', theme.motion === 'reduced');
    
    // Density
    root.setAttribute('data-density', theme.density);
    
    // Border radius
    root.setAttribute('data-radius', theme.borderRadius);
    
    // Accent color
    root.setAttribute('data-accent', theme.accent);
    
    // Animations
    root.classList.toggle('no-animations', !theme.animations);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, toggleMode, setAccent, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// AI PERSONALIZATION SYSTEM
// =============================================================================

interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  workflowStyle: 'guided' | 'efficient' | 'advanced';
  informationDensity: 'minimal' | 'balanced' | 'detailed';
  interactionStyle: 'conservative' | 'standard' | 'aggressive';
  accessibilityNeeds: {
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    keyboardOnly: boolean;
  };
  contextualHelp: boolean;
  shortcuts: boolean;
  autoSave: boolean;
}

interface PersonalizationContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  getAdaptiveUI: (component: string) => Record<string, any>;
  trackInteraction: (action: string, context?: Record<string, any>) => void;
  getRecommendations: () => string[];
}

const defaultPreferences: UserPreferences = {
  experienceLevel: 'intermediate',
  workflowStyle: 'efficient',
  informationDensity: 'balanced',
  interactionStyle: 'standard',
  accessibilityNeeds: {
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    keyboardOnly: false,
  },
  contextualHelp: true,
  shortcuts: true,
  autoSave: true,
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [interactions, setInteractions] = useState<Array<{ action: string; timestamp: number; context?: Record<string, any> }>>([]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const getAdaptiveUI = (component: string): Record<string, any> => {
    const { experienceLevel, workflowStyle, informationDensity, interactionStyle } = preferences;
    
    // Adaptive UI logic based on user preferences
    const adaptations: Record<string, Record<string, any>> = {
      button: {
        size: experienceLevel === 'beginner' ? 'lg' : informationDensity === 'minimal' ? 'sm' : 'md',
        variant: interactionStyle === 'conservative' ? 'outline' : 'primary',
        showTooltip: experienceLevel === 'beginner',
      },
      form: {
        validation: experienceLevel === 'beginner' ? 'live' : 'onSubmit',
        helpText: informationDensity !== 'minimal',
        autoSave: preferences.autoSave,
      },
      navigation: {
        collapsed: informationDensity === 'minimal',
        shortcuts: preferences.shortcuts && experienceLevel !== 'beginner',
        breadcrumbs: informationDensity === 'detailed',
      },
      table: {
        density: informationDensity === 'minimal' ? 'compact' : informationDensity === 'detailed' ? 'comfortable' : 'normal',
        pagination: experienceLevel === 'beginner' ? 'simple' : 'advanced',
        filters: workflowStyle === 'advanced',
      },
    };
    
    return adaptations[component] || {};
  };

  const trackInteraction = (action: string, context?: Record<string, any>) => {
    setInteractions(prev => [
      ...prev.slice(-99), // Keep last 100 interactions
      { action, timestamp: Date.now(), context },
    ]);
  };

  const getRecommendations = (): string[] => {
    const recentActions = interactions.slice(-20);
    const recommendations: string[] = [];
    
    // AI-driven recommendations based on usage patterns
    const actionCounts = recentActions.reduce((acc, { action }) => {
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Example recommendation logic
    if (actionCounts['search'] > 5) {
      recommendations.push('Consider using keyboard shortcuts for faster searching');
    }
    
    if (actionCounts['form_error'] > 3) {
      recommendations.push('Enable live validation to catch errors earlier');
    }
    
    if (preferences.experienceLevel === 'beginner' && actionCounts['advanced_feature'] > 2) {
      recommendations.push('You might be ready for intermediate features');
    }
    
    return recommendations;
  };

  return (
    <PersonalizationContext.Provider value={{
      preferences,
      updatePreferences,
      getAdaptiveUI,
      trackInteraction,
      getRecommendations,
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

// =============================================================================
// ENHANCED COMPONENT SYSTEM
// =============================================================================

// Enhanced Button with 2026 features
const enhancedButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden',
    // Ripple effect
    'before:absolute before:inset-0 before:rounded-lg before:bg-white/20 before:opacity-0 before:transition-opacity',
    'active:before:opacity-100 active:before:duration-75',
    // Micro-animations
    'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95',
    // Accessibility
    'motion-reduce:transition-none motion-reduce:hover:transform-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-600 text-white shadow-sm',
          'hover:bg-brand-700 hover:shadow-lg',
          'focus-visible:ring-brand-500',
          'active:bg-brand-800',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 shadow-sm border border-neutral-200',
          'hover:bg-neutral-200 hover:shadow-md',
          'focus-visible:ring-neutral-500',
          'active:bg-neutral-300',
          'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
          'dark:hover:bg-neutral-700',
        ],
        ghost: [
          'text-neutral-700 bg-transparent',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'focus-visible:ring-neutral-500',
          'active:bg-neutral-200',
          'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      animation: {
        none: '',
        subtle: 'hover:scale-105',
        bounce: 'hover:animate-bounce',
        pulse: 'hover:animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animation: 'subtle',
    },
  }
);

// Enhanced Card with 2026 features
const enhancedCardVariants = cva(
  [
    'rounded-lg border bg-white shadow-sm transition-all duration-300',
    'dark:bg-neutral-800 dark:border-neutral-700',
    // Hover effects
    'hover:shadow-md hover:-translate-y-1',
    // Focus effects
    'focus-within:ring-2 focus-within:ring-brand-500/20',
    // Accessibility
    'motion-reduce:transition-none motion-reduce:hover:transform-none',
  ],
  {
    variants: {
      variant: {
        default: 'border-neutral-200',
        elevated: 'shadow-lg hover:shadow-xl',
        interactive: [
          'cursor-pointer border-neutral-200',
          'hover:border-brand-300 hover:shadow-lg',
          'active:scale-98',
        ],
        glass: [
          'bg-white/80 backdrop-blur-sm border-white/20',
          'dark:bg-neutral-800/80 dark:border-neutral-700/20',
        ],
      },
      animation: {
        none: '',
        lift: 'hover:-translate-y-2 hover:shadow-xl',
        glow: 'hover:shadow-lg hover:shadow-brand-500/25',
        scale: 'hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'lift',
    },
  }
);

// =============================================================================
// ACCESSIBILITY ENHANCEMENTS
// =============================================================================

export const a11yEnhancements = {
  // Focus management
  focusTrap: 'focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md',
  
  // Screen reader support
  srOnly: 'sr-only',
  liveRegion: '[aria-live="polite"]',
  assertive: '[aria-live="assertive"]',
  
  // High contrast support
  highContrast: 'contrast-more:border-black contrast-more:text-black dark:contrast-more:border-white dark:contrast-more:text-white',
  
  // Reduced motion support
  reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none motion-reduce:transform-none',
  
  // Keyboard navigation
  keyboardFocus: 'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded',
  
  // Touch targets
  touchTarget: 'min-h-[44px] min-w-[44px]',
};

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

export const performanceOptimizations = {
  // Lazy loading
  lazyImage: 'loading="lazy" decoding="async"',
  
  // GPU acceleration
  gpuAcceleration: 'transform-gpu',
  
  // Will-change optimization
  willChange: 'will-change-transform',
  
  // Contain layout
  containLayout: 'contain-layout',
  
  // Content visibility
  contentVisibility: 'content-visibility-auto',
};

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export const EnhancementSystem = {
  // Animation system
  animations: animationVariants,
  timings: ANIMATION_TIMINGS,
  
  // Enhanced components
  button: enhancedButtonVariants,
  card: enhancedCardVariants,
  
  // Accessibility
  a11y: a11yEnhancements,
  
  // Performance
  performance: performanceOptimizations,
  
  // Providers
  ThemeProvider,
  PersonalizationProvider,
  
  // Hooks
  useTheme,
  usePersonalization,
};

export default EnhancementSystem;
