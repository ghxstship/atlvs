import { NextResponse, type NextRequest } from 'next/server';
import { getRedis } from '../../../../../../lib/redis';
import * as Sentry from '@sentry/nextjs';
import { limitRequest } from '../../../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'webhooks.redrive.enqueue' }, async () => {
    const rate = await limitRequest(request, 'webhooks:redrive:enqueue');
    if (!rate.success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    const redis = getRedis();
    if (redis) {
      // Enqueue a simple marker; processors will perform redrive(limit)
      await redis.lpush('webhooks:redrive', { ts: Date.now() });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  });
}
