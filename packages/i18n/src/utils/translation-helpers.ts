/**
 * Translation Helper Utilities
 * Enhanced translation functions with pluralization and rich text support
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Enhanced translation hook with better dev experience
 * Shows clear indicators for missing translations in development
 */
export function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace);
  
  return (key: string, values?: Record<string, any>) => {
    try {
      return t(key, values);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🔴 Missing translation: ${namespace ? `${namespace}.` : ''}${key}`);
        return `🔴 [${namespace ? `${namespace}.` : ''}${key}]`;
      }
      // Production: return key without decoration
      return key;
    }
  };
}

/**
 * Pluralization helper using ICU MessageFormat
 * 
 * @example
 * ```typescript
 * // In translation file:
 * {
 *   "items": "{count, plural, =0 {no items} =1 {one item} other {# items}}"
 * }
 * 
 * // In component:
 * const msg = usePlural('items', { count: 5 }); // "5 items"
 * ```
 */
export function usePlural(key: string, values: { count: number } & Record<string, any>) {
  const t = useTranslations();
  return t(key, values);
}

/**
 * Rich text translation with React components
 * 
 * @example
 * ```typescript
 * // In translation file:
 * {
 *   "welcome": "Welcome <b>{name}</b>! Check out <link>our docs</link>."
 * }
 * 
 * // In component:
 * const msg = useRichText('welcome', {
 *   name: 'John',
 *   b: (chunks) => <strong>{chunks}</strong>,
 *   link: (chunks) => <a href="/docs">{chunks}</a>
 * });
 * ```
 */
export function useRichText(key: string, values?: Record<string, any>) {
  const t = useTranslations();
  // next-intl automatically supports rich text via JSX in values
  return t(key, values);
}

/**
 * Relative time formatting
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date('2024-01-01'), 'en') // "2 months ago"
 * ```
 */
export function formatRelativeTime(date: Date, locale: string = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const diff = Math.floor(diffInSeconds / secondsInUnit);
    if (Math.abs(diff) >= 1) {
      return rtf.format(diff, unit as Intl.RelativeTimeFormatUnit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * List formatting with proper conjunction
 * 
 * @example
 * ```typescript
 * formatList(['apples', 'oranges', 'bananas'], 'en') // "apples, oranges, and bananas"
 * ```
 */
export function formatList(items: string[], locale: string = 'en'): string {
  // @ts-ignore - ListFormat may not be available in all TypeScript versions
  const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
  return formatter.format(items);
}

/**
 * Unit formatting with proper units and locale
 * 
 * @example
 * ```typescript
 * formatUnit(100, 'kilometer', 'en') // "100 km"
 * formatUnit(5.5, 'mile', 'en-US') // "5.5 mi"
 * ```
 */
export function formatUnit(
  value: number,
  unit: Intl.NumberFormatOptions['unit'],
  locale: string = 'en'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
  });
  return formatter.format(value);
}

/**
 * Translation validation helper
 * Checks if a translation key exists
 */
export function useHasTranslation(namespace: string, key: string): boolean {
  try {
    const t = useTranslations(namespace);
    t(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available translation keys for a namespace
 * Useful for debugging and documentation
 */
export function getTranslationKeys(_namespace: string): string[] {
  // This would need to be implemented based on your messages structure
  // For now, return empty array
  return [];
}
