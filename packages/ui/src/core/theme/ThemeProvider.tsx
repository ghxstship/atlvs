/**
 * ThemeProvider — Theme Context Provider
 * Manages theme state and provides theme context to all components
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ThemeMode, BrandTier, BrandColors, ThemeContextValue } from './theme.types';
import {
  resolveThemeMode,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeClass,
  getStoredTheme,
  saveThemeToStorage,
  watchSystemTheme,
  enableThemeTransitions,
  applyThemeMetaTags,
  getSystemTheme,
} from './theme.utils';
import { getBrandColorsByTier } from './theme.presets';

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider Props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultBrandTier?: BrandTier;
  brandOverrides?: Partial<BrandColors>;
  detectSystemTheme?: boolean;
  enableTransitions?: boolean;
  storageKey?: string;
}

/**
 * ThemeProvider Component
 * 
 * @example
 * ```tsx
 * <ThemeProvider
 *   defaultMode="auto"
 *   defaultBrandTier="default"
 *   detectSystemTheme
 *   enableTransitions
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultMode = 'auto',
  defaultBrandTier = 'default',
  brandOverrides,
  detectSystemTheme = true,
  enableTransitions: enableTransitionsProp = true,
  storageKey = 'ghxstship-theme',
}: ThemeProviderProps) {
  // State
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Try to load from storage first
    const stored = getStoredTheme(storageKey);
    return stored || defaultMode;
  });
  
  const [brandTier, setBrandTierState] = useState<BrandTier>(defaultBrandTier);
  const [customBrandColors, setCustomBrandColors] = useState<Partial<BrandColors> | undefined>(brandOverrides);
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => getSystemTheme() === 'dark');
  
  // Resolved mode (auto -> light/dark)
  const resolvedMode = useMemo(() => resolveThemeMode(mode), [mode]);
  
  // Brand colors
  const brandColors = useMemo(() => {
    const tierColors = getBrandColorsByTier(brandTier);
    return {
      ...tierColors,
      ...customBrandColors,
    };
  }, [brandTier, customBrandColors]);
  
  // Set mode with storage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemeToStorage(newMode, storageKey);
  }, [storageKey]);
  
  // Set brand tier
  const setBrandTier = useCallback((tier: BrandTier) => {
    setBrandTierState(tier);
  }, []);
  
  // Set brand colors
  const setBrandColors = useCallback((colors: Partial<BrandColors>) => {
    setCustomBrandColors(prev => ({ ...prev, ...colors }));
  }, []);
  
  // Toggle between light and dark
  const toggleMode = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  }, [resolvedMode, setMode]);
  
  // Apply theme on mount and when it changes
  useEffect(() => {
    // Generate and apply CSS variables
    const variables = generateCSSVariables(resolvedMode, brandColors);
    applyCSSVariables(variables);
    
    // Apply theme class
    applyThemeClass(resolvedMode);
    
    // Apply meta tags
    applyThemeMetaTags(resolvedMode);
    
    // Enable transitions if requested
    if (enableTransitionsProp) {
      enableThemeTransitions();
    }
  }, [resolvedMode, brandColors, enableTransitionsProp]);
  
  // Watch for system theme changes
  useEffect(() => {
    if (!detectSystemTheme || mode !== 'auto') return;
    
    const unwatch = watchSystemTheme((isDark) => {
      setSystemPrefersDark(isDark);
    });
    
    return unwatch;
  }, [detectSystemTheme, mode]);
  
  // Context value
  const value: ThemeContextValue = {
    mode,
    resolvedMode,
    brandTier,
    brandColors,
    setMode,
    setBrandTier,
    setBrandColors,
    toggleMode,
    systemPrefersDark,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Access theme context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { mode, setMode, brandColors } = useTheme();
 *   
 *   return (
 *     <button onClick={() => setMode('dark')}>
 *       Switch to Dark Mode
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}

/**
 * withTheme HOC
 * Inject theme props into component
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
) {
  return function ThemedComponent(props: P) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}
