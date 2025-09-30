# GHXSTSHIP Internationalization (i18n) System

## Overview

GHXSTSHIP implements a comprehensive internationalization system using `next-intl` with support for 9 languages, RTL layouts, regional formatting, and cultural adaptation.

## Supported Locales

- **English (en)** - Default locale
- **Spanish (es)**
- **French (fr)**
- **German (de)**
- **Portuguese (pt)**
- **Arabic (ar)** - RTL
- **Hebrew (he)** - RTL
- **Japanese (ja)**
- **Chinese (zh)**

## Architecture

### Core Components

1. **Configuration** (`packages/config/src/i18n/config.ts`)
   - Locale definitions and metadata
   - RTL language detection
   - Default currency and timezone mappings

2. **Formatting Utilities** (`packages/config/src/i18n/formatters.ts`)
   - Date/time formatting with timezone support
   - Number and currency formatting
   - Relative time formatting
   - List formatting
   - Display names (languages, regions, currencies)

3. **Regional Utilities** (`packages/config/src/i18n/regional.ts`)
   - Address formatting by country
   - Phone number formatting and validation
   - Postal code validation
   - Country information database
   - Calendar systems
   - Measurement systems

4. **Direction Provider** (`packages/config/src/i18n/DirectionProvider.tsx`)
   - RTL/LTR layout management
   - Directional icon mapping
   - Logical CSS properties
   - Text alignment utilities

5. **Middleware** (`apps/web/middleware-i18n.ts`)
   - Automatic locale detection
   - Cookie-based locale persistence
   - Accept-Language header parsing
   - URL-based locale routing

6. **Translation Messages** (`apps/web/messages/`)
   - JSON-based translation files per locale
   - Hierarchical namespace structure
   - Context comments for translators

## Usage

### Basic Translation

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Date Formatting

```tsx
import { formatDate, formatRelativeTime } from '@ghxstship/config/i18n/formatters';

// Format date
const formatted = formatDate(new Date(), {
  locale: 'fr',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Relative time
const relative = formatRelativeTime(date, 'en');
// Output: "2 hours ago"
```

### Currency Formatting

```tsx
import { formatCurrency } from '@ghxstship/config/i18n/formatters';

const price = formatCurrency(1234.56, {
  locale: 'de',
  currency: 'EUR'
});
// Output: "1.234,56 €"
```

### RTL Support

```tsx
import { DirectionProvider } from '@ghxstship/config/i18n/DirectionProvider';

export function Layout({ locale, children }) {
  return (
    <DirectionProvider locale={locale}>
      {children}
    </DirectionProvider>
  );
}
```

### Address Formatting

```tsx
import { formatAddress } from '@ghxstship/config/i18n/regional';

const address = {
  street1: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA'
};

const formatted = formatAddress(address, 'US');
```

## Translation Namespaces

Translations are organized into logical namespaces:

- `common` - Shared UI elements (buttons, labels, etc.)
- `nav` - Navigation menu items
- `auth` - Authentication flows
- `dashboard` - Dashboard module
- `projects` - Projects module
- `people` - People module
- `finance` - Finance module
- `programming` - Programming module
- `procurement` - Procurement module
- `jobs` - Jobs module
- `companies` - Companies module
- `analytics` - Analytics module
- `resources` - Resources module
- `settings` - Settings module
- `profile` - Profile module

## Adding New Translations

### 1. Add to Default Locale (en.json)

```json
{
  "myModule": {
    "title": "My Module",
    "description": "Module description",
    "actions": {
      "create": "Create New",
      "edit": "Edit",
      "delete": "Delete"
    }
  }
}
```

### 2. Translate to Other Locales

Add the same structure to all other locale files (es.json, fr.json, etc.)

### 3. Validate Translations

```bash
pnpm run i18n:validate
```

This will check for:
- Missing translation keys
- Empty values
- Extra keys not in default locale
- Translation completeness percentage

## RTL (Right-to-Left) Support

### Automatic Layout Mirroring

The `DirectionProvider` automatically:
- Sets `dir` attribute on `<html>`
- Adds `.rtl` class for CSS targeting
- Mirrors directional icons
- Adjusts text alignment

### CSS for RTL

```css
/* Automatic mirroring with logical properties */
.container {
  margin-inline-start: 1rem; /* Becomes margin-right in RTL */
  padding-inline-end: 2rem;  /* Becomes padding-left in RTL */
}

/* RTL-specific styles */
.rtl .custom-element {
  transform: scaleX(-1);
}
```

