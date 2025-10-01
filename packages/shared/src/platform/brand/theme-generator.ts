/**
 * Theme Generator
 * Generates CSS custom properties and Tailwind config from brand theme
 */

import type { ThemeConfig } from './types';

/**
 * Generate CSS custom properties from brand theme configuration
 */
export function generateThemeCSS(theme: ThemeConfig): string {
  const { colors, typography, spacing, borderRadius, shadows } = theme;

  return `
    :root {
      /* ========================================
         Brand Colors
         ======================================== */
      --color-brand-primary: ${colors.brand.primary};
      --color-brand-secondary: ${colors.brand.secondary};
      --color-brand-accent: ${colors.brand.accent};
      
      /* Semantic Colors */
      --color-success: ${colors.semantic.success};
      --color-warning: ${colors.semantic.warning};
      --color-error: ${colors.semantic.error};
      --color-info: ${colors.semantic.info};
      
      /* Neutral Scale */
      --color-neutral-50: ${colors.neutral['50']};
      --color-neutral-100: ${colors.neutral['100']};
      --color-neutral-200: ${colors.neutral['200']};
      --color-neutral-300: ${colors.neutral['300']};
      --color-neutral-400: ${colors.neutral['400']};
      --color-neutral-500: ${colors.neutral['500']};
      --color-neutral-600: ${colors.neutral['600']};
      --color-neutral-700: ${colors.neutral['700']};
      --color-neutral-800: ${colors.neutral['800']};
      --color-neutral-900: ${colors.neutral['900']};

      /* ========================================
         Typography
         ======================================== */
      --font-heading: ${typography.fontFamily.heading};
      --font-body: ${typography.fontFamily.body};
      --font-mono: ${typography.fontFamily.mono};
      
      /* Font Sizes */
      --font-size-xs: ${typography.fontSize.xs};
      --font-size-sm: ${typography.fontSize.sm};
      --font-size-base: ${typography.fontSize.base};
      --font-size-lg: ${typography.fontSize.lg};
      --font-size-xl: ${typography.fontSize.xl};
      --font-size-2xl: ${typography.fontSize['2xl']};
      --font-size-3xl: ${typography.fontSize['3xl']};
      --font-size-4xl: ${typography.fontSize['4xl']};
      --font-size-5xl: ${typography.fontSize['5xl']};
      
      /* Font Weights */
      --font-weight-normal: ${typography.fontWeight.normal};
      --font-weight-medium: ${typography.fontWeight.medium};
      --font-weight-semibold: ${typography.fontWeight.semibold};
      --font-weight-bold: ${typography.fontWeight.bold};
      ${typography.fontWeight.black ? `--font-weight-black: ${typography.fontWeight.black};` : ''}

      /* ========================================
         Spacing System
         ======================================== */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
      --spacing-2xl: ${spacing['2xl']};
      --spacing-3xl: ${spacing['3xl']};

      /* ========================================
         Border Radius
         ======================================== */
      --radius-sm: ${borderRadius.sm};
      --radius-base: ${borderRadius.base};
      --radius-md: ${borderRadius.md};
      --radius-lg: ${borderRadius.lg};
      --radius-xl: ${borderRadius.xl};
      --radius-full: ${borderRadius.full};

      /* ========================================
         Shadows
         ======================================== */
      --shadow-sm: ${shadows.sm};
      --shadow-base: ${shadows.base};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
    }

    /* Apply brand fonts to appropriate elements */
    body {
      font-family: var(--font-body);
    }

    h1, h2, h3, h4, h5, h6,
    .font-heading {
      font-family: var(--font-heading);
    }

    code, pre,
    .font-mono {
      font-family: var(--font-mono);
    }
  `.trim();
}

/**
 * Generate Tailwind theme extension from brand theme
 */
export function generateTailwindTheme(theme: ThemeConfig) {
  return {
    extend: {
      colors: {
        brand: {
          primary: theme.colors.brand.primary,
          secondary: theme.colors.brand.secondary,
          accent: theme.colors.brand.accent,
        },
        success: theme.colors.semantic.success,
        warning: theme.colors.semantic.warning,
        error: theme.colors.semantic.error,
        info: theme.colors.semantic.info,
        neutral: {
          50: theme.colors.neutral['50'],
          100: theme.colors.neutral['100'],
          200: theme.colors.neutral['200'],
          300: theme.colors.neutral['300'],
          400: theme.colors.neutral['400'],
          500: theme.colors.neutral['500'],
          600: theme.colors.neutral['600'],
          700: theme.colors.neutral['700'],
          800: theme.colors.neutral['800'],
          900: theme.colors.neutral['900'],
        },
      },
      fontFamily: {
        heading: theme.typography.fontFamily.heading.split(',').map(f => f.trim()),
        body: theme.typography.fontFamily.body.split(',').map(f => f.trim()),
        mono: theme.typography.fontFamily.mono.split(',').map(f => f.trim()),
      },
      fontSize: {
        xs: theme.typography.fontSize.xs,
        sm: theme.typography.fontSize.sm,
        base: theme.typography.fontSize.base,
        lg: theme.typography.fontSize.lg,
        xl: theme.typography.fontSize.xl,
        '2xl': theme.typography.fontSize['2xl'],
        '3xl': theme.typography.fontSize['3xl'],
        '4xl': theme.typography.fontSize['4xl'],
        '5xl': theme.typography.fontSize['5xl'],
      },
      fontWeight: {
        normal: theme.typography.fontWeight.normal,
        medium: theme.typography.fontWeight.medium,
        semibold: theme.typography.fontWeight.semibold,
        bold: theme.typography.fontWeight.bold,
        ...(theme.typography.fontWeight.black && { black: theme.typography.fontWeight.black }),
      },
      spacing: {
        xs: theme.spacing.xs,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
        xl: theme.spacing.xl,
        '2xl': theme.spacing['2xl'],
        '3xl': theme.spacing['3xl'],
      },
      borderRadius: {
        sm: theme.borderRadius.sm,
        DEFAULT: theme.borderRadius.base,
        md: theme.borderRadius.md,
        lg: theme.borderRadius.lg,
        xl: theme.borderRadius.xl,
        full: theme.borderRadius.full,
      },
      boxShadow: {
        sm: theme.shadows.sm,
        DEFAULT: theme.shadows.base,
        md: theme.shadows.md,
        lg: theme.shadows.lg,
      },
    },
  };
}

/**
 * Generate font @import statements for custom fonts
 */
export function generateFontImports(fonts?: Array<{ family: string; src: string; weight: number; style: string }>): string {
  if (!fonts || fonts.length === 0) return '';

  return fonts.map(font => `
    @font-face {
      font-family: '${font.family}';
      src: url('${font.src}') format('woff2');
      font-weight: ${font.weight};
      font-style: ${font.style};
      font-display: swap;
    }
  `).join('\n');
}
