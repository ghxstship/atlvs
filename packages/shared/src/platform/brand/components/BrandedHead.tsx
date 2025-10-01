/**
 * BrandedHead Component
 * Injects brand-specific metadata, favicon, and theme into document head
 */

'use client';

import { useBrand } from '../context';
import { generateThemeCSS, generateFontImports } from '../theme-generator';

export function BrandedHead() {
  const { brand } = useBrand();

  if (!brand) return null;

  const themeCSS = generateThemeCSS(brand.theme);
  const fontImports = generateFontImports(brand.assets.fonts);

  return (
    <>
      {/* Brand Theme CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      {/* Custom Font Imports */}
      {fontImports && <style dangerouslySetInnerHTML={{ __html: fontImports }} />}

      {/* Favicon */}
      <link rel="icon" href={brand.assets.favicon} />

      {/* SEO Meta Tags */}
      <meta name="description" content={brand.seo.description} />
      <meta name="keywords" content={brand.seo.keywords.join(', ')} />

      {/* Open Graph */}
      <meta property="og:title" content={brand.seo.title} />
      <meta property="og:description" content={brand.seo.description} />
      <meta property="og:image" content={brand.seo.ogImage} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={brand.seo.title} />
      <meta name="twitter:description" content={brand.seo.description} />
      <meta name="twitter:image" content={brand.seo.ogImage} />
      {brand.seo.twitterHandle && (
        <meta name="twitter:site" content={brand.seo.twitterHandle} />
      )}

      {/* Theme Color */}
      <meta name="theme-color" content={brand.theme.colors.brand.primary} />
    </>
  );
}
