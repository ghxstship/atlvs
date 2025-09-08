export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Do not prefix routes with the locale in the URL
export const localePrefix = 'as-needed' as const;
