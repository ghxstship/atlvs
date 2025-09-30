/**
 * GHXSTSHIP Internationalization Utilities
 * Enterprise-grade i18n utilities with locale-aware formatting
 */

import { getLocale } from 'next-intl/server';

// ==========================================
// DATE/TIME FORMATTING
// ==========================================

/**
 * Format date with locale awareness
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale?: string
): string {
  const dateObj = new Date(date);
  const targetLocale = locale || getLocale();

  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format time with locale awareness
 */
export function formatTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale?: string
): string {
  const dateObj = new Date(date);
  const targetLocale = locale || getLocale();

  return new Intl.DateTimeFormat(targetLocale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
}

/**
 * Format datetime with locale awareness
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale?: string
): string {
  const dateObj = new Date(date);
  const targetLocale = locale || getLocale();

  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale?: string
): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const targetLocale = locale || getLocale();

  if (diffInMinutes < 1) {
    return getTranslation('time.justNow', {}, targetLocale);
  } else if (diffInMinutes < 60) {
    return getTranslation('time.minutesAgo', { count: diffInMinutes }, targetLocale);
  } else if (diffInHours < 24) {
    return getTranslation('time.hoursAgo', { count: diffInHours }, targetLocale);
  } else if (diffInDays < 7) {
    return getTranslation('time.daysAgo', { count: diffInDays }, targetLocale);
  } else {
    return formatDate(dateObj, {}, targetLocale);
  }
}

// ==========================================
// NUMBER FORMATTING
// ==========================================

/**
 * Format currency with locale awareness
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale?: string
): string {
  const targetLocale = locale || getLocale();

  return new Intl.NumberFormat(targetLocale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with locale awareness
 */
export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions = {},
  locale?: string
): string {
  const targetLocale = locale || getLocale();

  return new Intl.NumberFormat(targetLocale, options).format(number);
}

/**
 * Format percentage with locale awareness
 */
export function formatPercent(
  number: number,
  locale?: string
): string {
  const targetLocale = locale || getLocale();

  return new Intl.NumberFormat(targetLocale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(number);
}

// ==========================================
// TRANSLATION HELPERS
// ==========================================

/**
 * Get translation with fallback
 */
export async function getTranslation(
  key: string,
  params: Record<string, any> = {},
  locale?: string
): Promise<string> {
  try {
    // This would be replaced with actual next-intl usage
    // For now, return a placeholder
    return `[${key}]`;
  } catch (error) {
    console.warn(`Translation missing for key: ${key}`);
    return `[${key}]`;
  }
}

// ==========================================
// TIMEZONE UTILITIES
// ==========================================

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') return 'UTC';
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert date to user's timezone
 */
export function convertToUserTimezone(
  date: Date | string | number,
  fromTimezone?: string
): Date {
  const dateObj = new Date(date);

  if (fromTimezone) {
    // Convert from source timezone to UTC, then to user timezone
    // This is a simplified implementation
    return dateObj;
  }

  return dateObj;
}

/**
 * Format date in specific timezone
 */
export function formatInTimezone(
  date: Date | string | number,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
  locale?: string
): string {
  const dateObj = new Date(date);
  const targetLocale = locale || getLocale();

  return new Intl.DateTimeFormat(targetLocale, {
    ...options,
    timeZone: timezone,
  }).format(dateObj);
}

// ==========================================
// ADDRESS FORMATTING
// ==========================================

/**
 * Format address based on locale
 */
export function formatAddress(
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  },
  locale?: string
): string {
  const targetLocale = locale || getLocale();

  // Simplified address formatting - would need country-specific logic
  const parts = [
    address.street,
    address.city && address.state ? `${address.city}, ${address.state}` : address.city,
    address.zipCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

// ==========================================
// PHONE NUMBER FORMATTING
// ==========================================

/**
 * Format phone number based on locale
 */
export function formatPhoneNumber(
  phoneNumber: string,
  locale?: string
): string {
  const targetLocale = locale || getLocale();

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Simple formatting - would need country-specific logic
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phoneNumber;
}

// ==========================================
// PLURALIZATION HELPERS
// ==========================================

/**
 * Get plural form for a number (simplified)
 */
export function getPluralForm(
  count: number,
  locale: string = 'en'
): 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' {
  if (locale === 'en') {
    return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
  }

  // Simplified - would need full Unicode CLDR plural rules
  return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
}

// ==========================================
// RTL SUPPORT
// ==========================================

/**
 * Check if locale requires RTL layout
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur', 'yi'];
  return rtlLocales.includes(locale.split('-')[0]);
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

/**
 * Get CSS direction property
 */
export function getCSSDirection(locale: string): string {
  return getTextDirection(locale);
}

// ==========================================
// CALENDAR SYSTEMS
// ==========================================

/**
 * Format date in specific calendar system
 */
export function formatInCalendar(
  date: Date | string | number,
  calendar: 'gregory' | 'islamic' | 'hebrew' | 'japanese' = 'gregory',
  locale?: string
): string {
  const dateObj = new Date(date);
  const targetLocale = locale || getLocale();

  try {
    return new Intl.DateTimeFormat(targetLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar,
    }).format(dateObj);
  } catch (error) {
    // Fallback to Gregorian calendar
    return formatDate(dateObj, {}, targetLocale);
  }
}
