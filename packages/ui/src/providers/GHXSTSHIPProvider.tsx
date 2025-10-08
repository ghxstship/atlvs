'use client';

/**
 * GHXSTSHIP Provider
 * Main provider wrapper combining Theme and Accessibility
 */

import React from 'react';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import { AccessibilityProvider } from '../accessibility/AccessibilityProvider';
import type { BrandTier } from '../core/theme/theme.types';

export interface GHXSTSHIPProviderProps {
  children: React.ReactNode;
  theme?: {
    defaultBrand?: 'ghxstship' | 'atlvs' | 'opendeck';
    defaultTheme?: 'light' | 'dark' | 'system';
  };
  accessibility?: {
    defaultConfig?: {
      announcements?: boolean;
      focusManagement?: boolean;
      keyboardNavigation?: boolean;
      screenReaderOptimizations?: boolean;
      colorContrastEnforcement?: boolean;
      motionReduction?: boolean;
      textScaling?: boolean;
      highContrastMode?: boolean;
    };
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

  return (
    <ThemeProvider
      defaultMode={defaultTheme}
      defaultTier={brandTier}
      enableTransitions
      storageKey="ghxstship-theme"
    >
      <AccessibilityProvider
        announcements={defaultConfig.announcements}
        focusManagement={defaultConfig.focusManagement}
        keyboardNavigation={defaultConfig.keyboardNavigation}
        screenReaderOptimizations={defaultConfig.screenReaderOptimizations}
      >
        {children}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
