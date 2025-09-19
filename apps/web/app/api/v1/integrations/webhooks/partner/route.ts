import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

function verifySignature(secret: string, body: string, signature: string | null): boolean {
  if (!signature) return false;
  const hmac = createHmac('sha256', secret).update(body).digest('hex');
  return signature === hmac;
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'integrations.webhooks.partner.receive' }, async () => {
    try {
      const secret = process.env.WEBHOOKS_PARTNER_SECRET || '';
      if (!secret) {
        return NextResponse.json({ error: 'Receiver not configured' }, { status: 500 });
      }
      const signature = request.headers.get('x-webhook-signature');
      const id = request.headers.get('x-webhook-id') || '';
      const text = await request.text();
      const ok = verifySignature(secret, text, signature);
      if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

      const payload = JSON.parse(text || '{}');
      // Example: log event type and id
      console.log('Webhook received', { id, event: payload?.event, ts: new Date().toISOString() });

      return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
      console.error('Webhook error', err);
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }
  });
}
