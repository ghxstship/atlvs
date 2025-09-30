/**
 * GHXSTSHIP Tailwind Configuration - Token-Driven
 * 
 * This configuration consumes design tokens from TypeScript
 * ensuring single source of truth: TypeScript → Tailwind
 */

import type { Config } from 'tailwindcss';
import { DESIGN_TOKENS } from './src/tokens/unified-design-tokens';

/**
 * Convert spacing tokens to Tailwind format
 */
function generateSpacingScale() {
  const spacing: Record<string, string> = {};
  Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
    spacing[key] = value;
  });
  return spacing;
}

/**
 * Convert color tokens to Tailwind format
 */
function generateColorScale() {
  const colors: Record<string, any> = {
    // Base colors
    white: DESIGN_TOKENS.colors.base.white,
    black: DESIGN_TOKENS.colors.base.black,
    transparent: DESIGN_TOKENS.colors.base.transparent,
    
    // Gray scale
    gray: DESIGN_TOKENS.colors.gray,
    
    // Brand colors
    'brand-primary': DESIGN_TOKENS.colors.brand.primary,
    'brand-accent': DESIGN_TOKENS.colors.brand.accent,
    
    // Semantic colors
    success: DESIGN_TOKENS.colors.semantic.success,
    warning: DESIGN_TOKENS.colors.semantic.warning,
    error: DESIGN_TOKENS.colors.semantic.error,
    info: DESIGN_TOKENS.colors.semantic.info,
    
    // Semantic aliases for Tailwind utilities
    background: 'hsl(var(--color-background))',
    foreground: 'hsl(var(--color-foreground))',
    card: 'hsl(var(--color-card))',
    'card-foreground': 'hsl(var(--color-card-foreground))',
    popover: 'hsl(var(--color-popover))',
    'popover-foreground': 'hsl(var(--color-popover-foreground))',
    primary: 'hsl(var(--color-primary))',
    'primary-foreground': 'hsl(var(--color-primary-foreground))',
    secondary: 'hsl(var(--color-secondary))',
    'secondary-foreground': 'hsl(var(--color-secondary-foreground))',
    muted: 'hsl(var(--color-muted))',
    'muted-foreground': 'hsl(var(--color-muted-foreground))',
    accent: 'hsl(var(--color-accent))',
    'accent-foreground': 'hsl(var(--color-accent-foreground))',
    destructive: 'hsl(var(--color-destructive))',
    'destructive-foreground': 'hsl(var(--color-destructive-foreground))',
    border: 'hsl(var(--color-border))',
    input: 'hsl(var(--color-input))',
    ring: 'hsl(var(--color-ring))',
  };
  
  return colors;
}

/**
 * Convert font size tokens to Tailwind format
 */
function generateFontSizeScale() {
  const fontSize: Record<string, string> = {};
  Object.entries(DESIGN_TOKENS.typography.fontSize).forEach(([key, value]) => {
    fontSize[key] = value;
  });
  return fontSize;
}

/**
 * Convert border radius tokens to Tailwind format
 */
function generateBorderRadiusScale() {
  const borderRadius: Record<string, string> = {};
  Object.entries(DESIGN_TOKENS.borderRadius).forEach(([key, value]) => {
    borderRadius[key] = value;
  });
  return borderRadius;
}

/**
 * Convert box shadow tokens to Tailwind format
 */
function generateBoxShadowScale() {
  const boxShadow: Record<string, string> = {
    sm: DESIGN_TOKENS.shadows.sm,
    DEFAULT: DESIGN_TOKENS.shadows.base,
    md: DESIGN_TOKENS.shadows.md,
    lg: DESIGN_TOKENS.shadows.lg,
    xl: DESIGN_TOKENS.shadows.xl,
    '2xl': DESIGN_TOKENS.shadows['2xl'],
    inner: DESIGN_TOKENS.shadows.inner,
    none: 'none',
  };
  
  // Add pop art shadows
  Object.entries(DESIGN_TOKENS.shadows.pop).forEach(([key, value]) => {
    boxShadow[`pop-${key}`] = value;
  });
  
  // Add glow shadows
  Object.entries(DESIGN_TOKENS.shadows.glow).forEach(([key, value]) => {
    boxShadow[`glow-${key}`] = value;
  });
  
  return boxShadow;
}

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: generateColorScale(),
      spacing: generateSpacingScale(),
      fontSize: generateFontSizeScale(),
      fontFamily: {
        title: DESIGN_TOKENS.typography.fontFamily.title,
        body: DESIGN_TOKENS.typography.fontFamily.body,
        mono: DESIGN_TOKENS.typography.fontFamily.mono,
      },
      fontWeight: DESIGN_TOKENS.typography.fontWeight,
      lineHeight: DESIGN_TOKENS.typography.lineHeight,
      letterSpacing: DESIGN_TOKENS.typography.letterSpacing,
      borderRadius: generateBorderRadiusScale(),
      borderWidth: DESIGN_TOKENS.borderWidth,
      boxShadow: generateBoxShadowScale(),
      zIndex: DESIGN_TOKENS.zIndex,
      transitionDuration: DESIGN_TOKENS.animation.duration,
      transitionTimingFunction: DESIGN_TOKENS.animation.easing,
      screens: DESIGN_TOKENS.breakpoints,
      // Component-specific sizes
      height: {
        ...generateSpacingScale(),
        ...DESIGN_TOKENS.sizes,
      },
      width: {
        ...generateSpacingScale(),
        ...DESIGN_TOKENS.sizes,
      },
      minHeight: DESIGN_TOKENS.sizes,
      minWidth: DESIGN_TOKENS.sizes,
      maxHeight: DESIGN_TOKENS.sizes,
      maxWidth: DESIGN_TOKENS.sizes,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};

export default config;
