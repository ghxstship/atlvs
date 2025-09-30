import { routing } from '../routing';
import { Locale, LOCALE_INFO } from '../types';

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;

  if (routing.locales.includes(locale)) {
    return locale;
  }

  return routing.defaultLocale;
}

/**
 * Detect user locale from browser
 */
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') {
    return routing.defaultLocale;
  }

  // Check localStorage first
  const stored = localStorage.getItem('user-locale') as Locale;
  if (stored && routing.locales.includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (routing.locales.includes(browserLang)) {
    return browserLang;
  }

  // Check browser languages array
  for (const lang of navigator.languages) {
    const code = lang.split('-')[0] as Locale;
    if (routing.locales.includes(code)) {
      return code;
    }
  }

  return routing.defaultLocale;
}

/**
 * Get direction for locale (RTL/LTR)
 */
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_INFO[locale]?.rtl ? 'rtl' : 'ltr';
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: Locale = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
  locale: Locale = 'en'
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale, targetLocale: Locale = 'en'): string {
  return new Intl.DisplayNames([targetLocale], { type: 'language' }).of(locale) || locale;
}
