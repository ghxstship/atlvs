export function formatCurrency(value: number, currency = 'USD', locale?: string) {
  return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency }).format(value);
}

export function formatDate(value: string | Date, locale?: string) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium' }).format(d);
}
