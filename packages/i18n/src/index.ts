// i18n package exports
export { routing } from './routing';
export { Link, redirect, usePathname, useRouter, getPathname } from './routing';

// Components
export { LocaleSwitcher } from './components/LocaleSwitcher';

// RTL Support
export { isRTLLocale, getTextDirection, getLogicalProperties, generateRTLCSS, rtlUtils } from './utils/rtl-utils';

// Re-export next-intl hooks and utilities
export {
  useTranslations,
  useLocale,
  useMessages,
  NextIntlClientProvider,
} from 'next-intl';

// Utility functions
export { getLocaleFromPathname, detectUserLocale, getLocaleDirection, formatNumber, formatCurrency, formatDate } from './utils/locale-utils';

// Type definitions
export type { Locale, LocaleInfo } from './types';
export { LOCALE_INFO } from './types';
