/**
 * Generates CSS custom properties and Tailwind config from brand theme
 */

import type { ThemeConfig } from './types';

function hexToHslString(hexColor: string, fallback: string): string {
  const hex = hexColor?.trim().replace('#', '') ?? '';
  const normalized = hex.length === 3
    ? hex.split('').map(char => `${char}${char}`).join('')
    : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return fallback;
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * Generate CSS custom properties from brand theme configuration
 */
export function generateThemeCSS(theme: ThemeConfig): string {
  const { colors, typography, spacing, borderRadius, shadows } = theme;

  const background = hexToHslString(colors.neutral['50'], '0 0% 100%');
  const foreground = hexToHslString(colors.neutral['900'], '222 47% 11%');
  const card = hexToHslString(colors.neutral['100'], '0 0% 100%');
  const cardForeground = foreground;
  const popover = card;
  const popoverForeground = foreground;
  const border = hexToHslString(colors.neutral['200'], '214 32% 91%');
  const muted = hexToHslString(colors.neutral['100'], '210 40% 96%');
  const mutedForeground = hexToHslString(colors.neutral['600'], '215 16% 47%');
  const primary = hexToHslString(colors.brand.primary, '158 64% 52%');
  const primaryForeground = hexToHslString('#FFFFFF', '0 0% 100%');
  const secondary = hexToHslString(colors.brand.secondary, '210 40% 96%');
  const secondaryForeground = foreground;
  const accent = hexToHslString(colors.brand.accent, primary);
  const accentForeground = primaryForeground;
  const success = hexToHslString(colors.semantic.success, '142 76% 36%');
  const warning = hexToHslString(colors.semantic.warning, '43 96% 56%');
  const error = hexToHslString(colors.semantic.error, '0 84% 60%');
  const info = hexToHslString(colors.semantic.info, primary);

  return `
    :root {
      /* ========================================
         Brand Colors
         ======================================== */
      --color-brand-primary: ${colors.brand.primary};
      --color-brand-secondary: ${colors.brand.secondary};
      --color-brand-accent: ${colors.brand.accent};
      --color-background: ${background};
      --color-foreground: ${foreground};
      --color-card: ${card};
      --color-card-foreground: ${cardForeground};
      --color-popover: ${popover};
      --color-popover-foreground: ${popoverForeground};
      --color-border: ${border};
      --color-muted: ${muted};
      --color-muted-foreground: ${mutedForeground};

      /* Semantic Colors */
      --color-primary: ${primary};
      --color-primary-foreground: ${primaryForeground};
      --color-secondary: ${secondary};
      --color-secondary-foreground: ${secondaryForeground};
      --color-accent: ${accent};
      --color-accent-foreground: ${accentForeground};
      --color-success: ${success};
      --color-success-foreground: ${primaryForeground};
      --color-warning: ${warning};
      --color-warning-foreground: ${primaryForeground};
      --color-destructive: ${error};
      --color-destructive-foreground: ${primaryForeground};
      --color-info: ${info};
      --color-info-foreground: ${primaryForeground};
      --color-input: ${border};
      --color-ring: ${primary};

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

      /* Shorthand aliases for Tailwind preset compatibility */
      --background: ${background};
      --foreground: ${foreground};
      --card: ${card};
      --card-foreground: ${cardForeground};
      --popover: ${popover};
      --popover-foreground: ${popoverForeground};
      --primary: ${primary};
      --primary-foreground: ${primaryForeground};
      --secondary: ${secondary};
      --secondary-foreground: ${secondaryForeground};
      --muted: ${muted};
      --muted-foreground: ${mutedForeground};
      --accent: ${accent};
      --accent-foreground: ${accentForeground};
      --success: ${success};
      --success-foreground: ${primaryForeground};
      --warning: ${warning};
      --warning-foreground: ${primaryForeground};
      --destructive: ${error};
      --destructive-foreground: ${primaryForeground};
      --info: ${info};
      --info-foreground: ${primaryForeground};
      --border: ${border};
      --input: ${border};
      --ring: ${primary};

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
