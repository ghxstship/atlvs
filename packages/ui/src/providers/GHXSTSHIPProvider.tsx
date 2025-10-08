'use client';

/**
 * GHXSTSHIP Provider
 * Main provider wrapper combining Theme and Accessibility
 */

import React from 'react';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import { AccessibilityProvider } from '../accessibility/AccessibilityProvider';
import type { BrandTier, ThemeMode } from '../core/theme/theme.types';
import type { AccessibilityConfig } from '../accessibility/AccessibilityProvider';

export interface GHXSTSHIPProviderProps {
  children: React.ReactNode;
  theme?: {
    defaultBrand?: 'ghxstship' | 'atlvs' | 'opendeck';
    defaultTheme?: 'light' | 'dark' | 'system';
  };
  accessibility?: {
    defaultConfig?: Partial<AccessibilityConfig>;
  };
}

export function GHXSTSHIPProvider({
  children,
  theme = {},
  accessibility = {},
}: GHXSTSHIPProviderProps) {
  const { defaultBrand = 'ghxstship', defaultTheme = 'system' } = theme;
  const { defaultConfig = {} } = accessibility;

  // Map brand to tier for ThemeProvider
  const brandTier: BrandTier = defaultBrand === 'ghxstship' ? 'default' : 'enterprise';
  
  // Map 'system' to 'auto' for ThemeMode
  const themeMode: ThemeMode = defaultTheme === 'system' ? 'auto' : defaultTheme as ThemeMode;

  return (
    <ThemeProvider
      defaultMode={themeMode}
      defaultBrandTier={brandTier}
      enableTransitions
      storageKey="ghxstship-theme"
    >
      <AccessibilityProvider defaultConfig={defaultConfig}>
        {children}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
