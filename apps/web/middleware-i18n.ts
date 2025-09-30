/**
 * i18n Middleware for Locale Detection and Routing
 * Handles automatic locale detection and routing
 */

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

/**
 * next-intl middleware configuration
 * Handles locale detection, routing, and cookie management
 */
export const i18nMiddleware = createMiddleware({
  // All supported locales
  locales,

  // Default locale when none is detected
  defaultLocale,

  // Locale detection strategy
  localeDetection: true,

  // Locale prefix strategy
  localePrefix: 'as-needed', // Only add prefix for non-default locales

  // Alternate links for SEO
  alternateLinks: true,

  // Cookie name for locale preference
  localeCookie: {
    name: 'NEXT_LOCALE',
    // 1 year expiration
    maxAge: 31536000,
    // Secure in production
    secure: process.env.NODE_ENV === 'production',
    // Accessible from all paths
    path: '/',
    // Strict same-site policy
    sameSite: 'strict',
  },
});

/**
 * Detect locale from request
 * Priority: URL > Cookie > Accept-Language header > Default
 */
export function detectLocale(request: Request): string {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check URL for locale
  const urlLocale = locales.find((locale) => pathname.startsWith(`/${locale}`));
  if (urlLocale) return urlLocale;

  // Check cookie
  const cookieLocale = getCookie(request, 'NEXT_LOCALE');
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = parseAcceptLanguage(acceptLanguage);
    if (preferredLocale && locales.includes(preferredLocale as any)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(header: string): string | null {
  const languages = header
    .split(',')
    .map((lang) => {
      const [locale, q = '1'] = lang.trim().split(';q=');
      return {
        locale: locale.split('-')[0], // Get base language code
        quality: parseFloat(q),
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (locales.includes(locale as any)) {
      return locale;
    }
  }

  return null;
}

/**
 * Get cookie value from request
 */
function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;

  const cookie = cookies
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));

  return cookie ? cookie.split('=')[1] : null;
}

/**
 * Check if path should be localized
 */
export function shouldLocalizePathname(pathname: string): boolean {
  // Don't localize API routes
  if (pathname.startsWith('/api')) return false;

  // Don't localize Next.js internals
  if (pathname.startsWith('/_next')) return false;

  // Don't localize static files
  if (/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|json)$/.test(pathname)) {
    return false;
  }

  // Don't localize auth routes (they handle their own locale)
  if (pathname.startsWith('/auth')) return false;

  return true;
}

/**
 * Get pathname without locale prefix
 */
export function getPathnameWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}
