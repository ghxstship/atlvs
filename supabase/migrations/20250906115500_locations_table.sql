-- Locations table (required for programming module)
set local search_path = public;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  address text,
  coordinates point,
  capacity integer,
  notes text,
  created_by uuid not null references public.users(id) default public.current_user_id(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists locations_org_idx on public.locations (organization_id, created_at desc);
create index if not exists locations_project_idx on public.locations (project_id, created_at desc);

alter table public.locations enable row level security;
create policy locations_access on public.locations for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = locations.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = locations.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Updated at trigger
drop trigger if exists update_locations_updated_at on public.locations;
create trigger update_locations_updated_at
  before update on public.locations
  for each row execute procedure public.update_updated_at_column();
