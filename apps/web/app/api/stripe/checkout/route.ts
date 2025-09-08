import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import Stripe from 'stripe';
import { rateLimitRequest } from '../../../lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(req: NextRequest) {
  // Rate limit: 15 req/min per client
  const rl = await rateLimitRequest(req, 'rl:stripe-checkout', 60, 15);
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { priceId, quantity = 1, mode = 'subscription', organizationId, userId, metadata = {} } = payload as {
    priceId: string; quantity?: number; mode?: 'subscription' | 'payment'; organizationId?: string; userId?: string; metadata?: Record<string, string>;
  };

  if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
  if (!organizationId && !userId) return NextResponse.json({ error: 'Must provide organizationId or userId' }, { status: 400 });

  // SSR auth
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let effectiveUserId = userId === 'me' || (!organizationId && !userId) ? user.id : userId;

  if (organizationId) {
    const { data: member } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Resolve or create customer
  const admin = createServiceRoleClient();
  let customerId: string | null = null;
  let customerMetadata: Record<string, string> = {};

  if (organizationId) {
    const { data: org } = await admin
      .from('organizations')
      .select('id, name, stripe_customer_id')
      .eq('id', organizationId)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    customerId = (org as any).stripe_customer_id ?? null;
    customerMetadata = { scope: 'organization', organization_id: (org as any).id };
    if (!customerId) {
      const cust = await stripe.customers.create({ name: (org as any).name || undefined, metadata: customerMetadata });
      customerId = cust.id;
      await admin.from('organizations').update({ stripe_customer_id: customerId }).eq('id', (org as any).id);
    }
  } else if (effectiveUserId) {
    const { data: u } = await admin
      .from('users')
      .select('id, email, full_name, stripe_customer_id')
      .eq('id', effectiveUserId)
      .single();
    if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((u as any).id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    customerId = (u as any).stripe_customer_id ?? null;
    customerMetadata = { scope: 'user', user_id: (u as any).id };
    if (!customerId) {
      const cust = await stripe.customers.create({
        email: (u as any).email || undefined,
        name: (u as any).full_name || undefined,
        metadata: customerMetadata,
      });
      customerId = cust.id;
      await admin.from('users').update({ stripe_customer_id: customerId }).eq('id', (u as any).id);
    }
  }

  if (!customerId) return NextResponse.json({ error: 'Unable to resolve customer' }, { status: 500 });

  const session = await stripe.checkout.sessions.create({
    mode,
    customer: customerId,
    line_items: [{ price: priceId, quantity }],
    success_url: `${APP_URL}/settings/billing?success=1`,
    cancel_url: `${APP_URL}/settings/billing?canceled=1`,
    metadata: { ...customerMetadata, ...metadata },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
