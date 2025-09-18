import { NextResponse, type NextRequest } from 'next/server';
import { getRedis } from '../../../../../../lib/redis';
import { getSupabaseAndServices } from '../../../../../../lib/services';
import * as Sentry from '@sentry/nextjs';
import { limitRequest } from '../../../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'webhooks.redrive.process' }, async () => {
    const rate = await limitRequest(request, 'webhooks:redrive:process');
    if (!rate.success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    const redis = getRedis();
    const { services } = getSupabaseAndServices();

    // Process up to N jobs non-blocking
    const limit = 10;
    let processed = 0;
    if (redis) {
      for (let i = 0; i < limit; i++) {
        const job = await redis.rpop('webhooks:redrive');
        if (!job) break;
        // Perform a redrive pass for up to 50 failed deliveries per job
        await services.webhooks.redrive(50);
        processed++;
      }
    }

    return NextResponse.json({ ok: true, processed }, { status: 200 });
  });
}
