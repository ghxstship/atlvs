/**
 * Direction Provider for RTL/LTR Support
 * Manages text direction and layout mirroring
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { Locale } from './config';
import { getDirection, isRTL } from './config';

// ============================================================================
// DIRECTION CONTEXT
// ============================================================================

export interface DirectionContextValue {
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  locale: Locale;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

// ============================================================================
// DIRECTION PROVIDER
// ============================================================================

export interface DirectionProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

/**
 * Provider for text direction and RTL support
 */
export function DirectionProvider({ locale, children }: DirectionProviderProps) {
  const direction = useMemo(() => getDirection(locale), [locale]);
  const rtl = useMemo(() => isRTL(locale), [locale]);

  // Update HTML dir attribute
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;

    // Add RTL class for CSS targeting
    if (rtl) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }

    return () => {
      document.documentElement.classList.remove('rtl');
    };
  }, [direction, locale, rtl]);

  const value = useMemo(
    () => ({
      direction,
      isRTL: rtl,
      locale,
    }),
    [direction, rtl, locale]
  );

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

// ============================================================================
// DIRECTION HOOK
// ============================================================================

/**
 * Hook to access direction context
 */
export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within DirectionProvider');
  }
  return context;
}

// ============================================================================
// DIRECTIONAL ICON MAPPING
// ============================================================================

export type DirectionalIconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'caret-left'
  | 'caret-right';

const iconMirrorMap: Record<DirectionalIconName, DirectionalIconName> = {
  'arrow-left': 'arrow-right',
  'arrow-right': 'arrow-left',
  'chevron-left': 'chevron-right',
  'chevron-right': 'chevron-left',
  'caret-left': 'caret-right',
  'caret-right': 'caret-left',
};

/**
 * Get directional icon name based on text direction
 */
export function getDirectionalIcon(
  iconName: DirectionalIconName,
  direction: 'ltr' | 'rtl'
): DirectionalIconName {
  if (direction === 'rtl') {
    return iconMirrorMap[iconName] || iconName;
  }
  return iconName;
}

/**
 * Hook to get directional icon
 */
export function useDirectionalIcon(iconName: DirectionalIconName): DirectionalIconName {
  const { direction } = useDirection();
  return useMemo(() => getDirectionalIcon(iconName, direction), [iconName, direction]);
}

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

/**
 * Get logical CSS property based on direction
 */
export function getLogicalProperty(
  property: 'left' | 'right' | 'start' | 'end',
  direction: 'ltr' | 'rtl'
): 'left' | 'right' {
  if (property === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  if (property === 'end') {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return property;
}

/**
 * Hook to get logical CSS property
 */
export function useLogicalProperty(
  property: 'left' | 'right' | 'start' | 'end'
): 'left' | 'right' {
  const { direction } = useDirection();
  return useMemo(() => getLogicalProperty(property, direction), [property, direction]);
}

/**
 * Get mirrored transform for RTL
 */
export function getMirroredTransform(transform: string, direction: 'ltr' | 'rtl'): string {
  if (direction === 'rtl') {
    // Mirror horizontal transformations
    return transform.replace(/translateX\(([^)]+)\)/, (_, value) => {
      const numericValue = parseFloat(value);
      return `translateX(${-numericValue}${value.replace(/[0-9.-]/g, '')})`;
    });
  }
  return transform;
}

/**
 * Hook to get mirrored transform
 */
export function useMirroredTransform(transform: string): string {
  const { direction } = useDirection();
  return useMemo(() => getMirroredTransform(transform, direction), [transform, direction]);
}

// ============================================================================
// DIRECTIONAL CLASSNAMES
// ============================================================================

/**
 * Get directional className
 */
export function getDirectionalClassName(
  baseClass: string,
  direction: 'ltr' | 'rtl'
): string {
  return direction === 'rtl' ? `${baseClass} ${baseClass}--rtl` : baseClass;
}

/**
 * Hook to get directional className
 */
export function useDirectionalClassName(baseClass: string): string {
  const { direction } = useDirection();
  return useMemo(() => getDirectionalClassName(baseClass, direction), [baseClass, direction]);
}

// ============================================================================
// TEXT ALIGNMENT
// ============================================================================

/**
 * Get text alignment based on direction
 */
export function getTextAlignment(
  alignment: 'left' | 'right' | 'start' | 'end' | 'center',
  direction: 'ltr' | 'rtl'
): 'left' | 'right' | 'center' {
  if (alignment === 'center') return 'center';
  if (alignment === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  if (alignment === 'end') {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return alignment;
}

/**
 * Hook to get text alignment
 */
export function useTextAlignment(
  alignment: 'left' | 'right' | 'start' | 'end' | 'center'
): 'left' | 'right' | 'center' {
  const { direction } = useDirection();
  return useMemo(() => getTextAlignment(alignment, direction), [alignment, direction]);
}
