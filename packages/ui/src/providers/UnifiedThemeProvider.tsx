'use client';

/**
 * GHXSTSHIP Unified Theme Provider
 * Enterprise-Grade Theme Management with Performance Optimization
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DESIGN_TOKENS, SEMANTIC_TOKENS, generateCSSVariables } from '../tokens/unified-design-tokens';

// ==========================================
// TYPES
// ==========================================

export type Theme = 'light' | 'dark' | 'system';
export type Brand = 'ghxstship' | 'atlvs' | 'opendeck';

export interface ThemeConfig {
  theme: Theme;
  brand: Brand;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}

export interface ThemeContextValue {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setBrand: (brand: Brand) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: 'sm' | 'base' | 'lg') => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
  tokens: typeof DESIGN_TOKENS;
}

// ==========================================
// CONTEXT
// ==========================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ==========================================
// HOOKS
// ==========================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a UnifiedThemeProvider');
  }
  return context;
}

// ==========================================
// UTILITIES
// ==========================================

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredConfig(): Partial<ThemeConfig> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem('ghxstship-theme-config');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function storeConfig(config: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('ghxstship-theme-config', JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

function detectBrand(): Brand {
  if (typeof window === 'undefined') return 'ghxstship';
  
  const hostname = window.location.hostname;
  if (hostname.includes('atlvs')) return 'atlvs';
  if (hostname.includes('opendeck')) return 'opendeck';
  return 'ghxstship';
}

function applyThemeToDOM(resolvedTheme: 'light' | 'dark', config: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Apply theme
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-brand', config.brand);
  
  // Apply accessibility preferences
  if (config.reducedMotion) {
    root.setAttribute('data-reduced-motion', 'true');
  } else {
    root.removeAttribute('data-reduced-motion');
  }
  
  if (config.highContrast) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }
  
  // Apply font size
  root.setAttribute('data-font-size', config.fontSize);
  
  // Generate and inject CSS variables
  const cssVariables = generateCSSVariables(resolvedTheme);
  let styleElement = document.getElementById('ghxstship-theme-variables');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'ghxstship-theme-variables';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = cssVariables;
}

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export interface UnifiedThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultBrand?: Brand;
  storageKey?: string;
  enableSystem?: boolean;
}

export function UnifiedThemeProvider({
  children,
  defaultTheme = 'system',
  defaultBrand,
  storageKey = 'ghxstship-theme-config',
  enableSystem = true,
}: UnifiedThemeProviderProps) {
  // Initialize config from storage and defaults
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const stored = getStoredConfig();
    const detectedBrand = defaultBrand || detectBrand();
    
    return {
      theme: stored.theme || defaultTheme,
      brand: stored.brand || detectedBrand,
      reducedMotion: stored.reducedMotion || false,
      highContrast: stored.highContrast || false,
      fontSize: stored.fontSize || 'base',
    };
  });

  // Resolve actual theme (handle 'system' preference)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (config.theme === 'system') {
      return getSystemTheme();
    }
    return config.theme;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || config.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setResolvedTheme(getSystemTheme());
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.theme, enableSystem]);

  // Update resolved theme when config changes
  useEffect(() => {
    if (config.theme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(config.theme);
    }
  }, [config.theme]);

  // Apply theme to DOM and store config
  useEffect(() => {
    applyThemeToDOM(resolvedTheme, config);
    storeConfig(config);
  }, [resolvedTheme, config]);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      if (mediaQuery.matches && !config.reducedMotion) {
        setConfig(prev => ({ ...prev, reducedMotion: true }));
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    handleChange(); // Check initial state
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.reducedMotion]);

  // Context value
  const contextValue: ThemeContextValue = {
    config,
    resolvedTheme,
    tokens: DESIGN_TOKENS,
    
    setTheme: (theme: Theme) => {
      setConfig(prev => ({ ...prev, theme }));
    },
    
    setBrand: (brand: Brand) => {
      setConfig(prev => ({ ...prev, brand }));
    },
    
    setReducedMotion: (reducedMotion: boolean) => {
      setConfig(prev => ({ ...prev, reducedMotion }));
    },
    
    setHighContrast: (highContrast: boolean) => {
      setConfig(prev => ({ ...prev, highContrast }));
    },
    
    setFontSize: (fontSize: 'sm' | 'base' | 'lg') => {
      setConfig(prev => ({ ...prev, fontSize }));
    },
    
    toggleTheme: () => {
      setConfig(prev => ({
        ...prev,
        theme: prev.theme === 'light' ? 'dark' : prev.theme === 'dark' ? 'light' : 'light'
      }));
    },
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// ADDITIONAL HOOKS
// ==========================================

/**
 * Hook to get design tokens with current theme context
 */
export function useDesignTokens() {
  const { tokens, resolvedTheme } = useTheme();
  const semanticTokens = SEMANTIC_TOKENS[resolvedTheme];
  
  return {
    ...tokens,
    semantic: semanticTokens,
  };
}

/**
 * Hook to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const { config } = useTheme();
  return config.reducedMotion;
}

/**
 * Hook to get responsive utilities
 */
export function useResponsive() {
  const { tokens } = useTheme();
  
  return {
    breakpoints: tokens.breakpoints,
    isAbove: (breakpoint: keyof typeof tokens.breakpoints) => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(`(min-width: ${tokens.breakpoints[breakpoint]})`).matches;
    },
  };
}

// ==========================================
// THEME UTILITIES
// ==========================================

/**
 * Get CSS custom property value
 */
export function getCSSVariable(property: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(property);
}

/**
 * Set CSS custom property value
 */
export function setCSSVariable(property: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(property, value);
}

/**
 * Create theme-aware CSS classes
 */
export function createThemeClasses(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}
