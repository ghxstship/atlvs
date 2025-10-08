/**
 * Theme Presets — Pre-configured Theme Configurations
 * Multi-tier branding support for enterprise SaaS
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import type { ThemePreset, BrandColors } from './theme.types';

/**
 * Default Brand Colors
 * Standard GHXSTSHIP branding
 */
export const defaultBrandColors: BrandColors = {
  primary: '#3B82F6',    // Blue 500
  secondary: '#A855F7',  // Purple 500
  accent: '#06B6D4',     // Cyan 500
};

/**
 * Enterprise Brand Colors
 * Professional, corporate aesthetic
 */
export const enterpriseBrandColors: BrandColors = {
  primary: '#1E40AF',    // Blue 800 (deeper, more professional)
  secondary: '#6B21A8',  // Purple 800
  accent: '#0E7490',     // Cyan 700
};

/**
 * Creative Brand Colors
 * Vibrant, energetic aesthetic
 */
export const creativeBrandColors: BrandColors = {
  primary: '#EC4899',    // Pink 500
  secondary: '#8B5CF6',  // Violet 500
  accent: '#F59E0B',     // Amber 500
};

/**
 * Partner Brand Colors
 * Neutral, customizable base
 */
export const partnerBrandColors: BrandColors = {
  primary: '#6366F1',    // Indigo 500
  secondary: '#10B981',  // Emerald 500
  accent: '#F97316',     // Orange 500
};

/**
 * Theme Presets
 * Complete pre-configured themes
 */
export const themePresets: Record<string, ThemePreset> = {
  // Default themes
  'default-light': {
    name: 'Default Light',
    description: 'Standard light theme with GHXSTSHIP branding',
    config: {
      mode: 'light',
      brandTier: 'default',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: defaultBrandColors,
  },
  'default-dark': {
    name: 'Default Dark',
    description: 'Standard dark theme with GHXSTSHIP branding',
    config: {
      mode: 'dark',
      brandTier: 'default',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: defaultBrandColors,
  },
  'default-auto': {
    name: 'Default Auto',
    description: 'Auto-switching theme based on system preference',
    config: {
      mode: 'auto',
      brandTier: 'default',
      detectSystemTheme: true,
      enableTransitions: true,
    },
    brandColors: defaultBrandColors,
  },
  
  // Enterprise themes
  'enterprise-light': {
    name: 'Enterprise Light',
    description: 'Professional light theme for corporate use',
    config: {
      mode: 'light',
      brandTier: 'enterprise',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: enterpriseBrandColors,
  },
  'enterprise-dark': {
    name: 'Enterprise Dark',
    description: 'Professional dark theme for corporate use',
    config: {
      mode: 'dark',
      brandTier: 'enterprise',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: enterpriseBrandColors,
  },
  
  // Creative themes
  'creative-light': {
    name: 'Creative Light',
    description: 'Vibrant theme for creative industries',
    config: {
      mode: 'light',
      brandTier: 'creative',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: creativeBrandColors,
  },
  'creative-dark': {
    name: 'Creative Dark',
    description: 'Vibrant dark theme for creative industries',
    config: {
      mode: 'dark',
      brandTier: 'creative',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: creativeBrandColors,
  },
  
  // Partner themes
  'partner-light': {
    name: 'Partner Light',
    description: 'Customizable light theme for partners',
    config: {
      mode: 'light',
      brandTier: 'partner',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: partnerBrandColors,
  },
  'partner-dark': {
    name: 'Partner Dark',
    description: 'Customizable dark theme for partners',
    config: {
      mode: 'dark',
      brandTier: 'partner',
      detectSystemTheme: false,
      enableTransitions: true,
    },
    brandColors: partnerBrandColors,
  },
  
  // High contrast themes
  'high-contrast-light': {
    name: 'High Contrast Light',
    description: 'Maximum contrast for accessibility',
    config: {
      mode: 'high-contrast',
      brandTier: 'default',
      detectSystemTheme: false,
      enableTransitions: false,
    },
    brandColors: {
      primary: '#0066FF',
      secondary: '#9333EA',
      accent: '#0891B2',
    },
  },
  'high-contrast-dark': {
    name: 'High Contrast Dark',
    description: 'Maximum contrast dark mode for accessibility',
    config: {
      mode: 'high-contrast',
      brandTier: 'default',
      detectSystemTheme: false,
      enableTransitions: false,
    },
    brandColors: {
      primary: '#66B3FF',
      secondary: '#C084FC',
      accent: '#22D3EE',
    },
  },
};

/**
 * Get theme preset by key
 */
export function getThemePreset(key: string): ThemePreset | undefined {
  return themePresets[key];
}

/**
 * Get brand colors by tier
 */
export function getBrandColorsByTier(tier: string): BrandColors {
  switch (tier) {
    case 'enterprise':
      return enterpriseBrandColors;
    case 'creative':
      return creativeBrandColors;
    case 'partner':
      return partnerBrandColors;
    case 'default':
    default:
      return defaultBrandColors;
  }
}

/**
 * List all available presets
 */
export function listThemePresets(): string[] {
  return Object.keys(themePresets);
}

/**
 * Get presets by brand tier
 */
export function getPresetsByTier(tier: string): ThemePreset[] {
  return Object.values(themePresets).filter(
    preset => preset.config.brandTier === tier
  );
}
