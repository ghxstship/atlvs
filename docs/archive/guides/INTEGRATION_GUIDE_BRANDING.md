# Integration Guide — Branding & Whitelabeling
## Using @ghxstship/shared/platform/brand in Your Application

**Package:** `@ghxstship/shared`  
**Module:** `platform/brand`  
**Version:** Production Ready  
**Status:** ✅ Complete Whitelabeling System

---

## 🎯 Overview

The branding system provides **complete white-label capabilities** for GHXSTSHIP applications, supporting:

- ✅ **Multi-Brand Support** — Unlimited brand configurations
- ✅ **Dynamic Theme Generation** — CSS variables from brand config
- ✅ **Runtime Brand Switching** — No rebuild required
- ✅ **Asset Management** — Logos, favicons, fonts per brand
- ✅ **Server & Client** — SSR-compatible brand loading

---

## 📦 Installation

Already installed in monorepo. Import from:

```typescript
import {
  BrandProvider,
  useBrand,
  useBrandColors,
  BrandSwitcher,
  BrandLogo
} from '@ghxstship/shared/platform/brand';
```

---

## 🚀 Quick Start

### **1. Setup Brand Provider (Root Layout)**

```typescript
// app/layout.tsx
import { BrandProvider } from '@ghxstship/shared/platform/brand';
import { getBrandConfig } from '@ghxstship/shared/platform/brand/server';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Load brand configuration server-side
  const brandConfig = await getBrandConfig();
  
  return (
    <html lang="en">
      <head>
        {/* Brand-specific favicon */}
        <link rel="icon" href={brandConfig.assets.favicon} />
        
        {/* Inject brand CSS variables */}
        <style dangerouslySetInnerHTML={{ __html: generateBrandCSS(brandConfig) }} />
      </head>
      <body>
        <BrandProvider initialBrand={brandConfig}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

---

### **2. Use Brand in Components**

```typescript
'use client';

import { useBrand, BrandLogo } from '@ghxstship/shared/platform/brand';

export function Header() {
  const { brand } = useBrand();
  
  return (
    <header style={{ backgroundColor: brand.colors.primary }}>
      <BrandLogo variant="full" />
      <h1>{brand.name}</h1>
    </header>
  );
}
```

---

### **3. Access Brand Colors**

```typescript
'use client';

import { useBrandColors } from '@ghxstship/shared/platform/brand';

export function ThemedButton() {
  const colors = useBrandColors();
  
  return (
    <button style={{
      backgroundColor: colors.primary,
      color: colors.onPrimary,
      borderColor: colors.border
    }}>
      Click Me
    </button>
  );
}
```

---

## 🎨 Brand Configuration Structure

### **Brand Configuration Type**

```typescript
interface BrandConfiguration {
  id: string;                    // Unique brand ID
  name: string;                  // Brand display name
  slug: string;                  // URL-friendly identifier
  
  colors: {
    // Primary colors
    primary: string;             // Main brand color
    secondary: string;           // Secondary color
    accent: string;              // Accent color
    
    // UI colors
    background: string;          // Background
    foreground: string;          // Text color
    muted: string;               // Muted elements
    border: string;              // Borders
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Text on colored backgrounds
    onPrimary: string;
    onSecondary: string;
    onAccent: string;
  };
  
  assets: {
    logo: string;                // Full logo URL
    logomark: string;            // Icon-only logo
    favicon: string;             // Favicon URL
    ogImage: string;             // Social sharing image
  };
  
  typography: {
    fontFamily: string;          // Primary font
    headingFont?: string;        // Heading font (optional)
    fontUrl?: string;            // Google Fonts URL
  };
  
  metadata: {
    title: string;               // Default page title
    description: string;         // Meta description
    keywords: string[];          // SEO keywords
  };
  
