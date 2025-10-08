import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set CSRF token in both cookie and response header
 */
export function setCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken();

  // Set token in httpOnly cookie
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  });

  // Set token in response header for client access
  response.headers.set(CSRF_TOKEN_NAME, token);

  return response;
}

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFToken(request);

  if (!cookieToken) {
    return false;
  }

  // Check token in various possible locations
  const headerToken = request.headers.get('x-csrf-token') ||
                     request.headers.get(CSRF_TOKEN_NAME);

  const bodyToken = request.method !== 'GET' && request.method !== 'HEAD'
    ? getBodyCSRFToken(request)
    : null;

  const token = headerToken || bodyToken;

  if (!token) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken, 'hex'),
    Buffer.from(token, 'hex')
  );
}

function getBodyCSRFToken(request: NextRequest): string | null {
  try {
    // For form data - note: this consumes the request body
    // In practice, you'd want to clone the request or handle this differently
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/x-www-form-urlencoded') ||
        contentType?.includes('multipart/form-data')) {
      // CSRF tokens in forms should be sent as hidden inputs
      // This is a simplified implementation
      return null; // Let the client handle form-based CSRF tokens in headers
    }

    // For JSON body - CSRF tokens should be in headers for security
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to enforce CSRF protection on state-changing requests
 */
export function withCSRFProtection(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return handler(req, context);
    }

    // Skip CSRF check for API routes that handle their own auth
    if (req.nextUrl.pathname.startsWith('/api/auth/')) {
      return handler(req, context);
    }

    // Validate CSRF token
    if (!validateCSRFToken(req)) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

/**
 * Generate CSRF token for client-side use
 */
export function createCSRFTokenResponse(): NextResponse {
  const response = NextResponse.json({ success: true });
  return setCSRFToken(response);
}

/**
 * Add CSRF token to any response
 */
export function addCSRFTokenToResponse(response: NextResponse): NextResponse {
  return setCSRFToken(response);
}
