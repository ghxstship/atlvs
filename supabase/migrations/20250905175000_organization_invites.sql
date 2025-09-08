begin;

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  role text not null check (role in ('owner','admin','manager','contributor','viewer')),
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index if not exists idx_org_invites_org_id on public.organization_invites(organization_id);
create index if not exists idx_org_invites_email on public.organization_invites(email);

alter table public.organization_invites enable row level security;

-- Members (owner/admin) can read invites for their org
drop policy if exists org_invites_select on public.organization_invites;
create policy org_invites_select on public.organization_invites
for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
);

-- Owners/Admins can modify invites; service_role may also modify
drop policy if exists org_invites_modify on public.organization_invites;
create policy org_invites_modify on public.organization_invites
for all using (
  auth.role() = 'service_role' or exists (
    select 1 from public.memberships m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
) with check (
  auth.role() = 'service_role' or exists (
    select 1 from public.memberships m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
);

commit;
