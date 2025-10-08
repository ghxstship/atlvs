# Integration Guide — Internationalization (i18n)
## Using @ghxstship/i18n in Your Application

**Package:** `@ghxstship/i18n`  
**Version:** 1.0.0  
**Framework:** next-intl (industry standard)  
**Status:** ✅ Production Ready

---

## 🎯 Overview

The `@ghxstship/i18n` package provides **complete internationalization** for GHXSTSHIP applications using next-intl, supporting:

- ✅ **8 Locales** — en, es, fr, de, ja, zh, ar, he
- ✅ **RTL Support** — Arabic and Hebrew with utilities
- ✅ **Locale Switching** — LocaleSwitcher component
- ✅ **Format Utilities** — Numbers, dates, currency
- ✅ **Next.js Integration** — App Router compatible

---

## 📦 Installation

Already installed in monorepo. Import from:

```typescript
import { useTranslations, useLocale, LocaleSwitcher } from '@ghxstship/i18n';
```

---

## 🚀 Quick Start

### **1. Server-Side Setup (App Router)**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'ja' },
    { locale: 'zh' },
    { locale: 'ar' },
    { locale: 'he' },
  ];
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@ghxstship/i18n/src/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

### **2. Client Component Usage**

```typescript
'use client';

import { useTranslations, useLocale } from '@ghxstship/i18n';

export function MyComponent() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

---

### **3. Add LocaleSwitcher**

```typescript
'use client';

import { LocaleSwitcher } from '@ghxstship/i18n';

export function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation */}
      </nav>
      <LocaleSwitcher />
    </header>
  );
}
```

---

## 📖 Available Translations

### **Translation Namespaces**

The i18n package provides these namespaces:

| Namespace | Keys | Usage |
|-----------|------|-------|
| `common` | loading, error, save, cancel, etc. | Common UI elements |
| `navigation` | dashboard, projects, people, etc. | App navigation |
| `auth` | signIn, signUp, email, password, etc. | Authentication |
| `errors` | generic, network, unauthorized, etc. | Error messages |
| `projects` | title, createProject, projectName, etc. | Projects module |
| `people` | title, addPerson, firstName, etc. | People module |
| `companies` | title, addCompany, companyName, etc. | Companies module |
| `finance` | budget, expenses, revenue, etc. | Finance module |
| `jobs` | title, createJob, jobTitle, etc. | Jobs module |
| `procurement` | requests, orders, vendors, etc. | Procurement module |
| `programming` | events, callSheets, calendar, etc. | Programming module |
| `analytics` | reports, dashboards, metrics, etc. | Analytics module |
| `settings` | profile, preferences, security, etc. | Settings |
| `validation` | required, email, minLength, etc. | Form validation |

---

## 🛠️ Usage Patterns

### **Pattern 1: Basic Translation**

```typescript
import { useTranslations } from '@ghxstship/i18n';

function SaveButton() {
  const t = useTranslations('common');
  
  return <button>{t('save')}</button>;
}
```

---

### **Pattern 2: Translation with Variables**

```typescript
import { useTranslations } from '@ghxstship/i18n';

function WelcomeMessage({ name }: { name: string }) {
  const t = useTranslations('auth');
  
  // Translation: "Welcome, {name}!"
  return <h1>{t('welcome', { name })}</h1>;
}
```

---

### **Pattern 3: Number Formatting**

```typescript
import { useLocale } from '@ghxstship/i18n';
import { formatNumber } from '@ghxstship/i18n';

function StatCard({ value }: { value: number }) {
  const locale = useLocale();
  
  return (
    <div>
      <span>{formatNumber(value, locale)}</span>
    </div>
  );
}
```

---

### **Pattern 4: Date Formatting**

```typescript
import { useLocale } from '@ghxstship/i18n';
import { formatDate } from '@ghxstship/i18n';

