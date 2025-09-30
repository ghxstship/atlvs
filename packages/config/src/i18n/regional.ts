/**
 * Regional & Cultural Adaptation Utilities
 * Address formats, phone numbers, and regional validation
 */

import type { Locale } from './config';

// ============================================================================
// ADDRESS FORMATTING
// ============================================================================

export interface AddressFormat {
  lines: string[];
  postalCodePosition: 'before' | 'after';
  cityStateFormat: string;
}

export interface Address {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Address format patterns by country
 */
const addressFormats: Record<string, AddressFormat> = {
  US: {
    lines: ['street1', 'street2', 'city, state postalCode'],
    postalCodePosition: 'after',
    cityStateFormat: '{city}, {state} {postalCode}',
  },
  GB: {
    lines: ['street1', 'street2', 'city', 'postalCode'],
    postalCodePosition: 'after',
    cityStateFormat: '{city}\n{postalCode}',
  },
  DE: {
    lines: ['street1', 'street2', 'postalCode city'],
    postalCodePosition: 'before',
    cityStateFormat: '{postalCode} {city}',
  },
  FR: {
    lines: ['street1', 'street2', 'postalCode city'],
    postalCodePosition: 'before',
    cityStateFormat: '{postalCode} {city}',
  },
  JP: {
    lines: ['postalCode', 'state city', 'street1', 'street2'],
    postalCodePosition: 'before',
    cityStateFormat: '〒{postalCode}\n{state}{city}',
  },
  CN: {
    lines: ['state city', 'street1', 'street2', 'postalCode'],
    postalCodePosition: 'after',
    cityStateFormat: '{state}{city}',
  },
};

/**
 * Format address according to country conventions
 */
export function formatAddress(address: Address, countryCode: string = 'US'): string {
  const format = addressFormats[countryCode] || addressFormats.US;
  const parts: string[] = [];

  if (address.street1) parts.push(address.street1);
  if (address.street2) parts.push(address.street2);

  // Format city/state/postal based on country
  const cityLine = format.cityStateFormat
    .replace('{city}', address.city || '')
    .replace('{state}', address.state || '')
    .replace('{postalCode}', address.postalCode || '')
    .trim();

  if (cityLine) parts.push(cityLine);
  if (address.country) parts.push(address.country);

  return parts.filter(Boolean).join('\n');
}

/**
 * Validate postal code format by country
 */
export function validatePostalCode(postalCode: string, countryCode: string): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    JP: /^\d{3}-?\d{4}$/,
    CN: /^\d{6}$/,
    BR: /^\d{5}-?\d{3}$/,
  };

  const pattern = patterns[countryCode];
  return pattern ? pattern.test(postalCode) : true;
}

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

export interface PhoneNumber {
  countryCode: string;
  nationalNumber: string;
  extension?: string;
}

/**
 * Phone number format patterns by country
 */
const phoneFormats: Record<string, { pattern: RegExp; format: string }> = {
  US: {
    pattern: /^(\d{3})(\d{3})(\d{4})$/,
    format: '($1) $2-$3',
  },
  GB: {
    pattern: /^(\d{4})(\d{6})$/,
    format: '$1 $2',
  },
  DE: {
    pattern: /^(\d{3})(\d{4})(\d{4})$/,
    format: '$1 $2 $3',
  },
  FR: {
    pattern: /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    format: '$1 $2 $3 $4 $5',
  },
  JP: {
    pattern: /^(\d{3})(\d{4})(\d{4})$/,
    format: '$1-$2-$3',
  },
  CN: {
    pattern: /^(\d{3})(\d{4})(\d{4})$/,
    format: '$1 $2 $3',
  },
  BR: {
    pattern: /^(\d{2})(\d{5})(\d{4})$/,
    format: '($1) $2-$3',
  },
};

/**
 * Format phone number according to country conventions
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string = 'US'
): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  const format = phoneFormats[countryCode];
  if (!format) return phoneNumber;

  const match = digits.match(format.pattern);
  if (!match) return phoneNumber;

  return digits.replace(format.pattern, format.format);
}

/**
 * Validate phone number format by country
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): boolean {
  const digits = phoneNumber.replace(/\D/g, '');
  const format = phoneFormats[countryCode];

  return format ? format.pattern.test(digits) : true;
}

/**
 * Get international phone number format
 */
