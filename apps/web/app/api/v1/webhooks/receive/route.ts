import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import { createHmac } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const inboundSecret = process.env.INBOUND_WEBHOOK_SECRET;
    if (!inboundSecret) {
      return NextResponse.json({ error: 'Inbound webhook not configured' }, { status: 503 });
    }

    const signatureHeader = request.headers.get('x-webhook-signature') || '';
    const rawBody = await request.text();
    const expected = createHmac('sha256', inboundSecret).update(rawBody).digest('hex');
    if (expected !== signatureHeader) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse after validation
    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { audit } = getSupabaseAndServices();
    // Record minimal audit for inbound webhook
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: 'system:webhook' },
      tenant: { organizationId: payload?.organizationId ?? 'unknown' },
      action: 'workflow.execute',
      entity: { type: payload?.type ?? 'webhook', id: payload?.id ?? null },
      meta: payload
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
