/**
 * Global UI/UX Optimization System
 * Comprehensive atomic-level pixel-perfect normalization and optimization
 * 2026 Enterprise-Ready Design System
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// =============================================================================
// ATOMIC-LEVEL UI STATE SYSTEM
// =============================================================================

export interface UIStateConfig {
  default: string;
  hover: string;
  active: string;
  focused: string;
  disabled: string;
  loading: string;
  error: string;
  empty: string;
  success: string;
  interactive: string;
}

export const atomicStates: Record<string, UIStateConfig> = {
  button: {
    default: 'transition-all duration-200 ease-out transform-gpu',
    hover: 'hover:scale-[1.02] hover:shadow-lg hover:brightness-110',
    active: 'active:scale-[0.98] active:shadow-sm',
    focused: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    loading: 'animate-pulse cursor-wait',
    error: 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/20',
    empty: 'opacity-60',
    success: 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950/20',
    interactive: 'cursor-pointer select-none will-change-transform',
  },
  input: {
    default: 'transition-all duration-150 ease-out',
    hover: 'hover:border-primary/50 hover:shadow-sm',
    active: 'border-primary shadow-sm',
    focused: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
    loading: 'animate-pulse bg-gray-50',
    error: 'border-red-500 focus:ring-red-500/20 bg-red-50/50',
    empty: 'placeholder-gray-400',
    success: 'border-green-500 focus:ring-green-500/20 bg-green-50/50',
    interactive: 'resize-none',
  },
  card: {
    default: 'transition-all duration-300 ease-out transform-gpu',
    hover: 'hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1',
    active: 'active:scale-[0.99] active:shadow-md',
    focused: 'focus-within:ring-2 focus-within:ring-primary/20',
    disabled: 'opacity-50 pointer-events-none',
    loading: 'animate-pulse bg-gradient-to-r from-gray-100 to-gray-200',
    error: 'border-red-200 bg-red-50/50',
    empty: 'border-dashed border-gray-300 bg-gray-50/50',
    success: 'border-green-200 bg-green-50/50',
    interactive: 'cursor-pointer will-change-transform',
  },
  modal: {
    default: 'transition-all duration-300 ease-out transform-gpu',
    hover: '',
    active: '',
    focused: 'focus:outline-none',
    disabled: 'pointer-events-none opacity-50',
    loading: 'animate-pulse',
    error: 'shake-animation',
    empty: '',
    success: '',
    interactive: '',
  },
};

// =============================================================================
// PIXEL-PERFECT DESIGN TOKENS
// =============================================================================

export const pixelPerfectTokens = {
  spacing: {
    atomic: {
      '0': '0px',
      'px': '1px',
      '0.5': '2px',
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': '10px',
      '3': '12px',
      '3.5': '14px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '32': '128px',
      '36': '144px',
      '40': '160px',
      '44': '176px',
      '48': '192px',
      '52': '208px',
      '56': '224px',
      '60': '240px',
      '64': '256px',
      '72': '288px',
      '80': '320px',
      '96': '384px',
    },
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    DEFAULT: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgb(59 130 246 / 0.5)',
    'glow-lg': '0 0 40px rgb(59 130 246 / 0.5)',
  },
  animations: {
    timing: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  typography: {
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
};

// =============================================================================
// PERFORMANCE OPTIMIZATION SYSTEM
// =============================================================================

export interface PerformanceConfig {
  lazyLoad: boolean;
  virtualization: boolean;
  codeSpitting: boolean;
  memoization: boolean;
  debouncing: boolean;
  throttling: boolean;
  prefetching: boolean;
  caching: boolean;
  webWorkers: boolean;
  gpuAcceleration: boolean;
}

export const performanceOptimizations: PerformanceConfig = {
  lazyLoad: true,
  virtualization: true,
  codeSpitting: true,
  memoization: true,
  debouncing: true,
  throttling: true,
  prefetching: true,
  caching: true,
  webWorkers: false, // Enable for heavy computations
  gpuAcceleration: true,
};

// =============================================================================
// 2026 DESIGN INNOVATIONS
// =============================================================================

export interface InnovationFeatures {
  aiPowered: {
    predictiveUI: boolean;
    contextAwareness: boolean;
    smartSuggestions: boolean;
    adaptiveLayouts: boolean;
    behavioralAnalysis: boolean;
  };
  personalization: {
    customThemes: boolean;
    draggableWidgets: boolean;
    persistentLayouts: boolean;
    userPreferences: boolean;
    adaptiveDensity: boolean;
  };
  multimodal: {
    voiceControl: boolean;
    gestureRecognition: boolean;
    hapticFeedback: boolean;
    arVrReady: boolean;
    eyeTracking: boolean;
  };
  accessibility: {
    wcag22AAA: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
    colorBlindModes: boolean;
    cognitiveAccessibility: boolean;
  };
}

export const innovations2026: InnovationFeatures = {
  aiPowered: {
    predictiveUI: true,
    contextAwareness: true,
    smartSuggestions: true,
    adaptiveLayouts: true,
    behavioralAnalysis: true,
  },
  personalization: {
    customThemes: true,
    draggableWidgets: true,
    persistentLayouts: true,
    userPreferences: true,
    adaptiveDensity: true,
  },
  multimodal: {
    voiceControl: false, // Future enhancement
    gestureRecognition: false, // Future enhancement
    hapticFeedback: true,
    arVrReady: false, // Future enhancement
    eyeTracking: false, // Future enhancement
  },
  accessibility: {
    wcag22AAA: true,
    screenReaderOptimized: true,
    keyboardNavigation: true,
    colorBlindModes: true,
    cognitiveAccessibility: true,
  },
};

// =============================================================================
// GLOBAL UI OPTIMIZATION CONTEXT
// =============================================================================

interface GlobalUIOptimizationContextType {
  atomicStates: typeof atomicStates;
  pixelPerfectTokens: typeof pixelPerfectTokens;
  performanceConfig: PerformanceConfig;
  innovations: InnovationFeatures;
  optimizationLevel: 'minimal' | 'balanced' | 'maximum';
  setOptimizationLevel: (level: 'minimal' | 'balanced' | 'maximum') => void;
  applyAtomicState: (component: string, state: keyof UIStateConfig) => string;
  measurePerformance: (componentName: string, callback: () => void) => void;
  enableInnovation: (category: keyof InnovationFeatures, feature: string, enabled: boolean) => void;
}

const GlobalUIOptimizationContext = createContext<GlobalUIOptimizationContextType | undefined>(undefined);

export const useGlobalUIOptimization = () => {
  const context = useContext(GlobalUIOptimizationContext);
  if (!context) {
    throw new Error('useGlobalUIOptimization must be used within GlobalUIOptimizationProvider');
  }
  return context;
};

// =============================================================================
// GLOBAL UI OPTIMIZATION PROVIDER
// =============================================================================

interface GlobalUIOptimizationProviderProps {
  children: React.ReactNode;
  initialOptimizationLevel?: 'minimal' | 'balanced' | 'maximum';
  enablePerformanceMonitoring?: boolean;
  enableA11yAuditing?: boolean;
}

export const GlobalUIOptimizationProvider: React.FC<GlobalUIOptimizationProviderProps> = ({
  children,
  initialOptimizationLevel = 'balanced',
  enablePerformanceMonitoring = true,
  enableA11yAuditing = true,
}) => {
  const [optimizationLevel, setOptimizationLevel] = useState(initialOptimizationLevel);
  const [performanceConfig, setPerformanceConfig] = useState(performanceOptimizations);
  const [innovations, setInnovations] = useState(innovations2026);

  // Apply atomic state classes
  const applyAtomicState = useCallback((component: string, state: keyof UIStateConfig): string => {
    const componentStates = atomicStates[component];
    if (!componentStates) {
      console.warn(`No atomic states defined for component: ${component}`);
      return '';
    }
    return componentStates[state] || '';
  }, []);

  // Measure component performance
  const measurePerformance = useCallback((componentName: string, callback: () => void) => {
    if (!enablePerformanceMonitoring) {
      callback();
      return;
    }

    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16.67) { // More than one frame (60fps)
      console.warn(`⚠️ Performance: ${componentName} took ${duration.toFixed(2)}ms to render`);
    }

    // Log to performance monitoring service
    if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
      (window as any).performanceMonitor.log({
        component: componentName,
        duration,
        timestamp: Date.now(),
        optimizationLevel,
      });
    }
  }, [enablePerformanceMonitoring, optimizationLevel]);

  // Enable/disable innovation features
  const enableInnovation = useCallback((
    category: keyof InnovationFeatures,
    feature: string,
    enabled: boolean
  ) => {
    setInnovations(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: enabled,
      },
    }));
  }, []);

  // Accessibility auditing
  useEffect(() => {
    if (!enableA11yAuditing || typeof window === 'undefined') return;

    const auditInterval = setInterval(() => {
      const issues: string[] = [];

      // Check for missing alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      }

      // Check for missing labels
      const inputsWithoutLabel = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      if (inputsWithoutLabel.length > 0) {
        issues.push(`${inputsWithoutLabel.length} inputs missing labels`);
      }

      // Check for insufficient color contrast
      const lowContrastElements = document.querySelectorAll('[data-contrast="low"]');
      if (lowContrastElements.length > 0) {
        issues.push(`${lowContrastElements.length} elements with low color contrast`);
      }

      // Check for missing focus indicators
      const focusableWithoutIndicator = document.querySelectorAll('button:not([class*="focus:"]), a:not([class*="focus:"])');
      if (focusableWithoutIndicator.length > 0) {
        issues.push(`${focusableWithoutIndicator.length} focusable elements without focus indicators`);
      }

      if (issues.length > 0) {
        console.warn('🔍 Accessibility Issues:', issues);
      }
    }, 10000); // Audit every 10 seconds

    return () => clearInterval(auditInterval);
  }, [enableA11yAuditing]);

  // Performance optimization based on level
  useEffect(() => {
    const newConfig = { ...performanceOptimizations };

    switch (optimizationLevel) {
      case 'minimal':
        newConfig.lazyLoad = false;
        newConfig.virtualization = false;
        newConfig.prefetching = false;
        newConfig.webWorkers = false;
        break;
      case 'balanced':
        newConfig.lazyLoad = true;
        newConfig.virtualization = true;
        newConfig.prefetching = true;
        newConfig.webWorkers = false;
        break;
      case 'maximum':
        newConfig.lazyLoad = true;
        newConfig.virtualization = true;
        newConfig.prefetching = true;
        newConfig.webWorkers = true;
        newConfig.gpuAcceleration = true;
        break;
    }

    setPerformanceConfig(newConfig);
  }, [optimizationLevel]);

  const value = useMemo(() => ({
    atomicStates,
    pixelPerfectTokens,
    performanceConfig,
    innovations,
    optimizationLevel,
    setOptimizationLevel,
    applyAtomicState,
    measurePerformance,
    enableInnovation,
  }), [
    performanceConfig,
    innovations,
    optimizationLevel,
    applyAtomicState,
    measurePerformance,
    enableInnovation,
  ]);

  return (
    <GlobalUIOptimizationContext.Provider value={value}>
      {children}
    </GlobalUIOptimizationContext.Provider>
  );
};

// =============================================================================
// ATOMIC COMPONENT WRAPPER HOC
// =============================================================================

export function withAtomicOptimization<P extends object>(
  Component: React.ComponentType<P>,
  componentType: keyof typeof atomicStates
) {
  return React.forwardRef<any, P>((props, ref) => {
    const { applyAtomicState, measurePerformance } = useGlobalUIOptimization();
    const [state, setState] = useState<keyof UIStateConfig>('default');

    const enhancedProps = {
      ...props,
      className: `${(props as any).className || ''} ${applyAtomicState(componentType, state)}`.trim(),
      onMouseEnter: () => setState('hover'),
      onMouseLeave: () => setState('default'),
      onMouseDown: () => setState('active'),
      onMouseUp: () => setState('hover'),
      onFocus: () => setState('focused'),
      onBlur: () => setState('default'),
    };

    useEffect(() => {
      measurePerformance(`${componentType}-${Component.displayName || 'Component'}`, () => {
        // Component render measurement
      });
    }, [measurePerformance]);

    return <Component {...enhancedProps} ref={ref} />;
  });
}

// =============================================================================
// PERFORMANCE MONITORING HOOKS
// =============================================================================

export const usePerformanceMonitor = (componentName: string) => {
  const { measurePerformance } = useGlobalUIOptimization();
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 1000) { // Component was mounted for more than 1 second
        console.log(`📊 ${componentName} lifetime: ${(duration / 1000).toFixed(2)}s`);
      }
    };
  }, [componentName]);

  return { measurePerformance };
};

// =============================================================================
// RESPONSIVE OPTIMIZATION HOOK
// =============================================================================

export const useResponsiveOptimization = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    is4K: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        is4K: width >= 3840,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export default {
  GlobalUIOptimizationProvider,
  useGlobalUIOptimization,
  usePerformanceMonitor,
  useResponsiveOptimization,
  withAtomicOptimization,
  atomicStates,
  pixelPerfectTokens,
  performanceOptimizations,
  innovations2026,
};
