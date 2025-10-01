/**
 * BrandSwitcher Component
 * Admin component for switching between brands (development/testing only)
 */

'use client';

import { useState, useEffect } from 'react';
import { useBrand } from '../context';

export interface BrandSwitcherProps {
  className?: string;
}

interface BrandOption {
  id: string;
  name: string;
  enabled: boolean;
}

export function BrandSwitcher({ className = '' }: BrandSwitcherProps) {
  const { brand, switchBrand, loading } = useBrand();
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const response = await fetch('/branding/config/brands.json');
        const registry = await response.json();
        setBrands(registry.brands.filter((b: BrandOption) => b.enabled));
      } catch (error) {
        console.error('Failed to load brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  if (loadingBrands) {
    return <div className={className}>Loading brands...</div>;
  }

  return (
    <div className={`brand-switcher ${className}`}>
      <label htmlFor="brand-select" className="text-sm font-medium">
        Brand:
      </label>
      <select
        id="brand-select"
        value={brand?.brand.id || 'default'}
        onChange={(e) => switchBrand(e.target.value)}
        disabled={loading}
        className="ml-sm p-xs border rounded"
      >
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
