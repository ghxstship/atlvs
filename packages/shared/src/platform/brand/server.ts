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
 * Get active brand ID from cookies or environment
 */
export function getActiveBrandId(): string {
  // Try to get from cookies first (set by middleware)
  try {
    const cookieStore = cookies();
    const brandCookie = cookieStore.get('brand_id');
    if (brandCookie?.value) {
      return brandCookie.value;
    }
  } catch (error) {
    // Cookies not available in this context
  }

  // Fall back to environment variable
  return process.env.NEXT_PUBLIC_BRAND_ID || 'default';
}

/**
 * Load brand configuration from file system (server-side only)
 * Cached per request to avoid multiple file reads
 */
export const loadBrandConfig = cache(async (brandId: string): Promise<BrandConfiguration> => {
  try {
    // In development, read from branding directory
    // In production, read from public directory
    const isDev = process.env.NODE_ENV === 'development';
    const configPath = isDev
      ? path.join(process.cwd(), 'branding', 'config', `${brandId}.brand.json`)
      : path.join(process.cwd(), 'public', 'branding', 'config', `${brandId}.brand.json`);

    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const config: BrandConfiguration = JSON.parse(fileContent);
    return config;
  } catch (error) {
    console.error(`Failed to load brand config for ${brandId}:`, error);
    
    // Fallback to default brand
    if (brandId !== 'default') {
      return loadBrandConfig('default');
    }
    
    throw error;
  }
});

/**
 * Get active brand configuration (server-side)
 * Use this in server components and API routes
 */
export async function getActiveBrand(): Promise<BrandConfiguration> {
  const brandId = getActiveBrandId();
  return loadBrandConfig(brandId);
}

/**
 * Check if a module is enabled for the current brand
 */
export async function isModuleEnabled(moduleName: string): Promise<boolean> {
  const brand = await getActiveBrand();
  return brand.features?.modules[moduleName as keyof typeof brand.features.modules] ?? true;
}
