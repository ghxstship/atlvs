-- Add version columns for optimistic concurrency control
-- This migration adds version columns to tables that may have concurrent edits

-- Projects table
alter table public.projects
  add column if not exists version integer not null default 1;

-- Project tasks
alter table public.project_tasks
  add column if not exists version integer not null default 1;

-- Jobs
alter table public.jobs
  add column if not exists version integer not null default 1;

-- People (profiles)
alter table public.people
  add column if not exists version integer not null default 1;

-- Companies
alter table public.companies
  add column if not exists version integer not null default 1;

-- Purchase orders
alter table public.purchase_orders
  add column if not exists version integer not null default 1;

-- Finance accounts
alter table public.finance_accounts
  add column if not exists version integer not null default 1;

-- Programming events
alter table public.programming_events
  add column if not exists version integer not null default 1;

-- Create function for optimistic locking
create or replace function increment_version()
returns trigger as $$
begin
  new.version = old.version + 1;
  return new;
end;
$$ language plpgsql;

-- Create triggers for version increment on update
create trigger projects_version_increment
  before update on public.projects
  for each row execute procedure increment_version();

create trigger project_tasks_version_increment
  before update on public.project_tasks
  for each row execute procedure increment_version();

create trigger jobs_version_increment
  before update on public.jobs
  for each row execute procedure increment_version();

create trigger people_version_increment
  before update on public.people
  for each row execute procedure increment_version();

create trigger companies_version_increment
  before update on public.companies
  for each row execute procedure increment_version();

create trigger purchase_orders_version_increment
  before update on public.purchase_orders
  for each row execute procedure increment_version();

create trigger finance_accounts_version_increment
  before update on public.finance_accounts
  for each row execute procedure increment_version();

create trigger programming_events_version_increment
  before update on public.programming_events
  for each row execute procedure increment_version();

-- Add indexes for version columns
create index if not exists projects_version_idx on public.projects (version);
create index if not exists project_tasks_version_idx on public.project_tasks (version);
create index if not exists jobs_version_idx on public.jobs (version);
create index if not exists people_version_idx on public.people (version);
create index if not exists companies_version_idx on public.companies (version);
create index if not exists purchase_orders_version_idx on public.purchase_orders (version);
create index if not exists finance_accounts_version_idx on public.finance_accounts (version);
create index if not exists programming_events_version_idx on public.programming_events (version);
