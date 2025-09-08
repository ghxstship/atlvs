-- People module tables and policies
-- Core people management with HR features

-- People table
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role text,
  department text,
  location text,
  start_date date,
  end_date date,
  skills text[],
  bio text,
  status text not null default 'active' check (status in ('active','inactive','terminated')),
  avatar_url text,
  created_by uuid references public.users(id),
  is_demo boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Roles table
create table if not exists public.people_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  permissions text[],
  level text check (level in ('entry','mid','senior','lead','executive')),
  department text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, name)
);

-- Competencies table
create table if not exists public.people_competencies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  category text,
  level_definitions jsonb, -- {beginner: "desc", intermediate: "desc", advanced: "desc", expert: "desc"}
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, name)
);

-- Person competencies (skills assessment)
create table if not exists public.person_competencies (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  competency_id uuid not null references public.people_competencies(id) on delete cascade,
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  assessed_by uuid references public.users(id),
  assessed_at timestamptz default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(person_id, competency_id)
);

-- Endorsements table
create table if not exists public.people_endorsements (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  endorser_id uuid not null references public.people(id) on delete cascade,
  competency_id uuid references public.people_competencies(id) on delete set null,
  message text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(person_id, endorser_id, competency_id)
);

-- Shortlists table
create table if not exists public.people_shortlists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  project_id uuid references public.projects(id) on delete set null,
  role_id uuid references public.people_roles(id) on delete set null,
  status text not null default 'active' check (status in ('active','closed','archived')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shortlist members
create table if not exists public.shortlist_members (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references public.people_shortlists(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  status text not null default 'candidate' check (status in ('candidate','interviewed','selected','rejected')),
  notes text,
  added_by uuid references public.users(id),
  added_at timestamptz not null default now(),
  unique(shortlist_id, person_id)
);

-- Network connections
create table if not exists public.people_network (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  connected_person_id uuid not null references public.people(id) on delete cascade,
  relationship_type text check (relationship_type in ('colleague','mentor','mentee','collaborator','friend')),
  strength integer check (strength >= 1 and strength <= 5) default 3,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(person_id, connected_person_id),
  check (person_id != connected_person_id)
);

-- Indexes for performance
create index if not exists people_org_idx on public.people (organization_id);
create index if not exists people_status_idx on public.people (status);
create index if not exists people_department_idx on public.people (department);
create index if not exists people_role_idx on public.people (role);
create index if not exists people_email_idx on public.people (email);

create index if not exists people_roles_org_idx on public.people_roles (organization_id);
create index if not exists people_competencies_org_idx on public.people_competencies (organization_id);
create index if not exists person_competencies_person_idx on public.person_competencies (person_id);
create index if not exists people_endorsements_person_idx on public.people_endorsements (person_id);
create index if not exists people_shortlists_org_idx on public.people_shortlists (organization_id);
create index if not exists shortlist_members_shortlist_idx on public.shortlist_members (shortlist_id);
create index if not exists people_network_person_idx on public.people_network (person_id);

-- Enable RLS
alter table public.people enable row level security;
alter table public.people_roles enable row level security;
alter table public.people_competencies enable row level security;
alter table public.person_competencies enable row level security;
alter table public.people_endorsements enable row level security;
alter table public.people_shortlists enable row level security;
alter table public.shortlist_members enable row level security;
alter table public.people_network enable row level security;

-- RLS Policies for people
create policy people_org_members_read on public.people
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = people.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_org_members_insert on public.people
  for insert with check (exists (
    select 1 from public.memberships m
    where m.organization_id = people.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

create policy people_org_members_update on public.people
  for update using (exists (
    select 1 from public.memberships m
    where m.organization_id = people.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

create policy people_org_members_delete on public.people
  for delete using (exists (
    select 1 from public.memberships m
    where m.organization_id = people.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin')
  ));

-- RLS Policies for people_roles
create policy people_roles_org_members_read on public.people_roles
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_roles.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_roles_org_admin_write on public.people_roles
  for all using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_roles.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

-- RLS Policies for people_competencies
create policy people_competencies_org_members_read on public.people_competencies
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_competencies.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_competencies_org_admin_write on public.people_competencies
  for all using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_competencies.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

-- RLS Policies for person_competencies
create policy person_competencies_org_members_read on public.person_competencies
  for select using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = person_competencies.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy person_competencies_org_members_write on public.person_competencies
  for all using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = person_competencies.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

-- RLS Policies for people_endorsements
create policy people_endorsements_org_members_read on public.people_endorsements
  for select using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = people_endorsements.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_endorsements_org_members_write on public.people_endorsements
  for all using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = people_endorsements.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

-- RLS Policies for people_shortlists
create policy people_shortlists_org_members_read on public.people_shortlists
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_shortlists.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_shortlists_org_members_write on public.people_shortlists
  for all using (exists (
    select 1 from public.memberships m
    where m.organization_id = people_shortlists.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

-- RLS Policies for shortlist_members
create policy shortlist_members_org_members_read on public.shortlist_members
  for select using (exists (
    select 1 from public.people_shortlists s
    join public.memberships m on m.organization_id = s.organization_id
    where s.id = shortlist_members.shortlist_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy shortlist_members_org_members_write on public.shortlist_members
  for all using (exists (
    select 1 from public.people_shortlists s
    join public.memberships m on m.organization_id = s.organization_id
    where s.id = shortlist_members.shortlist_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
      and m.role in ('owner','admin','manager')
  ));

-- RLS Policies for people_network
create policy people_network_org_members_read on public.people_network
  for select using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = people_network.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

create policy people_network_org_members_write on public.people_network
  for all using (exists (
    select 1 from public.people p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = people_network.person_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

-- Trigger for updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger people_updated_at before update on public.people
  for each row execute function public.update_updated_at_column();

create trigger people_roles_updated_at before update on public.people_roles
  for each row execute function public.update_updated_at_column();

create trigger people_competencies_updated_at before update on public.people_competencies
  for each row execute function public.update_updated_at_column();

create trigger person_competencies_updated_at before update on public.person_competencies
  for each row execute function public.update_updated_at_column();

create trigger people_endorsements_updated_at before update on public.people_endorsements
  for each row execute function public.update_updated_at_column();

create trigger people_shortlists_updated_at before update on public.people_shortlists
  for each row execute function public.update_updated_at_column();

create trigger people_network_updated_at before update on public.people_network
  for each row execute function public.update_updated_at_column();
