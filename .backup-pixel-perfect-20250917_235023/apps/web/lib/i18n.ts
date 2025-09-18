import type { NextRequest } from 'next/server';

export type I18nPrefs = {
  locale: string;
  currency: string;
  timeZone: string;
};

export function getI18nPrefs(req?: NextRequest): I18nPrefs {
  const locale = (req?.headers.get('x-locale') || 'en-US').trim();
  const currency = (req?.headers.get('x-currency') || 'USD').trim().toUpperCase();
  const timeZone = (req?.headers.get('x-timezone') || 'UTC').trim();
  return { locale, currency, timeZone };
}

export function formatCurrency(value: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatNumber(value: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

export function formatDateTime(date: string | number | Date, timeZone = 'UTC', locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}
