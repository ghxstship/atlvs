/**
 * Server-Side Brand Utilities
 * Functions for loading brand configuration in server components
 */

import { cookies } from 'next/headers';
import { cache } from 'react';
import type { BrandConfiguration } from './types';
import fs from 'fs';
import path from 'path';

/**
 * Load bundled brand configs synchronously from file system
 * This ensures reliability in all deployment environments
 */
function loadBundledBrandConfig(brandId: string): BrandConfiguration | null {
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
export const loadBrandConfig = cache(async (brandId: string): Promise<BrandConfiguration> => {
  const searchRoots = [
    path.join(process.cwd(), 'public', 'branding', 'config'),
    path.join(process.cwd(), 'branding', 'config'),
    path.join(process.cwd(), '..', 'branding', 'config')
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
    return loadBrandConfig('default');
  }

  throw new Error(`Brand configuration not found for id: ${brandId}`);
});

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
