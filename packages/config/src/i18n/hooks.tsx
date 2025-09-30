/**
 * i18n React Hooks
 * Client-side hooks for translations and locale management
 */

'use client';

import { useLocale, useTranslations as useNextIntlTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import type { Locale } from './config';
import { getDirection, isRTL } from './config';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatTime,
  getUserTimezone,
  type CurrencyFormatOptions,
  type DateFormatOptions,
  type NumberFormatOptions,
} from './formatters';

// ============================================================================
// LOCALE HOOKS
// ============================================================================

/**
 * Get current locale
 */
export function useCurrentLocale(): Locale {
  return useLocale() as Locale;
}

/**
 * Get text direction for current locale
 */
export function useTextDirection(): 'ltr' | 'rtl' {
  const locale = useCurrentLocale();
  return getDirection(locale);
}

/**
 * Check if current locale is RTL
 */
export function useIsRTL(): boolean {
  const locale = useCurrentLocale();
  return isRTL(locale);
}

// ============================================================================
// TRANSLATION HOOKS
// ============================================================================

/**
 * Get translations for a namespace
 */
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

/**
 * Get scoped translations with type safety
 */
export function useScopedTranslations<T extends Record<string, unknown>>(
  namespace: string
): (key: keyof T) => string {
  const t = useNextIntlTranslations(namespace);
  return useCallback((key: keyof T) => t(key as string), [t]);
}

// ============================================================================
// FORMATTING HOOKS
// ============================================================================

/**
 * Hook for date formatting
 */
export function useDateFormatter() {
  const locale = useCurrentLocale();
  const timezone = getUserTimezone();

  return useMemo(
    () => ({
      format: (date: Date | string | number, options?: DateFormatOptions) =>
        formatDate(date, { locale, timezone, ...options }),
      formatShort: (date: Date | string | number) =>
        formatDate(date, { locale, year: 'numeric', month: '2-digit', day: '2-digit' }),
      formatLong: (date: Date | string | number) =>
        formatDate(date, { locale, year: 'numeric', month: 'long', day: 'numeric' }),
      formatTime: (date: Date | string | number, options?: DateFormatOptions) =>
        formatTime(date, { locale, timezone, ...options }),
      formatDateTime: (date: Date | string | number, options?: DateFormatOptions) =>
        formatDateTime(date, { locale, timezone, ...options }),
      formatRelative: (date: Date | string | number, baseDate?: Date) =>
        formatRelativeTime(date, locale, baseDate),
    }),
    [locale, timezone]
  );
}

/**
 * Hook for number formatting
 */
export function useNumberFormatter() {
  const locale = useCurrentLocale();

  return useMemo(
    () => ({
      format: (value: number, options?: NumberFormatOptions) =>
        formatNumber(value, { locale, ...options }),
      formatCompact: (value: number, options?: NumberFormatOptions) =>
        formatNumber(value, { locale, notation: 'compact', ...options }),
      formatPercent: (value: number, options?: NumberFormatOptions) =>
        formatNumber(value, { locale, style: 'percent', ...options }),
    }),
    [locale]
  );
}

/**
 * Hook for currency formatting
 */
export function useCurrencyFormatter(defaultCurrency: string = 'USD') {
  const locale = useCurrentLocale();

  return useMemo(
    () => ({
      format: (value: number, options?: CurrencyFormatOptions) =>
        formatCurrency(value, { locale, currency: defaultCurrency, ...options }),
      formatCompact: (value: number, options?: CurrencyFormatOptions) =>
        formatCurrency(value, {
          locale,
          currency: defaultCurrency,
          notation: 'compact',
          ...options,
        }),
    }),
    [locale, defaultCurrency]
  );
}

// ============================================================================
// LOCALE SETTINGS HOOK
// ============================================================================

export interface LocaleSettings {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
}

/**
 * Get comprehensive locale settings
 */
export function useLocaleSettings(
  userCurrency?: string,
  userTimezone?: string
): LocaleSettings {
  const locale = useCurrentLocale();
  const direction = useTextDirection();
  const rtl = useIsRTL();
  const timezone = userTimezone || getUserTimezone();

  return useMemo(
    () => ({
      locale,
      direction,
      isRTL: rtl,
      timezone,
      currency: userCurrency || 'USD',
      dateFormat: locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy',
    }),
    [locale, direction, rtl, timezone, userCurrency]
  );
}

// ============================================================================
// PLURALIZATION HOOK
// ============================================================================

/**
 * Hook for pluralization
 */
export function usePluralization() {
  const locale = useCurrentLocale();

  return useCallback(
    (count: number, forms: { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string }) => {
      const pluralRules = new Intl.PluralRules(locale);
      const category = pluralRules.select(count);
      return forms[category] || forms.other;
    },
    [locale]
  );
}

// ============================================================================
// LIST FORMATTING HOOK
// ============================================================================

/**
 * Hook for list formatting
 */
export function useListFormatter() {
  const locale = useCurrentLocale();

  return useMemo(
    () => ({
      format: (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') =>
        // @ts-ignore - ListFormat is available in modern browsers
        new Intl.ListFormat(locale, { type }).format(items),
      formatConjunction: (items: string[]) =>
        // @ts-ignore - ListFormat is available in modern browsers
        new Intl.ListFormat(locale, { type: 'conjunction' }).format(items),
      formatDisjunction: (items: string[]) =>
        // @ts-ignore - ListFormat is available in modern browsers
        new Intl.ListFormat(locale, { type: 'disjunction' }).format(items),
    }),
    [locale]
  );
}
