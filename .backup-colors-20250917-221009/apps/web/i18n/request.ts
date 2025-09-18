import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '../i18n';

export default getRequestConfig(async ({ locale: incoming }) => {
  const locale: Locale = (!incoming || !locales.includes(incoming as Locale))
    ? defaultLocale
    : (incoming as Locale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
