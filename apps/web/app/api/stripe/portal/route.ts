import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import Stripe from 'stripe';
import { rateLimitRequest } from '../../../_components/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(req: NextRequest) {
  // Rate limit: 10 req/min per client
  const rl = await rateLimitRequest(req, 'rl:stripe-portal', 60, 10);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { organizationId, userId, return_url } = payload || {};
  if (!organizationId && !userId) {
    return NextResponse.json({ error: 'Must provide organizationId or userId' }, { status: 400 });
  }

  // SSR auth: ensure caller is permitted
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

  // Validate org membership if organizationId is provided
  if (organizationId) {
    const { data: member } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createServiceRoleClient();

  // Find or create a Stripe customer for the target scope
  let customerId: string | null = null;
  if (organizationId) {
    const { data: org } = await admin
      .from('organizations')
      .select('id, name, stripe_customer_id')
      .eq('id', organizationId)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    customerId = (org as any).stripe_customer_id ?? null;
    if (!customerId) {
      const cust = await stripe.customers.create({
        name: (org as any).name || undefined,
        metadata: { scope: 'organization', organization_id: (org as any).id }
      });
      customerId = cust.id;
      await admin
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', (org as any).id);
    }
  } else if (userId) {
    const { data: u } = await admin
      .from('users')
      .select('id, email, full_name, stripe_customer_id')
      .eq('id', userId)
      .single();
    if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((u as any).id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    customerId = (u as any).stripe_customer_id ?? null;
    if (!customerId) {
      const cust = await stripe.customers.create({
        email: (u as any).email || undefined,
        name: (u as any).full_name || undefined,
        metadata: { scope: 'user', user_id: (u as any).id }
      });
      customerId = cust.id;
      await admin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', (u as any).id);
    }
  }

  if (!customerId) return NextResponse.json({ error: 'Unable to resolve customer' }, { status: 500 });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: return_url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/settings/billing`
  });

  return NextResponse.json({ url: session.url });
}
