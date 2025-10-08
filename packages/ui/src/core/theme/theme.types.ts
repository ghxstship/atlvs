/**
 * Theme Types — Type Definitions for Theme System
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import type { ThemeMode as ColorThemeMode } from '../tokens/color.tokens';

/**
 * Theme Mode
 * System-level theme modes
 */
export type ThemeMode = ColorThemeMode | 'auto';

/**
 * Brand Tier
 * Multi-tier branding support
 */
export type BrandTier = 'default' | 'enterprise' | 'creative' | 'partner';

/**
 * Theme Configuration
 * Complete theme settings
 */
export interface ThemeConfig {
  /** Theme mode (light, dark, high-contrast, auto) */
  mode: ThemeMode;
  
  /** Brand tier (default, enterprise, creative, partner) */
  brandTier: BrandTier;
  
  /** Custom brand overrides */
  brandOverrides?: Partial<BrandColors>;
  
  /** Enable system preference detection */
  detectSystemTheme?: boolean;
  
  /** Enable smooth theme transitions */
  enableTransitions?: boolean;
  
  /** Storage key for persisting preferences */
  storageKey?: string;
}

/**
 * Brand Colors
 * Customizable brand color palette
 */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Theme Context Value
 * Values provided by ThemeProvider
 */
export interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;
  
  /** Resolved theme mode (auto resolves to light/dark) */
  resolvedMode: Exclude<ThemeMode, 'auto'>;
  
  /** Current brand tier */
  brandTier: BrandTier;
  
  /** Brand colors */
  brandColors: BrandColors;
  
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;
  
  /** Set brand tier */
  setBrandTier: (tier: BrandTier) => void;
  
  /** Set brand color overrides */
  setBrandColors: (colors: Partial<BrandColors>) => void;
  
  /** Toggle between light and dark */
  toggleMode: () => void;
  
  /** Check if system prefers dark mode */
  systemPrefersDark: boolean;
}

/**
 * Theme Preset
 * Pre-configured theme settings
 */
export interface ThemePreset {
  name: string;
  config: ThemeConfig;
  brandColors: BrandColors;
  description?: string;
}

/**
 * CSS Variable Map
 * Generated CSS custom properties
 */
export type CSSVariableMap = Record<string, string>;

/**
 * Theme Change Event
 * Event emitted when theme changes
 */
export interface ThemeChangeEvent {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, 'auto'>;
  brandTier: BrandTier;
  timestamp: number;
}
