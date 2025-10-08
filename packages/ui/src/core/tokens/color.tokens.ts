/**
 * Color Tokens v2.0 — 2030 Apple-Grade Semantic System
 * Complete color token system with theme support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Base Color Palette
 * Foundation colors that themes derive from
 */
export const baseColors = {
  // Brand Colors
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Secondary
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Accent
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
  
  // Neutral Grays
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  
  // Semantic Colors
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308', // Warning
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
    950: '#422006',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
} as const;

/**
 * Light Theme Colors
 * Optimized for daylight viewing
 */
export const lightTheme = {
  // Brand
  primary: baseColors.blue[500],
  'primary-hover': baseColors.blue[600],
  'primary-active': baseColors.blue[700],
  'primary-foreground': '#FFFFFF',
  
  secondary: baseColors.purple[500],
  'secondary-hover': baseColors.purple[600],
  'secondary-active': baseColors.purple[700],
  'secondary-foreground': '#FFFFFF',
  
  accent: baseColors.cyan[500],
  'accent-hover': baseColors.cyan[600],
  'accent-active': baseColors.cyan[700],
  'accent-foreground': '#FFFFFF',
  
  // Surfaces
  background: '#FFFFFF',
  'background-secondary': baseColors.slate[50],
  'background-tertiary': baseColors.slate[100],
  
  surface: '#FFFFFF',
  'surface-hover': baseColors.slate[50],
  'surface-active': baseColors.slate[100],
  
  card: '#FFFFFF',
  'card-hover': baseColors.slate[50],
  
  // Text
  foreground: baseColors.slate[900],
  'foreground-secondary': baseColors.slate[700],
  'foreground-tertiary': baseColors.slate[500],
  'foreground-muted': baseColors.slate[400],
  
  // Borders
  border: baseColors.slate[200],
  'border-hover': baseColors.slate[300],
  'border-active': baseColors.slate[400],
  
  // States
  muted: baseColors.slate[100],
  'muted-foreground': baseColors.slate[500],
  
  // Semantic
  success: baseColors.green[500],
  'success-foreground': '#FFFFFF',
  'success-background': baseColors.green[50],
  'success-border': baseColors.green[200],
  
  warning: baseColors.yellow[500],
  'warning-foreground': baseColors.slate[900],
  'warning-background': baseColors.yellow[50],
  'warning-border': baseColors.yellow[200],
  
  error: baseColors.red[500],
  'error-foreground': '#FFFFFF',
  'error-background': baseColors.red[50],
  'error-border': baseColors.red[200],
  
  info: baseColors.blue[500],
  'info-foreground': '#FFFFFF',
  'info-background': baseColors.blue[50],
  'info-border': baseColors.blue[200],
  
  // Interactive
  link: baseColors.blue[600],
  'link-hover': baseColors.blue[700],
  'link-visited': baseColors.purple[600],
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  'focus-ring': baseColors.blue[500],
  'selection': baseColors.blue[100],
} as const;

/**
 * Dark Theme Colors
 * Optimized for low-light viewing
 */
