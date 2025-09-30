/**
 * i18n Configuration
 * Central i18n configuration for GHXSTSHIP platform
 */

export const locales = ['en', 'es', 'fr', 'de', 'pt', 'ar', 'he', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// RTL languages
export const rtlLocales: Locale[] = ['ar', 'he'];

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  he: 'עברית',
  ja: '日本語',
  zh: '中文',
};

// Currency by locale (default)
export const localeCurrencies: Record<Locale, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  de: 'EUR',
  pt: 'BRL',
  ar: 'SAR',
  he: 'ILS',
  ja: 'JPY',
  zh: 'CNY',
};

// Timezone by locale (default)
export const localeTimezones: Record<Locale, string> = {
  en: 'America/New_York',
  es: 'Europe/Madrid',
  fr: 'Europe/Paris',
  de: 'Europe/Berlin',
  pt: 'America/Sao_Paulo',
  ar: 'Asia/Riyadh',
  he: 'Asia/Jerusalem',
  ja: 'Asia/Tokyo',
  zh: 'Asia/Shanghai',
};

// Date format patterns by locale
export const localeDateFormats: Record<Locale, string> = {
  en: 'MM/dd/yyyy',
  es: 'dd/MM/yyyy',
  fr: 'dd/MM/yyyy',
  de: 'dd.MM.yyyy',
  pt: 'dd/MM/yyyy',
  ar: 'dd/MM/yyyy',
  he: 'dd/MM/yyyy',
  ja: 'yyyy/MM/dd',
  zh: 'yyyy/MM/dd',
};

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