  theme?: 'light' | 'dark';      // Default theme preference
  customCSS?: string;            // Additional CSS
}
```

---

### **Example Brand Configuration**

```typescript
// Example: GHXSTSHIP Default Brand
const ghxstshipBrand: BrandConfiguration = {
  id: 'ghxstship-default',
  name: 'GHXSTSHIP',
  slug: 'ghxstship',
  
  colors: {
    primary: '#3B82F6',          // Blue
    secondary: '#8B5CF6',        // Purple
    accent: '#06B6D4',           // Cyan
    
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#F1F5F9',
    border: '#E2E8F0',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
  
  assets: {
    logo: '/brands/ghxstship/logo.svg',
    logomark: '/brands/ghxstship/icon.svg',
    favicon: '/brands/ghxstship/favicon.ico',
    ogImage: '/brands/ghxstship/og-image.png',
  },
  
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Cal Sans, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  
  metadata: {
    title: 'GHXSTSHIP - Project Management Platform',
    description: 'Enterprise project management for creative industries',
    keywords: ['project management', 'creative', 'enterprise'],
  },
  
  theme: 'light',
};
```

---

## 🛠️ Usage Patterns

### **Pattern 1: Using Brand Hook**

```typescript
'use client';

import { useBrand } from '@ghxstship/shared/platform/brand';

export function BrandInfo() {
  const { brand, loading, error } = useBrand();
  
  if (loading) return <div>Loading brand...</div>;
  if (error) return <div>Error loading brand</div>;
  if (!brand) return null;
  
  return (
    <div>
      <h2>{brand.name}</h2>
      <p>{brand.metadata.description}</p>
    </div>
  );
}
```

---

### **Pattern 2: Brand Colors Hook**

```typescript
'use client';

import { useBrandColors } from '@ghxstship/shared/platform/brand';

export function ColorPalette() {
  const colors = useBrandColors();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div style={{ backgroundColor: colors.primary, color: colors.onPrimary }}>
        Primary
      </div>
      <div style={{ backgroundColor: colors.secondary, color: colors.onSecondary }}>
        Secondary
      </div>
      <div style={{ backgroundColor: colors.accent, color: colors.onAccent }}>
        Accent
      </div>
    </div>
  );
}
```

---

### **Pattern 3: Brand Logo Component**

```typescript
import { BrandLogo } from '@ghxstship/shared/platform/brand';

export function AppHeader() {
  return (
    <header>
      {/* Full logo with text */}
      <BrandLogo variant="full" height={40} />
      
      {/* Or icon-only logomark */}
      <BrandLogo variant="mark" height={32} />
    </header>
  );
}
```

---

### **Pattern 4: Brand Switcher**

```typescript
import { BrandSwitcher } from '@ghxstship/shared/platform/brand';

export function AdminPanel() {
  return (
    <div>
      <h1>Brand Management</h1>
      
      {/* Dropdown to switch between brands */}
      <BrandSwitcher />
    </div>
  );
}
```

---

### **Pattern 5: Server-Side Brand Loading**

```typescript
// app/[brandSlug]/page.tsx
import { getBrandBySlug } from '@ghxstship/shared/platform/brand/server';

export default async function BrandPage({
  params
}: {
  params: { brandSlug: string };
}) {
  const brand = await getBrandBySlug(params.brandSlug);
  
  if (!brand) {
    notFound();
  }
  
  return (
    <div>
      <h1>Welcome to {brand.name}</h1>
      <p>{brand.metadata.description}</p>
    </div>
  );
}
```

---

## 🎨 CSS Variable Generation

### **Automatic CSS Variables**

The branding system automatically generates CSS variables from brand configuration:

```typescript
import { generateBrandCSS } from '@ghxstship/shared/platform/brand/theme-generator';

const brandCSS = generateBrandCSS(brandConfig);
// Injects:
// :root {
//   --brand-primary: #3B82F6;
//   --brand-secondary: #8B5CF6;
//   --brand-accent: #06B6D4;
//   --brand-background: #FFFFFF;
//   --brand-foreground: #0F172A;
//   ...
// }
```

### **Using CSS Variables in Components**

```css
.button-primary {
  background-color: var(--brand-primary);
  color: var(--brand-on-primary);
  border: 1px solid var(--brand-border);
}

.card {
  background-color: var(--brand-background);
  color: var(--brand-foreground);
}
```

---

## 🔄 Brand Switching

### **Client-Side Brand Switching**

```typescript
'use client';