function DateDisplay({ date }: { date: Date }) {
  const locale = useLocale();
  
  return (
    <time>
      {formatDate(date, locale, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </time>
  );
}
```

---

### **Pattern 5: Currency Formatting**

```typescript
import { useLocale } from '@ghxstship/i18n';
import { formatCurrency } from '@ghxstship/i18n';

function PriceTag({ amount, currency }: { amount: number; currency: string }) {
  const locale = useLocale();
  
  return (
    <span>{formatCurrency(amount, currency, locale)}</span>
  );
}
```

---

## 🌍 RTL (Right-to-Left) Support

### **Automatic Direction Detection**

```typescript
import { isRTLLocale, getTextDirection } from '@ghxstship/i18n';

function MyComponent() {
  const locale = useLocale();
  const isRTL = isRTLLocale(locale);
  const direction = getTextDirection(locale); // 'ltr' or 'rtl'
  
  return (
    <div dir={direction}>
      {/* Content automatically flows in correct direction */}
    </div>
  );
}
```

---

### **Logical CSS Properties**

```typescript
import { getLogicalProperties } from '@ghxstship/i18n';

function Card() {
  const locale = useLocale();
  const logical = getLogicalProperties(locale);
  
  // Returns { marginInlineStart, marginInlineEnd, paddingInlineStart, etc. }
  // Automatically adapts for RTL
  
  return (
    <div style={{
      [logical.marginInlineStart]: '1rem',
      [logical.paddingInlineStart]: '2rem',
    }}>
      Content
    </div>
  );
}
```

---

### **RTL CSS Generation**

```typescript
import { generateRTLCSS } from '@ghxstship/i18n';

// Generate RTL-compatible CSS
const rtlStyles = generateRTLCSS(`
  .button {
    margin-left: 1rem;
    padding-right: 0.5rem;
    text-align: left;
  }
`);

// Converts to:
// .button {
//   margin-inline-start: 1rem;
//   padding-inline-end: 0.5rem;
//   text-align: start;
// }
```

---

## 🔄 Locale Switching

### **Using LocaleSwitcher Component**

```typescript
import { LocaleSwitcher } from '@ghxstship/i18n';

export function AppHeader() {
  return (
    <header>
      <nav>{/* Navigation */}</nav>
      
      {/* Built-in locale switcher with flags */}
      <LocaleSwitcher />
    </header>
  );
}
```

---

### **Custom Locale Switcher**

```typescript
import { useRouter, usePathname } from '@ghxstship/i18n';
import { useLocale } from '@ghxstship/i18n';

export function CustomLocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };
  
  return (
    <select value={locale} onChange={(e) => switchLocale(e.target.value)}>
      <option value="en">🇬🇧 English</option>
      <option value="es">🇪🇸 Español</option>
      <option value="fr">🇫🇷 Français</option>
      <option value="de">🇩🇪 Deutsch</option>
      <option value="ja">🇯🇵 日本語</option>
      <option value="zh">🇨🇳 中文</option>
      <option value="ar">🇸🇦 العربية</option>
      <option value="he">🇮🇱 עברית</option>
    </select>
  );
}
```

---

## 📁 Adding Custom Translations

### **1. Extend Existing Locale Files**

```json
// packages/i18n/src/messages/en.json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    // Add your custom keys
    "myCustomKey": "My Custom Value"
  },
  
  // Add your custom namespace
  "myModule": {
    "title": "My Module",
    "description": "Module description"
  }
}
```

### **2. Update All Locales**

Repeat for all 8 locale files:
- `en.json` (English)
- `es.json` (Spanish)
- `fr.json` (French)
- `de.json` (German)
- `ja.json` (Japanese)
- `zh.json` (Chinese)
- `ar.json` (Arabic)
- `he.json` (Hebrew)

### **3. Use in Components**

```typescript
import { useTranslations } from '@ghxstship/i18n';

