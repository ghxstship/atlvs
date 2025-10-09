// Import global styles
import './globals.css';

import type { Metadata } from 'next';
import { Anton, Share_Tech, Share_Tech_Mono } from 'next/font/google';
import { WebVitals } from './web-vitals';
import { GHXSTSHIPProvider } from '@ghxstship/ui';
import { BrandProvider } from '@ghxstship/shared/platform/brand/context';
import { generateThemeCSS, generateFontImports } from '@ghxstship/shared/platform/brand/theme-generator';

// Force dynamic rendering to avoid cookies() error during build
export const dynamic = 'force-dynamic';

const anton = Anton({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-title',
  display: 'swap',
  fallback: ['Impact', 'Arial Black', 'sans-serif']
});
const shareTech = Share_Tech({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif']
});
const shareTechMono = Share_Tech_Mono({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
  fallback: ['Courier New', 'monospace']
});

export const metadata: Metadata = {
  title: 'GHXSTSHIP Platform',
  description: 'ATLVS + OPENDECK + GHXSTSHIP',
  metadataBase: new URL('https://ghxstship.com'),
  robots: {
    index: true,
    follow: true
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Load active brand configuration with error handling
  let brandConfig;
  let activeBrandId = 'ghxstship'; // default fallback
  
  try {
    const { getActiveBrandId, loadBrandConfig } = await import('@ghxstship/shared/platform/brand/server');
    activeBrandId = await getActiveBrandId();
    brandConfig = await loadBrandConfig(activeBrandId);
  } catch (error) {
    console.error('Error loading brand configuration:', error);
    // Load default fallback brand config
    const ghxstshipBrand = await import('@branding/config/ghxstship.brand.json');
    brandConfig = ghxstshipBrand.default;
  }
  
  // Generate theme CSS from brand configuration
  const themeCSS = generateThemeCSS(brandConfig.theme);
  const fontImports = ''; // Font imports handled via Next.js font loading

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Brand Theme CSS */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        {fontImports && <style dangerouslySetInnerHTML={{ __html: fontImports }} />}
        
        {/* Favicon */}
        <link rel="icon" href={brandConfig.assets.favicon} />
        
        {/* SEO */}
        <title>{brandConfig.seo.title}</title>
        <meta name="description" content={brandConfig.seo.description} />
        <meta name="theme-color" content={brandConfig.theme.colors.brand.primary} />
      </head>
      <body 
        className={`${shareTech.className} ${shareTech.variable} ${shareTechMono.variable} ${anton.variable}`} 
        data-brand={brandConfig.brand.id}
      >
        <BrandProvider initialBrand={brandConfig}>
          <GHXSTSHIPProvider 
            theme={{ 
              defaultBrand: brandConfig.brand.id as 'ghxstship' | 'atlvs' | 'opendeck',
              defaultTheme: 'system'
            }}
            accessibility={{
              defaultConfig: {
                announcements: true,
                focusManagement: true,
                keyboardNavigation: true,
                screenReaderOptimizations: true,
                colorContrastEnforcement: true,
                motionReduction: false,
                textScaling: true,
                highContrastMode: false
              }
            }}
          >
            <WebVitals />
            {children}
          </GHXSTSHIPProvider>
        </BrandProvider>
      </body>
    </html>
  );
}

// Force Vercel redeploy - Sun Oct  5 13:47:12 EDT 2025