import { useBrand } from '@ghxstship/shared/platform/brand';

export function BrandSelector() {
  const { brand, switchBrand, loading } = useBrand();
  
  const handleSwitch = async (brandId: string) => {
    await switchBrand(brandId);
    // Page will reload with new brand
  };
  
  return (
    <select 
      value={brand?.id} 
      onChange={(e) => handleSwitch(e.target.value)}
      disabled={loading}
    >
      <option value="ghxstship-default">GHXSTSHIP</option>
      <option value="partner-a">Partner A</option>
      <option value="partner-b">Partner B</option>
    </select>
  );
}
```

---

### **Server-Side Brand Detection**

```typescript
// middleware.ts or server component
import { getBrandFromRequest } from '@ghxstship/shared/platform/brand/server';
import { cookies } from 'next/headers';

export async function detectBrand() {
  const cookieStore = cookies();
  const brandId = cookieStore.get('brand_id')?.value;
  
  if (brandId) {
    return await getBrandBySlug(brandId);
  }
  
  // Fallback to default brand
  return await getDefaultBrand();
}
```

---

## 🎯 Partner/Reseller Implementation

### **Step 1: Create Partner Brand Config**

```typescript
// config/brands/partner-acme.ts
export const acmeBrand: BrandConfiguration = {
  id: 'partner-acme',
  name: 'ACME Corporation',
  slug: 'acme',
  
  colors: {
    primary: '#DC2626',          // ACME Red
    secondary: '#1F2937',        // Dark Gray
    accent: '#FBBF24',           // Gold
    // ... other colors
  },
  
  assets: {
    logo: '/brands/acme/logo.svg',
    logomark: '/brands/acme/icon.svg',
    favicon: '/brands/acme/favicon.ico',
    ogImage: '/brands/acme/og-image.png',
  },
  
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  },
  
  metadata: {
    title: 'ACME Project Manager',
    description: 'Powered by GHXSTSHIP',
    keywords: ['acme', 'projects'],
  },
};
```

---

### **Step 2: Register Brand**

```typescript
// lib/brands.ts
import { acmeBrand } from '@/config/brands/partner-acme';
import { ghxstshipBrand } from '@/config/brands/ghxstship';

export const BRANDS = {
  'ghxstship': ghxstshipBrand,
  'acme': acmeBrand,
  // Add more partners
};

export function getBrandConfig(slug: string) {
  return BRANDS[slug] || BRANDS['ghxstship'];
}
```

---

### **Step 3: Dynamic Routing**

```typescript
// app/[brand]/layout.tsx
import { getBrandConfig } from '@/lib/brands';
import { BrandProvider } from '@ghxstship/shared/platform/brand';

export async function generateStaticParams() {
  return [
    { brand: 'ghxstship' },
    { brand: 'acme' },
    // ... other brands
  ];
}

export default async function BrandLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { brand: string };
}) {
  const brandConfig = getBrandConfig(params.brand);
  
  return (
    <BrandProvider initialBrand={brandConfig}>
      {children}
    </BrandProvider>
  );
}
```

---

## 🎨 Tailwind Integration

### **Extend Tailwind with Brand Colors**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          background: 'var(--brand-background)',
          foreground: 'var(--brand-foreground)',
          muted: 'var(--brand-muted)',
          border: 'var(--brand-border)',
        },
      },
    },
  },
};

export default config;
```

### **Use in Components**

```typescript
export function BrandedButton() {
  return (
    <button className="bg-brand-primary text-brand-on-primary hover:bg-brand-secondary">
      Click Me
    </button>
  );
}
```

---

## 📊 Brand Asset Management

### **Organizing Brand Assets**

```
public/
└── brands/
    ├── ghxstship/
    │   ├── logo.svg
    │   ├── logo-dark.svg
    │   ├── icon.svg
    │   ├── favicon.ico
    │   └── og-image.png
    ├── acme/
    │   ├── logo.svg
    │   ├── icon.svg
    │   ├── favicon.ico
    │   └── og-image.png
    └── partner-b/
        └── ...
```

### **Dynamic Asset Loading**

