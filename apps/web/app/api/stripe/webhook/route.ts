import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceRoleClient } from '@ghxstship/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';

// Strongly recommended to set these in Vercel Project Env Vars
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

export async function POST(req: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (e) {
    return NextResponse.json({ error: 'Unable to read request body' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err?.message ?? 'Unknown error'}` }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Record payment if applicable
        const amount = (session.amount_total ?? 0);
        const currency = session.currency ?? 'usd';
        const customer = session.customer as string | null;
        if (amount && customer) {
          // Resolve scope from customer id
          const { data: org } = await admin
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customer)
            .single();
          const { data: usr } = !org ? await admin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customer)
            .single() : { data: null } as any;

          await admin.from('payments').insert({
            organization_id: org?.id ?? null,
            user_id: usr?.id ?? null,
            amount_cents: amount,
            currency,
            type: session.mode === 'subscription' ? 'subscription' : 'marketplace',
            status: 'succeeded',
            stripe_checkout_session_id: session.id,
            metadata: session.metadata ?? {}
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const amount = invoice.amount_paid ?? 0;
        const currency = invoice.currency ?? 'usd';
        const customer = (invoice.customer as string) ?? null;
        const payment_intent = invoice.payment_intent as string | null;

        if (customer && amount) {
          const { data: org } = await admin
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customer)
            .single();
          const { data: usr } = !org ? await admin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customer)
            .single() : { data: null } as any;

          await admin.from('payments').insert({
            organization_id: org?.id ?? null,
            user_id: usr?.id ?? null,
            amount_cents: amount,
            currency,
            type: 'subscription',
            status: 'succeeded',
            stripe_payment_intent_id: payment_intent,
            metadata: { invoice_id: invoice.id }
          });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = subscription.customer as string;
        const status = subscription.status;
        const priceId = subscription.items?.data?.[0]?.price?.id || null;

        const PRICE_INDIVIDUAL = process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL;
        const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
        const PRICE_TEAM = process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM;
        let billing_plan: string | null = null;
        if (priceId) {
          if (priceId === PRICE_TEAM) billing_plan = 'team';
          else if (priceId === PRICE_PRO) billing_plan = 'pro';
          else if (priceId === PRICE_INDIVIDUAL) billing_plan = 'individual';
        }

        // Try organization first, then user
        const { data: org } = await admin
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customer)
          .single();
        if (org) {
          await admin
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
              billing_status: status,
              ...(billing_plan ? { billing_plan } : {})
            })
            .eq('id', org.id);

          // Set entitlements based on plan
          if (billing_plan) {
            if (billing_plan === 'team') {
              await admin
                .from('organization_entitlements')
                .upsert(
                  {
                    organization_id: org.id,
                    feature_opendeck: true,
                    feature_atlvs: true,
                    feature_ghxstship: false,
                    seat_policy: 'domain-unlimited'
                  },
                  { onConflict: 'organization_id' }
                );
            } else if (billing_plan === 'pro') {
              await admin
                .from('organization_entitlements')
                .upsert(
                  {
                    organization_id: org.id,
                    feature_opendeck: true,
                    feature_atlvs: true,
                    feature_ghxstship: false,
                    seat_policy: 'user'
                  },
                  { onConflict: 'organization_id' }
                );
            } else if (billing_plan === 'individual') {
              // Individual plan is user-scoped, but if an org has it we keep minimal entitlements
              await admin
                .from('organization_entitlements')
                .upsert(
                  {
                    organization_id: org.id,
                    feature_opendeck: true,
                    feature_atlvs: false,
                    feature_ghxstship: false,
                    seat_policy: 'user'
                  },
                  { onConflict: 'organization_id' }
                );
            }
          }
        } else {
          const { data: usr } = await admin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customer)
            .single();
          if (usr) {
            // For users, we can store subscription id/status in payments or a user-level status; keep minimal here
            await admin.from('payments').insert({
              user_id: usr.id,
              amount_cents: 0,
              currency: 'usd',
              type: 'subscription',
              status: status,
              metadata: { subscription_id: subscription.id }
            });

            // User entitlements based on plan
            if (billing_plan === 'pro') {
              await admin
                .from('user_entitlements')
                .upsert(
                  {
                    user_id: usr.id,
                    feature_opendeck: true,
                    feature_atlvs: true,
                    feature_ghxstship: false
                  },
                  { onConflict: 'user_id' }
                );
            } else if (billing_plan === 'individual') {
              await admin
                .from('user_entitlements')
                .upsert(
                  {
                    user_id: usr.id,
                    feature_opendeck: true,
                    feature_atlvs: false,
                    feature_ghxstship: false
                  },
                  { onConflict: 'user_id' }
                );
            }
          }
        }
        break;
      }
      default: {
        // No-op for unhandled events
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook handler error', message: err?.message }, { status: 500 });
  }
}