export const darkTheme = {
  // Brand
  primary: baseColors.blue[400],
  'primary-hover': baseColors.blue[300],
  'primary-active': baseColors.blue[200],
  'primary-foreground': baseColors.slate[950],
  
  secondary: baseColors.purple[400],
  'secondary-hover': baseColors.purple[300],
  'secondary-active': baseColors.purple[200],
  'secondary-foreground': baseColors.slate[950],
  
  accent: baseColors.cyan[400],
  'accent-hover': baseColors.cyan[300],
  'accent-active': baseColors.cyan[200],
  'accent-foreground': baseColors.slate[950],
  
  // Surfaces
  background: baseColors.slate[950],
  'background-secondary': baseColors.slate[900],
  'background-tertiary': baseColors.slate[800],
  
  surface: baseColors.slate[900],
  'surface-hover': baseColors.slate[800],
  'surface-active': baseColors.slate[700],
  
  card: baseColors.slate[900],
  'card-hover': baseColors.slate[800],
  
  // Text
  foreground: baseColors.slate[50],
  'foreground-secondary': baseColors.slate[300],
  'foreground-tertiary': baseColors.slate[400],
  'foreground-muted': baseColors.slate[500],
  
  // Borders
  border: baseColors.slate[700],
  'border-hover': baseColors.slate[600],
  'border-active': baseColors.slate[500],
  
  // States
  muted: baseColors.slate[800],
  'muted-foreground': baseColors.slate[400],
  
  // Semantic
  success: baseColors.green[400],
  'success-foreground': baseColors.slate[950],
  'success-background': baseColors.green[950],
  'success-border': baseColors.green[800],
  
  warning: baseColors.yellow[400],
  'warning-foreground': baseColors.slate[950],
  'warning-background': baseColors.yellow[950],
  'warning-border': baseColors.yellow[800],
  
  error: baseColors.red[400],
  'error-foreground': baseColors.slate[950],
  'error-background': baseColors.red[950],
  'error-border': baseColors.red[800],
  
  info: baseColors.blue[400],
  'info-foreground': baseColors.slate[950],
  'info-background': baseColors.blue[950],
  'info-border': baseColors.blue[800],
  
  // Interactive
  link: baseColors.blue[400],
  'link-hover': baseColors.blue[300],
  'link-visited': baseColors.purple[400],
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
  'focus-ring': baseColors.blue[400],
  'selection': baseColors.blue[900],
} as const;

/**
 * High Contrast Theme Colors
 * Optimized for accessibility
 */
export const highContrastTheme = {
  // Brand
  primary: '#0066FF',
  'primary-hover': '#0052CC',
  'primary-active': '#003D99',
  'primary-foreground': '#FFFFFF',
  
  secondary: '#9333EA',
  'secondary-hover': '#7E22CE',
  'secondary-active': '#6B21A8',
  'secondary-foreground': '#FFFFFF',
  
  accent: '#0891B2',
  'accent-hover': '#0E7490',
  'accent-active': '#155E75',
  'accent-foreground': '#FFFFFF',
  
  // Surfaces
  background: '#FFFFFF',
  'background-secondary': '#F5F5F5',
  'background-tertiary': '#EBEBEB',
  
  surface: '#FFFFFF',
  'surface-hover': '#F5F5F5',
  'surface-active': '#EBEBEB',
  
  card: '#FFFFFF',
  'card-hover': '#F5F5F5',
  
  // Text
  foreground: '#000000',
  'foreground-secondary': '#333333',
  'foreground-tertiary': '#666666',
  'foreground-muted': '#999999',
  
  // Borders
  border: '#000000',
  'border-hover': '#333333',
  'border-active': '#666666',
  
  // States
  muted: '#F5F5F5',
  'muted-foreground': '#666666',
  
  // Semantic
  success: '#00AA00',
  'success-foreground': '#FFFFFF',
  'success-background': '#E6F7E6',
  'success-border': '#00AA00',
  
  warning: '#CC8800',
  'warning-foreground': '#000000',
  'warning-background': '#FFF4E6',
  'warning-border': '#CC8800',
  
  error: '#CC0000',
  'error-foreground': '#FFFFFF',
  'error-background': '#FFE6E6',
  'error-border': '#CC0000',
  
  info: '#0066FF',
  'info-foreground': '#FFFFFF',
  'info-background': '#E6F0FF',
  'info-border': '#0066FF',
  
  // Interactive
  link: '#0066FF',
  'link-hover': '#0052CC',
  'link-visited': '#9333EA',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.8)',
  'focus-ring': '#0066FF',
  'selection': '#B3D9FF',
} as const;

/**
 * Color Token Type
 */
export type ColorToken = keyof typeof lightTheme;

/**
 * Theme Type
 */
export type ThemeMode = 'light' | 'dark' | 'high-contrast';

/**
 * Get theme colors by mode
 */
export function getThemeColors(mode: ThemeMode) {
  switch (mode) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'high-contrast':
      return highContrastTheme;
    default:
      return lightTheme;
  }
}

/**
 * Export for CSS variable generation
 */
export const colorThemes = {
  light: lightTheme,
  dark: darkTheme,
  'high-contrast': highContrastTheme,
} as const;
