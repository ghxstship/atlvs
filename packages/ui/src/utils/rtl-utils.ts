/**
 * RTL (Right-to-Left) Layout Utilities
 * Enterprise-grade RTL support for GHXSTSHIP
 */

import { LOCALE_INFO, type Locale } from '../types';

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: Locale): boolean {
  return LOCALE_INFO[locale]?.rtl ?? false;
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

/**
 * Get CSS logical properties mapping for RTL support
 */
export function getLogicalProperties(): Record<string, string> {
  return {
    // Margins
    'margin-left': 'margin-inline-start',
    'margin-right': 'margin-inline-end',
    'margin-start': 'margin-inline-start',
    'margin-end': 'margin-inline-end',

    // Padding
    'padding-left': 'padding-inline-start',
    'padding-right': 'padding-inline-end',
    'padding-start': 'padding-inline-start',
    'padding-end': 'padding-inline-end',

    // Borders
    'border-left': 'border-inline-start',
    'border-right': 'border-inline-end',
    'border-left-width': 'border-inline-start-width',
    'border-right-width': 'border-inline-end-width',

    // Positioning
    'left': 'inset-inline-start',
    'right': 'inset-inline-end',

    // Text alignment
    'text-align-left': 'text-align-start',
    'text-align-right': 'text-align-end',

    // Floats
    'float-left': 'float-inline-start',
    'float-right': 'float-inline-end',
  };
}

/**
 * Generate RTL-specific CSS custom properties
 */
export function generateRTLCSS(): string {
  return `
/* RTL Layout Support */
[dir="rtl"] {
  /* Text alignment */
  text-align: right;

  /* Transform icons and arrows */
  .rtl-flip {
    transform: scaleX(-1);
  }

  /* Navigation arrows */
  .nav-arrow-left::before {
    content: "→";
  }

  .nav-arrow-right::before {
    content: "←";
  }
}

[dir="ltr"] {
  /* Default LTR text alignment */
  text-align: left;

  /* Navigation arrows */
  .nav-arrow-left::before {
    content: "←";
  }

  .nav-arrow-right::before {
    content: "→";
  }
}

/* Bidirectional text support */
.bidi-isolate {
  unicode-bidi: isolate;
  direction: var(--direction, ltr);
}

.bidi-override {
  unicode-bidi: bidi-override;
  direction: var(--direction, ltr);
}

.bidi-plaintext {
  unicode-bidi: plaintext;
}

/* RTL-aware spacing utilities */
.rtl-aware {
  margin-inline-start: var(--space-4);
  margin-inline-end: var(--space-2);
  padding-inline-start: var(--space-3);
  padding-inline-end: var(--space-3);
}

/* RTL-aware flexbox utilities */
.flex-rtl {
  flex-direction: row;
}

[dir="rtl"] .flex-rtl {
  flex-direction: row-reverse;
}

/* RTL-aware positioning */
.position-rtl-aware {
  inset-inline-start: var(--space-4);
  inset-inline-end: auto;
}

[dir="rtl"] .position-rtl-aware {
  inset-inline-start: auto;
  inset-inline-end: var(--space-4);
}
`;
}

/**
 * RTL-aware utility functions for components
 */
export const rtlUtils = {
  /**
   * Get appropriate icon for navigation direction
   */
  getNavigationIcon: (direction: 'prev' | 'next', locale: Locale): string => {
    const isRTL = isRTLLocale(locale);
    if (direction === 'prev') {
      return isRTL ? '→' : '←';
    } else {
      return isRTL ? '←' : '→';
    }
  },

  /**
   * Get appropriate transform for icons that need flipping in RTL
   */
  getIconTransform: (locale: Locale): string => {
    return isRTLLocale(locale) ? 'scaleX(-1)' : 'none';
  },

  /**
   * Get logical margin/padding values
   */
  getLogicalSpacing: (start?: string, end?: string): {
    marginInlineStart?: string;
    marginInlineEnd?: string;
    paddingInlineStart?: string;
    paddingInlineEnd?: string;
  } => {
    const result: any = {};
    if (start) {
      result.marginInlineStart = start;
      result.paddingInlineStart = start;
    }
    if (end) {
      result.marginInlineEnd = end;
      result.paddingInlineEnd = end;
    }
    return result;
  },

  /**
   * Get appropriate text alignment for locale
   */
  getTextAlignment: (alignment: 'left' | 'right' | 'center' | 'start' | 'end', locale: Locale): string => {
    if (alignment === 'start') return 'start';
    if (alignment === 'end') return 'end';
    if (alignment === 'center') return 'center';

    const isRTL = isRTLLocale(locale);
    if (alignment === 'left') return isRTL ? 'right' : 'left';
    if (alignment === 'right') return isRTL ? 'left' : 'right';

    return alignment;
  },
};
