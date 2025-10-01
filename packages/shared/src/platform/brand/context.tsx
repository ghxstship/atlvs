/**
 * Brand Context Provider
 * React context for accessing brand configuration
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { BrandConfiguration } from './types';
import { brandLoader } from './loader';

interface BrandContextValue {
  brand: BrandConfiguration | null;
  loading: boolean;
  error: Error | null;
  switchBrand: (brandId: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export interface BrandProviderProps {
  children: React.ReactNode;
  initialBrand?: BrandConfiguration;
}

export function BrandProvider({ children, initialBrand }: BrandProviderProps) {
  const [brand, setBrand] = useState<BrandConfiguration | null>(initialBrand || null);
  const [loading, setLoading] = useState(!initialBrand);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!initialBrand) {
      loadBrand();
    }
  }, [initialBrand]);

  async function loadBrand() {
    try {
      setLoading(true);
      setError(null);
      const config = await brandLoader.getActiveBrand();
      setBrand(config);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load brand:', err);
    } finally {
      setLoading(false);
    }
  }

  async function switchBrand(brandId: string) {
    try {
      setLoading(true);
      setError(null);
      const config = await brandLoader.loadBrand(brandId);
      setBrand(config);
      
      // Update cookie for persistence
      if (typeof document !== 'undefined') {
        document.cookie = `brand_id=${brandId}; path=/; max-age=31536000; SameSite=Lax`;
      }
      
      // Reload page to apply new brand theme
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to switch brand:', err);
    } finally {
      setLoading(false);
    }
  }

  const value: BrandContextValue = {
    brand,
    loading,
    error,
    switchBrand,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }
  return context;
}
