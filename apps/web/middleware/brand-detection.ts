/**
 * Brand Detection Middleware
 * Automatically detects brand based on domain and sets cookie
 */

import { NextResponse, type NextRequest } from 'next/server';

// Brand registry configuration
const BRAND_DOMAINS: Record<string, string> = {
  'atlvs.com': 'default',
  'app.atlvs.com': 'default',
  'ghxstship.com': 'ghxstship',
  'app.ghxstship.com': 'ghxstship',
  'opendeck.com': 'opendeck',
  'marketplace.opendeck.com': 'opendeck',
  'localhost': process.env.NEXT_PUBLIC_BRAND_ID || 'default',
};

/**
 * Detect brand based on hostname and set cookie if needed
 */
export async function brandDetectionMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const hostname = request.headers.get('host') || '';
  const currentBrandCookie = request.cookies.get('brand_id')?.value;

  // Determine brand from hostname
  let detectedBrandId = BRAND_DOMAINS['localhost']; // default fallback

  // Check each domain pattern
  for (const [domain, brandId] of Object.entries(BRAND_DOMAINS)) {
    if (hostname.includes(domain)) {
      detectedBrandId = brandId;
      break;
    }
  }

  // If brand cookie doesn't exist or is different, set it
  if (!currentBrandCookie || currentBrandCookie !== detectedBrandId) {
    const response = NextResponse.next();
    
    // Set brand cookie with 1 year expiration
    response.cookies.set('brand_id', detectedBrandId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Also set as header for server components
    response.headers.set('x-brand-id', detectedBrandId);

    return response;
  }

  // Brand cookie exists and matches, continue
  return null;
}
