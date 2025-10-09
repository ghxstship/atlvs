/**
 * Server-Side Brand Utilities
 * Functions for loading brand configuration in server components
 */

import { cookies, headers } from 'next/headers';
import type { BrandConfiguration } from './types';
import fs from 'fs';
import path from 'path';

// Brand configs will be loaded from filesystem instead of static imports
// to avoid build/runtime issues with JSON imports
const bundledBrandConfigs: Record<string, BrandConfiguration> = {};

/**
 * Load bundled brand configs synchronously from file system
 * This ensures reliability in all deployment environments
 */
function loadBundledBrandConfig(brandId: string): BrandConfiguration | null {
  const normalizedId = brandId.toLowerCase();
  if (normalizedId in bundledBrandConfigs) {
    return bundledBrandConfigs[normalizedId];
  }

  try {
    const configPath = path.join(process.cwd(), 'branding', 'config', `${brandId}.brand.json`);
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(fileContent) as BrandConfiguration;
    }
  } catch (error) {
    console.error(`Failed to load bundled brand config for ${brandId}:`, error);
  }
  return null;
}

/**
 * Get active brand ID from cookies or environment
 */
export async function getActiveBrandId(): Promise<string> {
  let requestPath = '';

  try {
    const headerList = await headers();
    const rawPath = headerList.get('x-invoke-path')
      ?? headerList.get('x-middleware-pathname')
      ?? headerList.get('next-url');

    if (rawPath) {
      if (rawPath.startsWith('http')) {
        requestPath = new URL(rawPath).pathname;
      } else {
        requestPath = rawPath.split('?')[0] || '';
      }
    }
  } catch {
    // headers() may not be available in some execution contexts
  }

  const marketingPrefixes = [
    '/',
    '/home',
    '/solutions',
    '/products',
    '/community',
    '/company',
    '/partnerships',
    '/pricing',
    '/resources',
    '/security',
    '/privacy',
    '/terms',
    '/cookies',
    '/accessibility',
    '/contact'
  ];

  const isMarketingRoute = requestPath
    ? marketingPrefixes.some(prefix => {
        if (prefix === '/') {
          return requestPath === '/';
        }
        return requestPath === prefix || requestPath.startsWith(`${prefix}/`);
      })
    : false;

  if (isMarketingRoute) {
    return process.env.MARKETING_DEFAULT_BRAND_ID || 'ghxstship';
  }

  // Try to get from cookies first (set by middleware)
  try {
    const cookieStore = await cookies();
    const brandCookie = cookieStore.get('brand_id');
    if (brandCookie?.value) {
      return brandCookie.value;
    }
  } catch {
    // Cookies not available in this context
  }

  // Fall back to environment variable or default brand (ghxstship for green accent)
  return process.env.NEXT_PUBLIC_BRAND_ID || 'ghxstship';
}

/**
 * Load brand configuration from file system (server-side only)
 * Cached per request to avoid multiple file reads
 */
const configPromiseCache = new Map<string, Promise<BrandConfiguration>>();

const searchRoots = [
  path.join(process.cwd(), 'public', 'branding', 'config'),
  path.join(process.cwd(), 'branding', 'config'),
  path.join(process.cwd(), 'apps', 'web', 'branding', 'config'),
  path.join(process.cwd(), '..', 'apps', 'web', 'branding', 'config')
];

function readConfigFromFileSystem(brandId: string): BrandConfiguration | null {
  for (const root of searchRoots) {
    const configPath = path.join(root, `${brandId}.brand.json`);
    if (!fs.existsSync(configPath)) {
      continue;
    }

    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      const config: BrandConfiguration = JSON.parse(fileContent);
      return config;
    } catch (error) {
      console.error(`Failed to parse brand config at ${configPath}:`, error);
    }
  }

  return null;
}

