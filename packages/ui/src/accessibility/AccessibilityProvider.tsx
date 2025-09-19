'use client';

/**
 * GHXSTSHIP Accessibility Provider
 * WCAG 2.2+ Compliance System
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// ==========================================
// TYPES
// ==========================================

export interface AccessibilityConfig {
  announcements: boolean;
  focusManagement: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimizations: boolean;
  colorContrastEnforcement: boolean;
  motionReduction: boolean;
  textScaling: boolean;
  highContrastMode: boolean;
}

export interface AccessibilityContextValue {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | string) => void;
  trapFocus: (container: HTMLElement) => () => void;
  checkColorContrast: (foreground: string, background: string) => boolean;
  isReducedMotion: boolean;
}

// ==========================================
// CONTEXT
// ==========================================

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// ==========================================
// HOOKS
// ==========================================

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// ==========================================
// UTILITIES
// ==========================================

/**
 * Calculate color contrast ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color contrast meets WCAG standards
 */
function checkColorContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === 'AAA' ? 7 : 4.5;
  return ratio >= threshold;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

/**
 * Create focus trap for modal/dialog components
 */
function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Let parent components handle escape
      event.stopPropagation();
    }
  };

  container.addEventListener('keydown', handleTabKey);
  container.addEventListener('keydown', handleEscapeKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
    container.removeEventListener('keydown', handleEscapeKey);
  };
}

/**
 * Create live region for announcements
 */
function createLiveRegion(): HTMLElement {
  const existing = document.getElementById('ghxstship-live-region');
  if (existing) return existing;

  const liveRegion = document.createElement('div');
  liveRegion.id = 'ghxstship-live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';

  document.body.appendChild(liveRegion);
  return liveRegion;
}

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  defaultConfig?: Partial<AccessibilityConfig>;
}

export function AccessibilityProvider({
  children,
  defaultConfig = {},
}: AccessibilityProviderProps) {
  const [config, setConfig] = useState<AccessibilityConfig>(() => ({
    announcements: true,
    focusManagement: true,
    keyboardNavigation: true,
    screenReaderOptimizations: true,
    colorContrastEnforcement: true,
    motionReduction: false,
    textScaling: true,
    highContrastMode: false,
    ...defaultConfig,
  }));

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply accessibility configurations to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply motion reduction
    if (config.motionReduction || isReducedMotion) {
      root.style.setProperty('--motion-duration-fast', '0ms');
      root.style.setProperty('--motion-duration-normal', '0ms');
      root.style.setProperty('--motion-duration-slow', '0ms');
    } else {
      root.style.removeProperty('--motion-duration-fast');
      root.style.removeProperty('--motion-duration-normal');
      root.style.removeProperty('--motion-duration-slow');
    }

    // Apply high contrast mode
    if (config.highContrastMode) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Apply text scaling
    if (config.textScaling) {
      root.setAttribute('data-text-scaling', 'true');
    } else {
      root.removeAttribute('data-text-scaling');
    }
  }, [config, isReducedMotion]);

  // Set up keyboard navigation
  useEffect(() => {
    if (!config.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip links navigation (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
        skipLink?.focus();
      }

      // Main content navigation (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.querySelector('main, [role="main"]') as HTMLElement;
        mainContent?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.keyboardNavigation]);

  // Context value
  const contextValue: AccessibilityContextValue = {
    config,
    isReducedMotion: config.motionReduction || isReducedMotion,

    updateConfig: (updates: Partial<AccessibilityConfig>) => {
      setConfig(prev => ({ ...prev, ...updates }));
    },

    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!config.announcements) return;

      const liveRegion = createLiveRegion();
      liveRegion.setAttribute('aria-live', priority);
      
      // Clear and set message
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
    },

    focusElement: (element: HTMLElement | string) => {
      if (!config.focusManagement) return;

      const targetElement = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;

      if (targetElement) {
        targetElement.focus();
        
        // Scroll into view if needed
        targetElement.scrollIntoView({
          behavior: isReducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      }
    },

    trapFocus: (container: HTMLElement) => {
      if (!config.focusManagement) return () => {};
      return createFocusTrap(container);
    },

    checkColorContrast: (foreground: string, background: string) => {
      if (!config.colorContrastEnforcement) return true;
      return checkColorContrast(foreground, background);
    },
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ==========================================
// ACCESSIBILITY HOOKS
// ==========================================

/**
 * Hook for managing focus
 */
export function useFocusManagement() {
  const { focusElement, trapFocus } = useAccessibility();
  
  return {
    focusElement,
    trapFocus,
    focusFirst: (container: HTMLElement) => {
      const focusableElements = getFocusableElements(container);
      focusableElements[0]?.focus();
    },
    focusLast: (container: HTMLElement) => {
      const focusableElements = getFocusableElements(container);
      focusableElements[focusableElements.length - 1]?.focus();
    },
  };
}

/**
 * Hook for screen reader announcements
 */
export function useAnnouncements() {
  const { announce } = useAccessibility();
  
  return {
    announce,
    announceError: (message: string) => announce(`Error: ${message}`, 'assertive'),
    announceSuccess: (message: string) => announce(`Success: ${message}`, 'polite'),
    announceLoading: (message: string) => announce(`Loading: ${message}`, 'polite'),
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const handler = handlers[key];
      
      if (handler && typeof handler === 'function') {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

/**
 * Hook for ARIA live regions
 */
export function useLiveRegion(id: string) {
  const { announce } = useAccessibility();
  
  useEffect(() => {
    const liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    
    document.body.appendChild(liveRegion);
    
    return () => {
      document.body.removeChild(liveRegion);
    };
  }, [id]);
  
  return {
    announce: (message: string) => {
      const liveRegion = document.getElementById(id);
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    },
  };
}
