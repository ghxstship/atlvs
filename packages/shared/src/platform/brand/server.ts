/**
 * Server-Side Brand Utilities
 * Functions for loading brand configuration in server components
 */

import { cookies } from 'next/headers';
import type { BrandConfiguration } from './types';
import fs from 'fs';
import path from 'path';

import defaultBrand from '@branding/config/default.brand.json';
import ghxstshipBrand from '@branding/config/ghxstship.brand.json';
import atlvsBrand from '@branding/config/atlvs.brand.json';
import opendeckBrand from '@branding/config/opendeck.brand.json';
import whitelabelBrand from '@branding/config/whitelabel.brand.json';

const bundledBrandConfigs: Record<string, BrandConfiguration> = {
  default: defaultBrand,
  ghxstship: ghxstshipBrand,
  atlvs: atlvsBrand,
  opendeck: opendeckBrand,
  whitelabel: whitelabelBrand,
};

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
{{ ... }}
const configPromiseCache = new Map<string, Promise<BrandConfiguration>>();

async function readBrandConfig(brandId: string): Promise<BrandConfiguration> {
  const searchRoots = [
    path.join(process.cwd(), 'public', 'branding', 'config'),
    path.join(process.cwd(), 'branding', 'config'),
    path.join(process.cwd(), '..', 'branding', 'config'),
    path.join(process.cwd(), 'apps', 'web', 'branding', 'config'),
    path.join(process.cwd(), '..', 'apps', 'web', 'branding', 'config')
  ];

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

  console.error(`Failed to locate brand config for ${brandId}`);

  const bundledConfig = loadBundledBrandConfig(brandId);
  if (bundledConfig) {
    return bundledConfig;
  }

  if (brandId !== 'default') {
    const defaultConfig = await readBrandConfig('default').catch(() => null);
    if (defaultConfig) {
      return defaultConfig;
    }

    const bundledDefault = loadBundledBrandConfig('default');
    if (bundledDefault) {
      return bundledDefault;
    }
  }

  throw new Error(`Brand configuration not found for id: ${brandId}`);
}

export function loadBrandConfig(brandId: string): Promise<BrandConfiguration> {
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
