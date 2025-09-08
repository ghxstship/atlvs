-- Billing columns and payments table for Stripe integration
-- Adds stripe_customer_id and subscription/billing state to organizations and users
-- Creates payments table for marketplace and service transactions

begin;

-- Organizations billing columns
alter table if exists public.organizations
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_plan text,
  add column if not exists billing_status text;

-- Users billing columns
alter table if exists public.users
  add column if not exists stripe_customer_id text unique;

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  type text not null check (type in ('subscription','marketplace','service')),
  status text not null default 'created',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_checkout_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Timestamps trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_payments_organization_id on public.payments(organization_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_pi_id on public.payments(stripe_payment_intent_id);

-- RLS
alter table public.payments enable row level security;

-- Select: org members can see org payments; users can see their own
drop policy if exists payments_select on public.payments;
create policy payments_select
on public.payments
for select
using (
  (organization_id is null or exists (
    select 1 from public.memberships m
    where m.organization_id = payments.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ))
  or (user_id = public.current_user_id())
);

-- Insert/Update/Delete: service role only
drop policy if exists payments_modify on public.payments;
create policy payments_modify
on public.payments
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Lookup indexes for Stripe customer ID resolution
create index if not exists idx_organizations_stripe_customer_id on public.organizations(stripe_customer_id);
create index if not exists idx_users_stripe_customer_id on public.users(stripe_customer_id);

commit;
