-- Organization domains for Team unlimited seats by email domain
begin;

create table if not exists public.organization_domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  status text not null default 'active' check (status in ('active','pending','removed')),
  created_at timestamptz not null default now(),
  unique (organization_id, domain),
  check (domain = lower(domain))
);

create index if not exists idx_org_domains_org_id on public.organization_domains(organization_id);
create index if not exists idx_org_domains_domain on public.organization_domains(domain);

alter table public.organization_domains enable row level security;

-- Members can read org domains
drop policy if exists org_domains_select on public.organization_domains;
create policy org_domains_select on public.organization_domains
for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organization_domains.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Owners/Admins can modify org domains
drop policy if exists org_domains_modify on public.organization_domains;
create policy org_domains_modify on public.organization_domains
for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organization_domains.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organization_domains.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  )
);

commit;
