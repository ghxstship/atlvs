begin;

-- Organization entitlements
create table if not exists public.organization_entitlements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  feature_opendeck boolean not null default true,
  feature_atlvs boolean not null default false,
  feature_ghxstship boolean not null default false,
  seat_policy text not null default 'user' check (seat_policy in ('user','domain-unlimited')),
  seats_limit integer,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_org_entitlements_org_id on public.organization_entitlements(organization_id);

alter table public.organization_entitlements enable row level security;

-- Org members can read entitlements
drop policy if exists org_entitlements_select on public.organization_entitlements;
create policy org_entitlements_select on public.organization_entitlements
for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organization_entitlements.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Owners/Admins can modify entitlements (service_role may also modify)
drop policy if exists org_entitlements_modify on public.organization_entitlements;
create policy org_entitlements_modify on public.organization_entitlements
for all using (
  auth.role() = 'service_role' or exists (
    select 1 from public.memberships m
    where m.organization_id = organization_entitlements.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
) with check (
  auth.role() = 'service_role' or exists (
    select 1 from public.memberships m
    where m.organization_id = organization_entitlements.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
);

-- User entitlements for individual plans
create table if not exists public.user_entitlements (
  user_id uuid primary key references public.users(id) on delete cascade,
  feature_opendeck boolean not null default true,
  feature_atlvs boolean not null default false,
  feature_ghxstship boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

drop policy if exists user_entitlements_select on public.user_entitlements;
create policy user_entitlements_select on public.user_entitlements
for select using (user_id = public.current_user_id());

drop policy if exists user_entitlements_modify on public.user_entitlements;
create policy user_entitlements_modify on public.user_entitlements
for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());

commit;