async function readBrandConfig(brandId: string): Promise<BrandConfiguration> {
  try {
    const configFromFs = readConfigFromFileSystem(brandId);
    if (configFromFs) {
      return configFromFs;
    }
  } catch (error) {
    console.warn(`Error reading brand config from FS for ${brandId}:`, error);
  }

  // Try bundled config
  try {
    const bundledConfig = loadBundledBrandConfig(brandId);
    if (bundledConfig) {
      return bundledConfig;
    }
  } catch (error) {
    console.warn(`Error loading bundled brand config for ${brandId}:`, error);
  }

  // Try default as fallback
  if (brandId !== 'default') {
    try {
      const defaultConfigFromFs = readConfigFromFileSystem('default');
      if (defaultConfigFromFs) {
        return defaultConfigFromFs;
      }
    } catch (error) {
      console.warn(`Error reading default brand config from FS:`, error);
    }

    try {
      const bundledDefault = loadBundledBrandConfig('default');
      if (bundledDefault) {
        return bundledDefault;
      }
    } catch (error) {
      console.warn(`Error loading bundled default brand config:`, error);
    }
  }

  // Last resort: create a minimal fallback config
  console.error(`Failed to locate brand config for ${brandId}, using minimal fallback`);
  return {
    version: '1.0.0',
    brand: {
      id: 'ghxstship',
      name: 'GHXSTSHIP',
      slug: 'ghxstship',
      description: 'Default brand configuration',
      tagline: 'The Future of Management',
      website: 'https://ghxstship.com',
      support: {
        email: 'support@ghxstship.com',
        phone: '',
        website: 'https://ghxstship.com/support'
      },
      legal: {
        company: 'GHXSTSHIP LLC',
        address: '',
        termsUrl: '/terms',
        privacyUrl: '/privacy'
      }
    },
    theme: {
      colors: {
        brand: {
          primary: 'hsl(142, 76%, 36%)',
          secondary: 'hsl(142, 76%, 46%)',
          accent: 'hsl(142, 76%, 56%)'
        },
        ui: {
          background: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(0, 0%, 3.9%)',
          card: 'hsl(0, 0%, 100%)',
          'card-foreground': 'hsl(0, 0%, 3.9%)',
          popover: 'hsl(0, 0%, 100%)',
          'popover-foreground': 'hsl(0, 0%, 3.9%)',
          muted: 'hsl(0, 0%, 96.1%)',
          'muted-foreground': 'hsl(0, 0%, 45.1%)',
          border: 'hsl(0, 0%, 89.8%)',
          input: 'hsl(0, 0%, 89.8%)',
          ring: 'hsl(142, 76%, 36%)'
        },
        semantic: {
          success: 'hsl(142, 76%, 36%)',
          warning: 'hsl(48, 96%, 53%)',
          error: 'hsl(0, 84%, 60%)',
          info: 'hsl(199, 89%, 48%)'
        }
      },
      typography: {
        fontFamily: {
          heading: 'ANTON, Impact, sans-serif',
          body: 'Share Tech, Arial, sans-serif',
          mono: 'Share Tech Mono, Courier New, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        }
      },
      spacing: {},
      borderRadius: {},
      shadows: {}
    },
    assets: {
      logos: {
        primary: '/logo.svg',
        icon: '/icon.svg',
        wordmark: '/wordmark.svg'
      },
      favicon: '/favicon.ico',
      images: {
        hero: '/hero.jpg',
        auth: '/auth.jpg',
        placeholder: '/placeholder.jpg'
      }
    },
    content: {
      tagline: 'The Future of Management',
      description: 'Default description',
      callToAction: 'Get Started'
    },
    features: {
      modules: {}
    },
    seo: {
      title: 'GHXSTSHIP',
      description: 'Default description',
      keywords: []
    }
  } as unknown as BrandConfiguration;
}

export async function loadBrandConfig(brandId: string): Promise<BrandConfiguration> {
  if (!configPromiseCache.has(brandId)) {
    configPromiseCache.set(brandId, readBrandConfig(brandId));
  }

  return configPromiseCache.get(brandId)!;
}

/**
 * Get active brand configuration (server-side)
 * Use this in server components and API routes
 */
export async function getActiveBrand(): Promise<BrandConfiguration> {
  const brandId = await getActiveBrandId();
  return loadBrandConfig(brandId);
}

/**
 * Check if a module is enabled for the current brand
 */
export async function isModuleEnabled(moduleName: string): Promise<boolean> {
  const brand = await getActiveBrand();
  return brand.features?.modules[moduleName as keyof typeof brand.features.modules] ?? true;
}