function MyModule() {
  const t = useTranslations('myModule');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

## 🎨 Integrating with UI Components

### **Example: Translating Form Labels**

```typescript
import { Input } from '@ghxstship/ui';
import { useTranslations } from '@ghxstship/i18n';

function LoginForm() {
  const t = useTranslations('auth');
  
  return (
    <form>
      <Input
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        required
      />
      <Input
        type="password"
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        required
      />
      <button>{t('signIn')}</button>
    </form>
  );
}
```

---

### **Example: Translating Table Headers**

```typescript
import { Table } from '@ghxstship/ui';
import { useTranslations } from '@ghxstship/i18n';

function ProjectsTable() {
  const t = useTranslations('projects');
  
  const columns = [
    { header: t('projectName'), accessor: 'name' },
    { header: t('status'), accessor: 'status' },
    { header: t('dueDate'), accessor: 'dueDate' },
  ];
  
  return <Table columns={columns} data={projects} />;
}
```

---

## 🧪 Testing with i18n

### **Testing Components with Translations**

```typescript
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { MyComponent } from './MyComponent';

// Import English messages for testing
import messages from '@ghxstship/i18n/src/messages/en.json';

test('renders with translations', () => {
  const { getByText } = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MyComponent />
    </NextIntlClientProvider>
  );
  
  expect(getByText('Expected Translation')).toBeInTheDocument();
});
```

---

## ⚡ Performance Optimization

### **Lazy Load Locale Messages**

```typescript
// Only load messages when needed
export default async function LocaleLayout({ params: { locale } }) {
  const messages = await import(`@ghxstship/i18n/src/messages/${locale}.json`);
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages.default}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### **Split by Namespace (Large Apps)**

```typescript
// Load only needed namespace
const commonMessages = await import(`@ghxstship/i18n/src/messages/${locale}.json`);
const authMessages = commonMessages.auth;

<NextIntlClientProvider locale={locale} messages={{ auth: authMessages }}>
  <AuthFlow />
</NextIntlClientProvider>
```

---

## 🐛 Troubleshooting

### **Issue: Translation not found**

```typescript
// ❌ Wrong namespace
const t = useTranslations('common');
return <span>{t('projectName')}</span>; // projectName is in 'projects' namespace

// ✅ Correct namespace
const t = useTranslations('projects');
return <span>{t('projectName')}</span>;
```

### **Issue: Variable not replaced**

```typescript
// ❌ Wrong syntax
t('welcome', name); // Missing object wrapper

// ✅ Correct syntax
t('welcome', { name }); // Wrapped in object
```

### **Issue: RTL not working**

```typescript
// ✅ Make sure dir attribute is set
<html lang={locale} dir={isRTLLocale(locale) ? 'rtl' : 'ltr'}>
```

---

## 📚 API Reference

### **Hooks**

| Hook | Returns | Usage |
|------|---------|-------|
| `useTranslations(namespace)` | `(key, vars?) => string` | Get translation function |
| `useLocale()` | `string` | Get current locale |
| `useMessages()` | `object` | Get all messages |

### **Utilities**

| Function | Parameters | Returns |
|----------|------------|---------|
| `isRTLLocale(locale)` | `string` | `boolean` |
| `getTextDirection(locale)` | `string` | `'ltr' \| 'rtl'` |
| `formatNumber(num, locale)` | `number, string` | `string` |
| `formatDate(date, locale, options)` | `Date, string, object` | `string` |
| `formatCurrency(amount, currency, locale)` | `number, string, string` | `string` |

### **Components**

| Component | Props | Description |
|-----------|-------|-------------|
| `LocaleSwitcher` | - | Built-in locale switcher |
| `NextIntlClientProvider` | `locale, messages, children` | Provides i18n context |

---

## ✅ Best Practices

1. ✅ **Always use translation keys** — Never hardcode text
2. ✅ **Keep translations organized** — Use appropriate namespaces
3. ✅ **Test with multiple locales** — Especially RTL languages
4. ✅ **Use logical CSS properties** — For RTL compatibility
5. ✅ **Provide context in keys** — e.g., `projects.createButton` not `create`
6. ✅ **Keep translations consistent** — Same key should mean same thing everywhere
7. ✅ **Update all locales** — Don't leave translations incomplete

---

## 🔗 Additional Resources

- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **Locale Files:** `packages/i18n/src/messages/`
- **RTL Utilities:** `packages/i18n/src/utils/rtl-utils.ts`
- **Locale Utilities:** `packages/i18n/src/utils/locale-utils.ts`

---

**Package Status:** ✅ Production Ready  
**Support:** 8 locales with full RTL support  
**Integration:** Next.js App Router compatible