export function formatInternationalPhone(phone: PhoneNumber): string {
  const { countryCode, nationalNumber, extension } = phone;
  let formatted = `+${countryCode} ${formatPhoneNumber(nationalNumber, countryCode)}`;

  if (extension) {
    formatted += ` ext. ${extension}`;
  }

  return formatted;
}

// ============================================================================
// COUNTRY & REGION DATA
// ============================================================================

export interface CountryInfo {
  code: string;
  name: string;
  phoneCode: string;
  currency: string;
  locale: Locale;
  timezone: string;
}

/**
 * Country information database
 */
export const countries: Record<string, CountryInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    phoneCode: '1',
    currency: 'USD',
    locale: 'en',
    timezone: 'America/New_York',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    phoneCode: '44',
    currency: 'GBP',
    locale: 'en',
    timezone: 'Europe/London',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    phoneCode: '49',
    currency: 'EUR',
    locale: 'de',
    timezone: 'Europe/Berlin',
  },
  FR: {
    code: 'FR',
    name: 'France',
    phoneCode: '33',
    currency: 'EUR',
    locale: 'fr',
    timezone: 'Europe/Paris',
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    phoneCode: '34',
    currency: 'EUR',
    locale: 'es',
    timezone: 'Europe/Madrid',
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    phoneCode: '81',
    currency: 'JPY',
    locale: 'ja',
    timezone: 'Asia/Tokyo',
  },
  CN: {
    code: 'CN',
    name: 'China',
    phoneCode: '86',
    currency: 'CNY',
    locale: 'zh',
    timezone: 'Asia/Shanghai',
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    phoneCode: '55',
    currency: 'BRL',
    locale: 'pt',
    timezone: 'America/Sao_Paulo',
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    phoneCode: '966',
    currency: 'SAR',
    locale: 'ar',
    timezone: 'Asia/Riyadh',
  },
  IL: {
    code: 'IL',
    name: 'Israel',
    phoneCode: '972',
    currency: 'ILS',
    locale: 'he',
    timezone: 'Asia/Jerusalem',
  },
};

/**
 * Get country info by code
 */
export function getCountryInfo(countryCode: string): CountryInfo | undefined {
  return countries[countryCode];
}

/**
 * Get all countries as array
 */
export function getAllCountries(): CountryInfo[] {
  return Object.values(countries);
}

/**
 * Get countries by locale
 */
export function getCountriesByLocale(locale: Locale): CountryInfo[] {
  return Object.values(countries).filter((country) => country.locale === locale);
}

// ============================================================================
// CALENDAR SYSTEMS
// ============================================================================

export type CalendarSystem = 'gregory' | 'islamic' | 'hebrew' | 'persian' | 'japanese' | 'chinese';

/**
 * Calendar system by locale
 */
const calendarSystems: Record<Locale, CalendarSystem> = {
  en: 'gregory',
  es: 'gregory',
  fr: 'gregory',
  de: 'gregory',
  pt: 'gregory',
  ar: 'islamic',
  he: 'hebrew',
  ja: 'japanese',
  zh: 'chinese',
};

/**
 * Get calendar system for locale
 */
export function getCalendarSystem(locale: Locale): CalendarSystem {
  return calendarSystems[locale] || 'gregory';
}

/**
 * Format date with calendar system
 */
export function formatDateWithCalendar(
  date: Date,
  locale: Locale,
  calendar?: CalendarSystem
): string {
  const calendarSystem = calendar || getCalendarSystem(locale);

  return new Intl.DateTimeFormat(locale, {
    calendar: calendarSystem,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// ============================================================================
// MEASUREMENT SYSTEMS
// ============================================================================

export type MeasurementSystem = 'metric' | 'imperial';

/**
 * Measurement system by country
 */
const measurementSystems: Record<string, MeasurementSystem> = {
  US: 'imperial',
  GB: 'imperial',
  // Most other countries use metric
};

/**
 * Get measurement system for country
 */
export function getMeasurementSystem(countryCode: string): MeasurementSystem {
  return measurementSystems[countryCode] || 'metric';
}

/**
 * Convert between measurement systems
 */
export function convertMeasurement(
  value: number,
  from: 'km' | 'mi' | 'kg' | 'lb',
  to: 'km' | 'mi' | 'kg' | 'lb'
): number {
  const conversions: Record<string, number> = {
    'km-mi': 0.621371,
    'mi-km': 1.60934,
    'kg-lb': 2.20462,
    'lb-kg': 0.453592,
  };

  const key = `${from}-${to}`;
  const factor = conversions[key];

  return factor ? value * factor : value;
}
