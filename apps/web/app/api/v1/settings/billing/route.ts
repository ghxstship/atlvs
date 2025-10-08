import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import { rateLimitRequest } from '../../../../../lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) : null;

const BillingSettingsUpdateSchema = z.object({
  billingEmail: z.string().email().optional(),
  billingAddress: z.record(z.string(), z.unknown()).optional(),
  paymentMethod: z.record(z.string(), z.unknown()).optional(),
  invoiceSettings: z.record(z.string(), z.unknown()).optional()
});

type BillingSettingsUpdateInput = z.infer<typeof BillingSettingsUpdateSchema>;

type MembershipRow = {
  organization_id: string;
  role: string;
};

type OrganizationRecord = {
  id: string;
  name: string | null;
  stripe_customer_id: string | null;
};

type BillingSettingsRow = {
  id: string;
  plan_id: string | null;
  plan_name: string | null;
  billing_cycle: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  trial_end: string | null;
  seats: number | null;
  used_seats: number | null;
  billing_email: string | null;
  tax_id: string | null;
  billing_address: Record<string, unknown> | null;
  payment_method: Record<string, unknown> | null;
  invoice_settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

type BillingSettings = {
  id: string;
  planId: string | null;
  planName: string | null;
  billingCycle: string | null;
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  trialEnd: string | null;
  seats: number | null;
  usedSeats: number | null;
  billingEmail: string | null;
  taxId: string | null;
  billingAddress: Record<string, unknown> | null;
  paymentMethod: Record<string, unknown> | null;
  invoiceSettings: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
};

async function getAuthenticatedContext(req: NextRequest) {
  const rl = await rateLimitRequest(req, 'rl:settings-billing', 60, 20);
  if (!rl.success) {
    return { error: NextResponse.json({ error: 'Too many requests' }, { status: 429 }) };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single<MembershipRow>();

  if (membershipError || !membership) {
    return { error: NextResponse.json({ error: 'No active organization membership' }, { status: 403 }) };
  }

  const { organization_id: organizationId, role } = membership;

  if (!['owner', 'admin'].includes(role)) {
    return { error: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }) };
  }

  return {
    supabase,
    user,
    organizationId,
    role
  };
}

async function resolveStripeCustomer(
  admin: ReturnType<typeof createServiceRoleClient>,
  organizationId: string
): Promise<{ customerId: string | null; customerScope: 'organization' | null; organization: OrganizationRecord | null }> {
  if (!stripe) {
    return { customerId: null, customerScope: null, organization: null };
  }

  const { data: organization, error } = await admin
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .eq('id', organizationId)
    .single<OrganizationRecord>();

  if (error || !organization) {
    throw new Error('Organization not found');
  }

  let customerId: string | null = organization.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: organization.name || undefined,
      metadata: {
        scope: 'organization',
        organization_id: organization.id
      }
    });
    customerId = customer.id;
    await admin
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organization.id);
  }

  return { customerId, customerScope: 'organization', organization };
}

function mapBillingSettings(row: BillingSettingsRow | null): BillingSettings | null {
  if (!row) return null;
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    billingCycle: row.billing_cycle,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    trialEnd: row.trial_end,
    seats: row.seats,
    usedSeats: row.used_seats,
    billingEmail: row.billing_email,
    taxId: row.tax_id,
    billingAddress: row.billing_address,
    paymentMethod: row.payment_method,
    invoiceSettings: row.invoice_settings,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function fetchStripeSubscriptionSummary(customerId: string | null) {
  if (!stripe || !customerId) {
    return null;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
    limit: 5
  });

  const activeSubscription = subscriptions.data.find((sub) => sub.status === 'active') || subscriptions.data[0];

  if (!activeSubscription) {
    return null;
  }

  const item = activeSubscription.items.data[0];
  return {
    id: activeSubscription.id,
    status: activeSubscription.status,
    currentPeriodStart: new Date(activeSubscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
    interval: item?.plan?.interval || null,
    amount: item?.plan?.amount || null,
    currency: item?.plan?.currency || null,
    product: item?.plan?.product || null,
    priceId: item?.price?.id || null
  };
}

export async function GET(req: NextRequest) {
  const context = await getAuthenticatedContext(req);
  if ('error' in context) return context.error;

  const { organizationId } = context;
  const admin = createServiceRoleClient();

  const { data: billingRow } = await admin
    .from('billing_settings')
    .select(
      'id, plan_id, plan_name, billing_cycle, status, current_period_start, current_period_end, cancel_at_period_end, trial_end, seats, used_seats, billing_email, tax_id, billing_address, payment_method, invoice_settings, created_at, updated_at'
    )
    .eq('organization_id', organizationId)
    .maybeSingle<BillingSettingsRow>();

  const billingSettings = mapBillingSettings(billingRow ?? null);

  const { count: memberCount } = await admin
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  let customerId: string | null = null;
  let organization: OrganizationRecord | null = null;

  try {
    const result = await resolveStripeCustomer(admin, organizationId);
    customerId = result.customerId;
    organization = result.organization;
  } catch {
    // Swallow errors when Stripe is not configured for this org; still return billing info from Supabase.
    customerId = null;
    organization = null;
  }

  const subscription = await fetchStripeSubscriptionSummary(customerId);

  const seatUsage = {
    configuredSeats: billingSettings?.seats ?? null,
    usedSeats: memberCount ?? billingSettings?.usedSeats ?? 0
  };

  const responsePayload = {
    billingSettings,
    subscription,
    seatUsage,
    stripe: {
      configured: Boolean(stripe && customerId),
      customerId
    },
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          stripeCustomerId: organization.stripe_customer_id ?? customerId ?? null
        }
      : null
  };

  return NextResponse.json(responsePayload);
}

export async function PUT(req: NextRequest) {
  const context = await getAuthenticatedContext(req);
  if ('error' in context) return context.error;

  const { organizationId } = context;
  const admin = createServiceRoleClient();

  let body: BillingSettingsUpdateInput;
  try {
    body = BillingSettingsUpdateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (body.billingEmail !== undefined) updatePayload.billing_email = body.billingEmail;
  if (body.billingAddress !== undefined) updatePayload.billing_address = body.billingAddress;
  if (body.paymentMethod !== undefined) updatePayload.payment_method = body.paymentMethod;
  if (body.invoiceSettings !== undefined) updatePayload.invoice_settings = body.invoiceSettings;
  updatePayload.updated_at = new Date().toISOString();

  const { error } = await admin
    .from('billing_settings')
    .update(updatePayload)
    .eq('organization_id', organizationId);

  if (error) {
    return NextResponse.json({ error: 'Failed to update billing settings' }, { status: 400 });
  }

  return GET(req);
}
