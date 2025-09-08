-- Core schema for multitenant ATLVS + OPENDECK (subset for MVP)
create extension if not exists pgcrypto;

-- organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- users (profile) references auth.users
create table if not exists public.users (
  id uuid primary key,
  auth_id uuid not null unique,
  full_name text,
  preferred_locale text default 'en',
  timezone text default 'UTC',
  created_at timestamptz not null default now()
);

-- memberships
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','contributor','viewer')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

-- projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  status text not null default 'planning',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'todo',
  assignee_id uuid references public.users(id),
  due_at timestamptz,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS enable
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- Helper functions (auth uid mapping)
create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select u.id from public.users u where u.auth_id = auth.uid();
$$;

-- Policies
-- Users: self profile only
create policy users_select_self on public.users
  for select using (id = public.current_user_id());
create policy users_update_self on public.users
  for update using (id = public.current_user_id());

-- Organizations: members can read
create policy org_members_read on public.organizations
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = organizations.id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

-- Memberships: user can read own memberships
create policy memberships_read_self on public.memberships
  for select using (user_id = public.current_user_id());

-- Projects: org members read; creator insert; org members update
create policy projects_read on public.projects
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = projects.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));
create policy projects_insert on public.projects
  for insert with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = projects.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    ) and created_by = public.current_user_id()
  );
create policy projects_update on public.projects
  for update using (exists (
    select 1 from public.memberships m
    where m.organization_id = projects.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));

-- Tasks: org members read/write within project org
create policy tasks_read on public.tasks
  for select using (exists (
    select 1 from public.memberships m
    where m.organization_id = tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));
create policy tasks_cud on public.tasks
  for all using (exists (
    select 1 from public.memberships m
    where m.organization_id = tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )) with check (exists (
    select 1 from public.memberships m
    where m.organization_id = tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  ));
