'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { designTokens, getThemeTokens } from '../tokens';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ContrastMode = 'normal' | 'high';
export type MotionMode = 'normal' | 'reduced';

export interface ThemeContextValue {
  theme: ThemeMode;
  contrast: ContrastMode;
  motion: MotionMode;
  effectiveTheme: 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';
  setTheme: (theme: ThemeMode) => void;
  setContrast: (contrast: ContrastMode) => void;
  setMotion: (motion: MotionMode) => void;
  // Contextual token getters
  getToken: (path: string) => string;
  getColorToken: (semanticName: string, variant?: string) => string;
  getSpacingToken: (size: number | string) => string;
  getShadowToken: (elevation: number) => string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  defaultContrast?: ContrastMode;
  defaultMotion?: MotionMode;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  defaultContrast = 'normal',
  defaultMotion = 'normal',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [contrast, setContrastState] = useState<ContrastMode>(defaultContrast);
  const [motion, setMotionState] = useState<MotionMode>(defaultMotion);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Determine effective theme
  const effectiveTheme: 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast' =
    contrast === 'high'
      ? (theme === 'auto' ? (systemTheme === 'dark' ? 'dark-high-contrast' : 'light-high-contrast') : `${theme}-high-contrast`)
      : (theme === 'auto' ? systemTheme : theme);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeMode;
    const storedContrast = localStorage.getItem('contrast') as ContrastMode;
    const storedMotion = localStorage.getItem('motion') as MotionMode;

    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      setThemeState(storedTheme);
    }
    if (storedContrast && ['normal', 'high'].includes(storedContrast)) {
      setContrastState(storedContrast);
    }
    if (storedMotion && ['normal', 'reduced'].includes(storedMotion)) {
      setMotionState(storedMotion);
    }
  }, []);

  // Apply theme to document with performance optimization
  useEffect(() => {
    // Mark performance start
    performance.mark('theme-switch-start');

    // Use requestAnimationFrame for smoother updates
    const rafId = requestAnimationFrame(() => {
      const root = document.documentElement;

      // Prevent flicker by setting color-scheme immediately
      root.style.setProperty('color-scheme', effectiveTheme.includes('dark') ? 'dark' : 'light');

      // Set theme data attributes
      root.setAttribute('data-theme', effectiveTheme);
      root.setAttribute('data-contrast', contrast);
      root.setAttribute('data-motion', motion);

      // Get theme tokens from the declarative system
      let themeTokens: Record<string, string>;

      if (effectiveTheme === 'light' || effectiveTheme === 'light-high-contrast') {
        themeTokens = contrast === 'high'
          ? designTokens.themes['high-contrast-light']
          : designTokens.themes.light;
      } else {
        themeTokens = contrast === 'high'
          ? designTokens.themes['high-contrast-dark']
          : designTokens.themes.dark;
      }

      // Use CSS containment to limit reflow scope
      root.style.contain = 'layout style paint';

      // Batch all CSS variable updates
      const entries = Object.entries(themeTokens);
      entries.forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      // Apply motion preferences
      if (motion === 'reduced') {
        root.style.setProperty('--duration-fast', '0.01ms');
        root.style.setProperty('--duration-normal', '0.01ms');
        root.style.setProperty('--duration-slow', '0.01ms');
      } else {
        // Reset to defaults from token system
        root.style.setProperty('--duration-fast', designTokens.primitives.motion.durations.fast);
        root.style.setProperty('--duration-normal', designTokens.primitives.motion.durations.normal);
        root.style.setProperty('--duration-slow', designTokens.primitives.motion.durations.slow);
      }

      // Remove containment after updates
      root.style.contain = '';

      // Mark performance end and measure
      performance.mark('theme-switch-end');
      performance.measure('theme-switch', 'theme-switch-start', 'theme-switch-end');

      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        const measure = performance.getEntriesByName('theme-switch')[0];
        if (measure && measure.duration > 100) {
          console.warn(`Theme switch took ${measure.duration.toFixed(2)}ms (target: <100ms)`);
        }
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [effectiveTheme, contrast, motion]);

  // Contextual token getters
  const getToken = (path: string): string => {
    const element = document.documentElement;
    const cssVar = path.startsWith('--') ? path : `--${path.replace(/\./g, '-')}`;
    return getComputedStyle(element).getPropertyValue(cssVar).trim() || path;
  };

  const getColorToken = (semanticName: string, variant?: string): string => {
    const path = variant ? `--color-${semanticName}-${variant}` : `--color-${semanticName}`;
    return getToken(path);
  };

  const getSpacingToken = (size: number | string): string => {
    const key = typeof size === 'number' ? size.toString() : size;
    return getToken(`--spacing-${key}`);
  };

  const getShadowToken = (elevation: number): string => {
    return getToken(`--shadow-semantic-elevation-${elevation}`);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setContrast = (newContrast: ContrastMode) => {
    setContrastState(newContrast);
    localStorage.setItem('contrast', newContrast);
  };

  const setMotion = (newMotion: MotionMode) => {
    setMotionState(newMotion);
    localStorage.setItem('motion', newMotion);
  };

  const value: ThemeContextValue = {
    theme,
    contrast,
    motion,
    effectiveTheme,
    setTheme,
    setContrast,
    setMotion,
    getToken,
    getColorToken,
    getSpacingToken,
    getShadowToken,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for component-specific token access
export function useTokens() {
  const { getToken, getColorToken, getSpacingToken, getShadowToken } = useTheme();

  return {
    // Direct token access
    token: getToken,

    // Semantic color access
    colors: {
      primary: () => getColorToken('primary'),
      secondary: () => getColorToken('secondary'),
      success: () => getColorToken('success'),
      warning: () => getColorToken('warning'),
      error: () => getColorToken('destructive'),
      info: () => getColorToken('info'),
    },

    // Spacing access
    spacing: (size: number | string) => getSpacingToken(size),

    // Shadow access
    shadows: {
      elevation: (level: number) => getShadowToken(level),
      component: (component: string, state?: string) =>
        getToken(`--shadow-semantic-component-${component}${state ? `-${state}` : ''}`),
    },

    // Typography access
    typography: {
      fontSize: (size: string) => getToken(`--font-size-${size}`),
      fontWeight: (weight: string) => getToken(`--font-weight-${weight}`),
      lineHeight: (height: string) => getToken(`--line-height-${height}`),
      letterSpacing: (spacing: string) => getToken(`--letter-spacing-${spacing}`),
    },

    // Border access
    borders: {
      radius: (size: string) => getToken(`--radius-${size}`),
      width: (width: string) => getToken(`--border-width-${width}`),
    },
  };
}
