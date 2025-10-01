/**
 * Brand Hooks
 * Custom React hooks for accessing brand data
 */

'use client';

import { useMemo } from 'react';
import { useBrand } from './context';
import type {
  ThemeConfig,
  AssetConfig,
  ContentConfig,
  FeatureConfig,
  NavigationLabels,
} from './types';

/**
 * Get the current brand theme configuration
 */
export function useBrandTheme(): ThemeConfig | null {
  const { brand } = useBrand();
  return brand?.theme || null;
}

/**
 * Get the current brand assets (logos, images, fonts)
 */
export function useBrandAssets(): AssetConfig | null {
  const { brand } = useBrand();
  return brand?.assets || null;
}

/**
 * Get the current brand content (labels, terminology, marketing)
 */
export function useBrandContent(): ContentConfig | null {
  const { brand } = useBrand();
  return brand?.content || null;
}

/**
 * Get the current brand feature flags
 */
export function useBrandFeatures(): FeatureConfig | null {
  const { brand } = useBrand();
  return brand?.features || null;
}

/**
 * Get brand-specific terminology
 * Returns a function that maps keys to branded terms
 * 
 * @example
 * const t = useBrandTerminology();
 * t('project') // Returns "mission" for GHXSTSHIP, "project" for default
 */
export function useBrandTerminology() {
  const { brand } = useBrand();
  
  return useMemo(() => {
    return (key: string): string => {
      if (!brand?.content.terminology) return key;
      return brand.content.terminology[key] || key;
    };
  }, [brand]);
}

/**
 * Get brand-specific navigation label
 * 
 * @example
 * const label = useBrandLabel('projects');
 * // Returns "Missions" for GHXSTSHIP, "Projects" for default
 */
export function useBrandLabel(key: keyof NavigationLabels): string {
  const { brand } = useBrand();
  
  return useMemo(() => {
    if (!brand?.content.navigation) return key;
    return brand.content.navigation[key] || key;
  }, [brand, key]);
}

/**
 * Get brand name
 */
export function useBrandName(): string {
  const { brand } = useBrand();
  return brand?.brand.name || 'ATLVS';
}

/**
 * Get brand colors
 */
export function useBrandColors() {
  const theme = useBrandTheme();
  return useMemo(() => {
    if (!theme) return null;
    return {
      primary: theme.colors.brand.primary,
      secondary: theme.colors.brand.secondary,
      accent: theme.colors.brand.accent,
      success: theme.colors.semantic.success,
      warning: theme.colors.semantic.warning,
      error: theme.colors.semantic.error,
      info: theme.colors.semantic.info,
    };
  }, [theme]);
}

/**
 * Check if a module is enabled for the current brand
 */
export function useModuleEnabled(moduleName: keyof FeatureConfig['modules']): boolean {
  const features = useBrandFeatures();
  return features?.modules[moduleName] ?? true;
}

/**
 * Get all enabled modules for the current brand
 */
export function useEnabledModules(): string[] {
  const features = useBrandFeatures();
  
  return useMemo(() => {
    if (!features?.modules) return [];
    return Object.entries(features.modules)
      .filter(([_, enabled]) => enabled)
      .map(([module]) => module);
  }, [features]);
}
