-- Programming module tables: activations, call_sheets, riders
set local search_path = public;

-- Activations (programming events/setups)
create table if not exists public.activations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'planning' check (status in ('planning', 'setup', 'active', 'complete')),
  start_date timestamptz,
  end_date timestamptz,
  location_id uuid references public.locations(id) on delete set null,
  created_by uuid not null references public.users(id) default public.current_user_id(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activations_org_idx on public.activations (organization_id, created_at desc);
create index if not exists activations_project_idx on public.activations (project_id, created_at desc);

alter table public.activations enable row level security;
create policy activations_access on public.activations for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = activations.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = activations.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Call sheets (event schedules)
create table if not exists public.call_sheets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  activation_id uuid references public.activations(id) on delete set null,
  name text not null,
  event_date date not null,
  call_time time not null,
  location text not null,
  notes text,
  created_by uuid not null references public.users(id) default public.current_user_id(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists call_sheets_org_idx on public.call_sheets (organization_id, event_date desc);
create index if not exists call_sheets_activation_idx on public.call_sheets (activation_id, event_date desc);

alter table public.call_sheets enable row level security;
create policy call_sheets_access on public.call_sheets for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = call_sheets.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = call_sheets.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Riders (technical/hospitality requirements)
create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  activation_id uuid references public.activations(id) on delete set null,
  name text not null,
  type text not null default 'technical' check (type in ('technical', 'hospitality', 'security', 'other')),
  requirements text,
  notes text,
  created_by uuid not null references public.users(id) default public.current_user_id(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists riders_org_idx on public.riders (organization_id, created_at desc);
create index if not exists riders_activation_idx on public.riders (activation_id, created_at desc);

alter table public.riders enable row level security;
create policy riders_access on public.riders for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = riders.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = riders.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Updated at triggers
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_activations_updated_at on public.activations;
create trigger update_activations_updated_at
  before update on public.activations
  for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_call_sheets_updated_at on public.call_sheets;
create trigger update_call_sheets_updated_at
  before update on public.call_sheets
  for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_riders_updated_at on public.riders;
create trigger update_riders_updated_at
  before update on public.riders
  for each row execute procedure public.update_updated_at_column();
