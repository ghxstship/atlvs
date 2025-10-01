/**
 * Brand Loader
 * Handles loading and caching of brand configurations
 */

import type { BrandConfiguration, BrandRegistry } from './types';

export class BrandLoader {
  private static instance: BrandLoader;
  private cache: Map<string, BrandConfiguration> = new Map();
  private registry: BrandRegistry | null = null;

  private constructor() {}

  static getInstance(): BrandLoader {
    if (!BrandLoader.instance) {
      BrandLoader.instance = new BrandLoader();
    }
    return BrandLoader.instance;
  }

  async loadRegistry(): Promise<BrandRegistry> {
    if (this.registry) return this.registry;

    try {
      const response = await fetch('/branding/config/brands.json');
      if (!response.ok) {
        throw new Error(`Failed to load brand registry: ${response.statusText}`);
      }
      this.registry = await response.json();
      return this.registry;
    } catch (error) {
      console.error('Error loading brand registry:', error);
      throw error;
    }
  }

  async loadBrand(brandId: string): Promise<BrandConfiguration> {
    if (this.cache.has(brandId)) {
      return this.cache.get(brandId)!;
    }

    try {
      const response = await fetch(`/branding/config/${brandId}.brand.json`);
      if (!response.ok) {
        throw new Error(`Failed to load brand ${brandId}: ${response.statusText}`);
      }
      const config: BrandConfiguration = await response.json();
      this.cache.set(brandId, config);
      return config;
    } catch (error) {
      console.error(`Error loading brand ${brandId}:`, error);
      throw error;
    }
  }

  async getActiveBrand(): Promise<BrandConfiguration> {
    const brandId = this.getActiveBrandId();
    return this.loadBrand(brandId);
  }

  getActiveBrandId(): string {
    // Check cookie first (set by middleware)
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const brandCookie = cookies.find(c => c.trim().startsWith('brand_id='));
      if (brandCookie) {
        const brandId = brandCookie.split('=')[1];
        if (brandId) return brandId;
      }
    }

    // Check environment variable
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BRAND_ID) {
      return process.env.NEXT_PUBLIC_BRAND_ID;
    }

    // Default fallback
    return 'default';
  }

  async getBrandByDomain(domain: string): Promise<BrandConfiguration | null> {
    try {
      const registry = await this.loadRegistry();
      const brand = registry.brands.find(b => 
        b.enabled && b.domains.some(d => domain.includes(d))
      );
      
      if (!brand) return null;
      return this.loadBrand(brand.id);
    } catch (error) {
      console.error('Error loading brand by domain:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.registry = null;
  }
}

export const brandLoader = BrandLoader.getInstance();