### Directional Icons

```tsx
import { useDirectionalIcon } from '@ghxstship/config/i18n/DirectionProvider';

export function BackButton() {
  const iconName = useDirectionalIcon('arrow-left');
  // Returns 'arrow-right' in RTL locales
  
  return <Icon name={iconName} />;
}
```

## Regional Compliance

### Phone Numbers

```tsx
import { formatPhoneNumber, validatePhoneNumber } from '@ghxstship/config/i18n/regional';

// Format
const formatted = formatPhoneNumber('5551234567', 'US');
// Output: "(555) 123-4567"

// Validate
const isValid = validatePhoneNumber('5551234567', 'US');
```

### Postal Codes

```tsx
import { validatePostalCode } from '@ghxstship/config/i18n/regional';

const isValid = validatePostalCode('10001', 'US'); // true
const isValid2 = validatePostalCode('ABC123', 'US'); // false
```

### Calendar Systems

```tsx
import { formatDateWithCalendar } from '@ghxstship/config/i18n/regional';

// Islamic calendar for Arabic
const formatted = formatDateWithCalendar(new Date(), 'ar', 'islamic');

// Hebrew calendar for Hebrew
const formatted2 = formatDateWithCalendar(new Date(), 'he', 'hebrew');
```

## Performance Optimization

### Memoized Formatters

All formatters use internal caching for performance:

```tsx
import { getCachedFormatter } from '@ghxstship/config/i18n/formatters';

const formatter = getCachedFormatter(
  'date-en-US',
  () => new Intl.DateTimeFormat('en-US')
);
```

### Lazy Loading

Translations are loaded on-demand per route:

```tsx
// Only loads translations for current locale
const messages = await import(`../messages/${locale}.json`);
```

## Testing

### Translation Validation

```bash
# Validate all translations
pnpm run i18n:validate

# Validate in CI (fails on incomplete translations)
pnpm run i18n:validate:ci
```

### Manual Testing

1. Change locale in browser settings
2. Use locale switcher in UI
3. Test RTL layouts with Arabic/Hebrew
4. Verify date/number/currency formatting
5. Test address and phone number validation

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Validate Translations
  run: pnpm run i18n:validate:ci
```

This ensures all locales maintain 100% translation completeness.

## Best Practices

### 1. Use Semantic Keys

```json
{
  "dashboard": {
    "stats": {
      "totalProjects": "Total Projects",
      "activeUsers": "Active Users"
    }
  }
}
```

### 2. Provide Context

```json
{
  "common": {
    "save": "Save",
    "_save_context": "Button label for saving changes"
  }
}
```

### 3. Handle Pluralization

```tsx
const t = useTranslations('common');

// Use ICU message format
t('items', { count: 5 });
// Translation: "{count, plural, =0 {No items} =1 {One item} other {# items}}"
```

### 4. Avoid Hardcoded Strings

```tsx
// ❌ Bad
<button>Save</button>

// ✅ Good
<button>{t('common.save')}</button>
```

### 5. Test All Locales

- Test with longest translations (often German)
- Test RTL layouts thoroughly
- Verify date/number formats for each locale
- Test edge cases (empty strings, special characters)

## Troubleshooting

### Missing Translations

If you see translation keys instead of text:
1. Check if key exists in locale file
2. Verify namespace is correct
3. Run `pnpm run i18n:validate` to find missing keys

### RTL Layout Issues

If RTL layout looks broken:
1. Verify `DirectionProvider` is wrapping your app
2. Use logical CSS properties (`margin-inline-start` instead of `margin-left`)
3. Check for hardcoded directional values

### Date Formatting Issues

If dates look wrong:
1. Verify timezone is set correctly
2. Check locale format preferences
3. Use `formatDate` with explicit options

## Migration Guide

### From Hardcoded Strings

1. Extract all hardcoded strings
2. Create translation keys in `en.json`
3. Replace strings with `t()` calls
4. Translate to other locales
5. Validate with `pnpm run i18n:validate`

### Adding New Locale

1. Add locale to `locales` array in `config.ts`
2. Create `{locale}.json` in `messages/`
3. Translate all keys from `en.json`
4. Add locale metadata (currency, timezone, etc.)
5. Test thoroughly

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Intl API Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [CLDR Data](http://cldr.unicode.org/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

## Support

For questions or issues:
1. Check this documentation
2. Run validation script
3. Review example implementations
4. Contact the development team
