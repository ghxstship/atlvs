/**
 * i18n Testing Utilities
 * Helpers for testing internationalization features
 */

import type { Locale } from './config';
import { locales, isRTL, getDirection } from './config';

/**
 * Test all locales for a translation key
 */
export function testTranslationKey(
  key: string,
  translations: Record<Locale, Record<string, any>>
): {
  locale: Locale;
  exists: boolean;
  value?: string;
}[] {
  return locales.map((locale) => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    return {
      locale,
      exists: value !== undefined,
      value: typeof value === 'string' ? value : undefined,
    };
  });
}

/**
 * Validate RTL configuration
 */
export function validateRTLConfiguration(): {
  locale: Locale;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  correct: boolean;
}[] {
  return locales.map((locale) => {
    const rtl = isRTL(locale);
    const direction = getDirection(locale);
    const correct = (rtl && direction === 'rtl') || (!rtl && direction === 'ltr');

    return {
      locale,
      isRTL: rtl,
      direction,
      correct,
    };
  });
}

/**
 * Test date formatting across locales
 */
export function testDateFormatting(date: Date = new Date()): {
  locale: Locale;
  formatted: string;
  error?: string;
}[] {
  return locales.map((locale) => {
    try {
      const formatted = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);

      return { locale, formatted };
    } catch (error) {
      return {
        locale,
        formatted: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * Test number formatting across locales
 */
export function testNumberFormatting(number: number = 1234567.89): {
  locale: Locale;
  formatted: string;
  error?: string;
}[] {
  return locales.map((locale) => {
    try {
      const formatted = new Intl.NumberFormat(locale).format(number);
      return { locale, formatted };
    } catch (error) {
      return {
        locale,
        formatted: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * Test currency formatting across locales
 */
export function testCurrencyFormatting(
  amount: number = 1234.56,
  currency: string = 'USD'
): {
  locale: Locale;
  formatted: string;
  error?: string;
}[] {
  return locales.map((locale) => {
    try {
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);

      return { locale, formatted };
    } catch (error) {
      return {
        locale,
        formatted: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * Generate i18n test report
 */
export function generateI18nTestReport(): {
  rtl: ReturnType<typeof validateRTLConfiguration>;
  dateFormatting: ReturnType<typeof testDateFormatting>;
  numberFormatting: ReturnType<typeof testNumberFormatting>;
  currencyFormatting: ReturnType<typeof testCurrencyFormatting>;
} {
  return {
    rtl: validateRTLConfiguration(),
    dateFormatting: testDateFormatting(),
    numberFormatting: testNumberFormatting(),
    currencyFormatting: testCurrencyFormatting(),
  };
}

/**
 * Log i18n test report to console
 */
export function logI18nTestReport(): void {
  const report = generateI18nTestReport();

  console.group('[i18n Test Report]');

  console.group('RTL Configuration');
  report.rtl.forEach(({ locale, isRTL, direction, correct }) => {
    const status = correct ? '✅' : '❌';
    console.log(`${status} ${locale}: isRTL=${isRTL}, direction=${direction}`);
  });
  console.groupEnd();

  console.group('Date Formatting');
  report.dateFormatting.forEach(({ locale, formatted, error }) => {
    if (error) {
      console.error(`❌ ${locale}: ${error}`);
    } else {
      console.log(`✅ ${locale}: ${formatted}`);
    }
  });
  console.groupEnd();

  console.group('Number Formatting');
  report.numberFormatting.forEach(({ locale, formatted, error }) => {
    if (error) {
      console.error(`❌ ${locale}: ${error}`);
    } else {
      console.log(`✅ ${locale}: ${formatted}`);
    }
  });
  console.groupEnd();

  console.group('Currency Formatting');
  report.currencyFormatting.forEach(({ locale, formatted, error }) => {
    if (error) {
      console.error(`❌ ${locale}: ${error}`);
    } else {
      console.log(`✅ ${locale}: ${formatted}`);
    }
  });
  console.groupEnd();

  console.groupEnd();
}