```typescript
import { useBrand } from '@ghxstship/shared/platform/brand';

export function DynamicFavicon() {
  const { brand } = useBrand();
  
  return (
    <Head>
      <link rel="icon" href={brand.assets.favicon} />
      <link rel="apple-touch-icon" href={brand.assets.logomark} />
    </Head>
  );
}
```

---

## 🔒 Security & Access Control

### **Brand-Specific Permissions**

```typescript
// middleware.ts
import { getBrandFromRequest } from '@ghxstship/shared/platform/brand/server';

export async function middleware(request: Request) {
  const brand = await getBrandFromRequest(request);
  
  // Check if user has access to this brand
  if (!userCanAccessBrand(user, brand.id)) {
    return Response.redirect('/unauthorized');
  }
  
  return next();
}
```

---

## 🧪 Testing with Brands

### **Mock Brand in Tests**

```typescript
import { render } from '@testing-library/react';
import { BrandProvider } from '@ghxstship/shared/platform/brand';
import { MyComponent } from './MyComponent';

const mockBrand = {
  id: 'test-brand',
  name: 'Test Brand',
  colors: {
    primary: '#000000',
    // ... minimal config
  },
  // ... other required fields
};

test('renders with brand', () => {
  const { getByText } = render(
    <BrandProvider initialBrand={mockBrand}>
      <MyComponent />
    </BrandProvider>
  );
  
  expect(getByText('Test Brand')).toBeInTheDocument();
});
```

---

## 📚 API Reference

### **Hooks**

| Hook | Returns | Usage |
|------|---------|-------|
| `useBrand()` | `{ brand, loading, error, switchBrand }` | Access brand context |
| `useBrandColors()` | `BrandColors` | Get brand color palette |
| `useBrandAssets()` | `BrandAssets` | Get brand assets |

### **Server Functions**

| Function | Parameters | Returns |
|----------|------------|---------|
| `getBrandConfig()` | - | `Promise<BrandConfiguration>` |
| `getBrandBySlug(slug)` | `string` | `Promise<BrandConfiguration \| null>` |
| `getDefaultBrand()` | - | `Promise<BrandConfiguration>` |
| `getAllBrands()` | - | `Promise<BrandConfiguration[]>` |

### **Components**

| Component | Props | Description |
|-----------|-------|-------------|
| `BrandProvider` | `initialBrand, children` | Provides brand context |
| `BrandLogo` | `variant, height, className` | Renders brand logo |
| `BrandSwitcher` | - | Brand selection dropdown |
| `BrandedHead` | `brand` | Brand-specific meta tags |

### **Utilities**

| Function | Parameters | Returns |
|----------|------------|---------|
| `generateBrandCSS(brand)` | `BrandConfiguration` | `string` |
| `loadBrandAssets(brand)` | `BrandConfiguration` | `Promise<void>` |

---

## ✅ Best Practices

1. ✅ **Centralize brand configs** — Keep all configs in one place
2. ✅ **Use CSS variables** — Enables runtime theme switching
3. ✅ **Lazy load assets** — Don't load all brand assets upfront
4. ✅ **Cache brand data** — Reduce server requests
5. ✅ **Validate brand configs** — Ensure all required fields present
6. ✅ **Test with multiple brands** — Verify brand switching works
7. ✅ **Document brand guidelines** — Help partners create configs

---

## 🚀 Advanced Features

### **Dynamic Font Loading**

```typescript
import { useBrand } from '@ghxstship/shared/platform/brand';
import { useEffect } from 'react';

export function BrandFonts() {
  const { brand } = useBrand();
  
  useEffect(() => {
    if (brand.typography.fontUrl) {
      const link = document.createElement('link');
      link.href = brand.typography.fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [brand]);
  
  return null;
}
```

### **Custom CSS Injection**

```typescript
export function CustomBrandCSS() {
  const { brand } = useBrand();
  
  if (!brand.customCSS) return null;
  
  return (
    <style dangerouslySetInnerHTML={{ __html: brand.customCSS }} />
  );
}
```

---

**Package Status:** ✅ Production Ready  
**Features:** Multi-brand, runtime switching, asset management  
**Integration:** Server and client compatible
