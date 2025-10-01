import { NextRequest, NextResponse } from 'next/server';
import { createCSRFTokenResponse } from '@/lib/csrf';
import { requirePermission } from '@ghxstship/auth/server';
import { Permission } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf-token - Get a new CSRF token (authenticated users only)
 */
export const GET = requirePermission(Permission.PROFILE_VIEW)(
  async (request: NextRequest) => {
    try {
      // This endpoint now requires authentication
      // The permission middleware handles authentication and authorization
      const response = createCSRFTokenResponse();
      return response;
    } catch (error) {
      console.error('CSRF token generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate CSRF token' },
        { status: 500 }
      );
    }
  }
);
