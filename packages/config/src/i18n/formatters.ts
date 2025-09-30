/**
 * Internationalization Formatting Utilities
 * Centralized formatting for dates, numbers, currency, and regional data
 */

import type { Locale } from './config';

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: Locale;
  timezone?: string;
}

/**
 * Format date with locale-aware formatting
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en', timezone, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const formatOptions: Intl.DateTimeFormatOptions = {
    ...intlOptions,
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format date as short format (e.g., 12/31/2024)
 */
export function formatDateShort(date: Date | string | number, locale: Locale = 'en'): string {
  return formatDate(date, {
    locale,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date as long format (e.g., December 31, 2024)
 */
export function formatDateLong(date: Date | string | number, locale: Locale = 'en'): string {
  return formatDate(date, {
    locale,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time with locale-aware formatting
 */
export function formatTime(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en', timezone, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...intlOptions,
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format datetime with locale-aware formatting
 */
export function formatDateTime(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en', timezone, ...intlOptions } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...intlOptions,
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale = 'en',
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diffMs = dateObj.getTime() - baseDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffYear) >= 1) return rtf.format(diffYear, 'year');
  if (Math.abs(diffMonth) >= 1) return rtf.format(diffMonth, 'month');
  if (Math.abs(diffWeek) >= 1) return rtf.format(diffWeek, 'week');
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  locale?: Locale;
}

/**
 * Format number with locale-aware formatting
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const { locale = 'en', ...intlOptions } = options;
  return new Intl.NumberFormat(locale, intlOptions).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const { locale = 'en', minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Format number with compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const { locale = 'en', ...intlOptions } = options;
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    ...intlOptions,
  }).format(value);
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export interface CurrencyFormatOptions extends NumberFormatOptions {
  currency?: string;
  display?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
}

/**
 * Format currency with locale-aware formatting
 */
export function formatCurrency(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en',
    currency = 'USD',
    display = 'symbol',
    ...intlOptions
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: display,
    ...intlOptions,
  }).format(value);
}

/**
 * Format currency with compact notation
 */
export function formatCompactCurrency(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en',
    currency = 'USD',
    display = 'narrowSymbol',
    ...intlOptions
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: display,
    notation: 'compact',
    compactDisplay: 'short',
    ...intlOptions,
  }).format(value);
}

// ============================================================================
// LIST FORMATTING
// ============================================================================

export interface ListFormatOptions {
  locale?: Locale;
  type?: 'conjunction' | 'disjunction' | 'unit';
  style?: 'long' | 'short' | 'narrow';
}

/**
 * Format list with locale-aware conjunction (e.g., "A, B, and C")
 */
export function formatList(
  items: string[],
  options: ListFormatOptions = {}
): string {
  const { locale = 'en', ...intlOptions } = options;
  // @ts-ignore - Intl.ListFormat is available in modern browsers (ES2021+)
  return new Intl.ListFormat(locale, intlOptions).format(items);
}

// ============================================================================
// DISPLAY NAMES
// ============================================================================

/**
 * Get localized language name
 */
export function getLanguageName(
  languageCode: string,
  locale: Locale = 'en'
): string {
  return new Intl.DisplayNames([locale], { type: 'language' }).of(languageCode) || languageCode;
}

/**
 * Get localized region name
 */
export function getRegionName(
  regionCode: string,
  locale: Locale = 'en'
): string {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(regionCode) || regionCode;
}

/**
 * Get localized currency name
 */
export function getCurrencyName(
  currencyCode: string,
  locale: Locale = 'en'
): string {
  return new Intl.DisplayNames([locale], { type: 'currency' }).of(currencyCode) || currencyCode;
}

// ============================================================================
// PLURALIZATION
// ============================================================================

/**
 * Get plural category for a number
 */
export function getPluralCategory(
  value: number,
  locale: Locale = 'en'
): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(value);
}

/**
 * Format with plural rules
 */
export function formatPlural(
  value: number,
  forms: Record<Intl.LDMLPluralRule, string>,
  locale: Locale = 'en'
): string {
  const category = getPluralCategory(value, locale);
  return forms[category] || forms.other || '';
}

// ============================================================================
// TIMEZONE UTILITIES
// ============================================================================

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert date to specific timezone
 */
export function convertToTimezone(
  date: Date | string | number,
  timezone: string,
  locale: Locale = 'en'
): string {
  return formatDateTime(date, { locale, timezone });
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

// ============================================================================
// MEMOIZATION FOR PERFORMANCE
// ============================================================================

const formatterCache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

/**
 * Get cached formatter for performance
 */
export function getCachedFormatter<T extends Intl.DateTimeFormat | Intl.NumberFormat>(
  key: string,
  factory: () => T
): T {
  if (!formatterCache.has(key)) {
    formatterCache.set(key, factory());
  }
  return formatterCache.get(key) as T;
}
