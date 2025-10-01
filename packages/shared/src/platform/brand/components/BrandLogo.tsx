/**
 * BrandLogo Component
 * Displays the appropriate brand logo with automatic fallback
 */

'use client';

import { useBrandAssets, useBrandName } from '../hooks';
import Image from 'next/image';

export interface BrandLogoProps {
  variant?: 'primary' | 'icon' | 'wordmark';
  className?: string;
  width?: number;
  height?: number;
}

export function BrandLogo({ 
  variant = 'primary', 
  className = '',
  width = 120,
  height = 40,
}: BrandLogoProps) {
  const assets = useBrandAssets();
  const brandName = useBrandName();

  if (!assets) {
    return <span className={className}>{brandName}</span>;
  }

  const logoSrc = assets.logos[variant];

  return (
    <Image
      src={logoSrc}
      alt={`${brandName} Logo`}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
