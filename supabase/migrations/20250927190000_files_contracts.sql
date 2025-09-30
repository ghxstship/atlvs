-- Files contracts schema (replaces deprecated pipeline contracts)
-- Provides storage for contracts managed via the Files module

create table if not exists public.files_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  type text not null check (type in ('employment','freelance','nda','vendor','service')),
  status text not null default 'draft' check (status in ('draft','sent','signed','expired','terminated')),
  start_date date not null,
  end_date date,
  value numeric,
  currency text default 'USD',
  signed_date date,
  document_url text,
  notes text,
  created_by uuid references public.users(id),
  updated_by uuid references public.users(id),
  is_demo boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists files_contracts_org_idx on public.files_contracts (organization_id);
create index if not exists files_contracts_person_idx on public.files_contracts (person_id);
create index if not exists files_contracts_project_idx on public.files_contracts (project_id);
create index if not exists files_contracts_status_idx on public.files_contracts (status);

alter table public.files_contracts enable row level security;

create policy files_contracts_read on public.files_contracts
  for select using (
    exists (
      select 1
      from public.memberships m
      where m.organization_id = files_contracts.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );

create policy files_contracts_write on public.files_contracts
  for all using (
    exists (
      select 1
      from public.memberships m
      where m.organization_id = files_contracts.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
        and m.role in ('owner','admin','manager')
    )
  ) with check (
    exists (
      select 1
      from public.memberships m
      where m.organization_id = files_contracts.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
        and m.role in ('owner','admin','manager')
    )
  );

create or replace function public.update_files_contracts_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger files_contracts_set_updated_at
  before update on public.files_contracts
  for each row execute function public.update_files_contracts_timestamp();
