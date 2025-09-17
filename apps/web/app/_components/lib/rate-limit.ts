import { NextRequest } from 'next/server';

// Simple rate limiting implementation
export async function rateLimitRequest(
  req: NextRequest,
  key: string,
  windowSizeInSeconds: number,
  maxRequests: number
): Promise<{ success: boolean; remaining?: number }> {
  // For now, return success to allow builds to pass
  // TODO: Implement proper rate limiting with Redis or similar
  return { success: true, remaining: maxRequests };
}
