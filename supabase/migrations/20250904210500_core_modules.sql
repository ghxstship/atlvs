-- Additional core modules for MVP IA coverage
-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  website text,
  rating numeric(3,2) default 0,
  created_at timestamptz not null default now()
);

-- Jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open','in_progress','blocked','done','cancelled')),
  due_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  assignee_user_id uuid references public.users(id),
  note text,
  assigned_at timestamptz not null default now()
);

create table if not exists public.job_contracts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  document_url text,
  status text not null default 'draft' check (status in ('draft','active','completed','terminated')),
  created_at timestamptz not null default now()
);

create table if not exists public.job_compliance (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  kind text not null,
  status text not null default 'pending' check (status in ('pending','submitted','approved','rejected')),
  due_at timestamptz
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open','closed','awarded','cancelled')),
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  amount numeric(14,2) not null,
  status text not null default 'submitted' check (status in ('submitted','under_review','accepted','rejected','withdrawn')),
  submitted_at timestamptz not null default now()
);

create table if not exists public.rfps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open','closed','awarded','cancelled')),
  created_at timestamptz not null default now()
);

-- Companies Contracts (general-purpose)
create table if not exists public.company_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  document_url text,
  status text not null default 'draft' check (status in ('draft','active','completed','terminated')),
  created_at timestamptz not null default now()
);

-- Procurement
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  sku text,
  unit text default 'each',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.procurement_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  vendor_company_id uuid references public.companies(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','pending','approved','ordered','fulfilled','cancelled')),
  expected_delivery date,
  total_amount numeric(14,2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.procurement_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.procurement_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0
);

-- Finance
create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  kind text not null default 'general' check (kind in ('general','bank','card','cash')),
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  vendor_company_id uuid references public.companies(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','sent','paid','void')),
  amount_due numeric(14,2) not null default 0,
  due_at date
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_id uuid not null references public.finance_accounts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  kind text not null check (kind in ('revenue','expense')),
  amount numeric(14,2) not null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null,
  amount numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  projected_spend numeric(14,2) not null default 0,
  projected_revenue numeric(14,2) not null default 0
);

-- Programming
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  kind text not null default 'performance' check (kind in ('performance','activation','workshop')),
  starts_at timestamptz,
  ends_at timestamptz
);

create table if not exists public.call_sheets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  call_date date not null,
  details jsonb default '{}'::jsonb
);

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  performer text not null,
  stage text,
  starts_at timestamptz,
  ends_at timestamptz
);

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  kind text not null default 'technical' check (kind in ('technical','hospitality','stage_plot')),
  details jsonb default '{}'::jsonb
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  kind text not null default 'room' check (kind in ('room','green_room','dressing_room','meeting_room','classroom','other')),
  capacity integer
);

-- Pipeline
create table if not exists public.manning_slots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null,
  required_count integer not null default 1,
  needed_on date,
  filled_count integer not null default 0
);

create table if not exists public.advancing_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  description text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','done','blocked'))
);

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  required boolean not null default false
);

create table if not exists public.training_attendance (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  required boolean not null default true
);

create table if not exists public.onboarding_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.onboarding_tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','waived')),
  completed_at timestamptz
);

create table if not exists public.contractor_agreements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  document_url text,
  status text not null default 'draft' check (status in ('draft','active','completed','terminated')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;
alter table public.job_contracts enable row level security;
alter table public.job_compliance enable row level security;
alter table public.opportunities enable row level security;
alter table public.bids enable row level security;
alter table public.rfps enable row level security;
alter table public.company_contracts enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.procurement_orders enable row level security;
alter table public.procurement_order_items enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.invoices enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.forecasts enable row level security;
alter table public.events enable row level security;
alter table public.call_sheets enable row level security;
alter table public.lineups enable row level security;
alter table public.riders enable row level security;
alter table public.spaces enable row level security;
alter table public.manning_slots enable row level security;
alter table public.advancing_items enable row level security;
alter table public.trainings enable row level security;
alter table public.training_attendance enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.onboarding_assignments enable row level security;
alter table public.contractor_agreements enable row level security;

-- Policies (org-scoped tables): org members can select and modify
create policy org_tables_read on public.companies for select using (
  exists (select 1 from public.memberships m where m.organization_id = companies.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy org_tables_cud on public.companies for all using (
  exists (select 1 from public.memberships m where m.organization_id = companies.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = companies.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

-- Apply same pattern to other org-scoped tables
create policy products_read on public.products for select using (
  exists (select 1 from public.memberships m where m.organization_id = products.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy products_cud on public.products for all using (
  exists (select 1 from public.memberships m where m.organization_id = products.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = products.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy services_read on public.services for select using (
  exists (select 1 from public.memberships m where m.organization_id = services.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy services_cud on public.services for all using (
  exists (select 1 from public.memberships m where m.organization_id = services.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = services.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy finance_accounts_read on public.finance_accounts for select using (
  exists (select 1 from public.memberships m where m.organization_id = finance_accounts.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy finance_accounts_cud on public.finance_accounts for all using (
  exists (select 1 from public.memberships m where m.organization_id = finance_accounts.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = finance_accounts.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy invoices_read on public.invoices for select using (
  exists (select 1 from public.memberships m where m.organization_id = invoices.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy invoices_cud on public.invoices for all using (
  exists (select 1 from public.memberships m where m.organization_id = invoices.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = invoices.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy finance_transactions_read on public.finance_transactions for select using (
  exists (select 1 from public.memberships m where m.organization_id = finance_transactions.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy finance_transactions_cud on public.finance_transactions for all using (
  exists (select 1 from public.memberships m where m.organization_id = finance_transactions.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = finance_transactions.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

-- Project-scoped tables: authorize via project's organization
create policy jobs_read on public.jobs for select using (
  exists (select 1 from public.memberships m where m.organization_id = jobs.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy jobs_cud on public.jobs for all using (
  exists (select 1 from public.memberships m where m.organization_id = jobs.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = jobs.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy job_assignments_access on public.job_assignments for all using (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_assignments.job_id)
) with check (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_assignments.job_id)
);

create policy job_contracts_access on public.job_contracts for all using (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_contracts.job_id)
) with check (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_contracts.job_id)
);

create policy job_compliance_access on public.job_compliance for all using (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_compliance.job_id)
) with check (
  exists (select 1 from public.jobs j join public.memberships m on m.organization_id = j.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where j.id = job_compliance.job_id)
);

create policy opportunities_read on public.opportunities for select using (
  exists (select 1 from public.memberships m where m.organization_id = opportunities.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy opportunities_cud on public.opportunities for all using (
  exists (select 1 from public.memberships m where m.organization_id = opportunities.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = opportunities.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy bids_access on public.bids for all using (
  exists (select 1 from public.opportunities o join public.memberships m on m.organization_id = o.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where o.id = bids.opportunity_id)
) with check (
  exists (select 1 from public.opportunities o join public.memberships m on m.organization_id = o.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where o.id = bids.opportunity_id)
);

create policy rfps_read on public.rfps for select using (
  exists (select 1 from public.memberships m where m.organization_id = rfps.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);
create policy rfps_cud on public.rfps for all using (
  exists (select 1 from public.memberships m where m.organization_id = rfps.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = rfps.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

-- Project-scoped via project_id
create policy project_tables_events_access on public.events for all using (
  exists (select 1 from public.projects p join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where p.id = events.project_id)
) with check (
  exists (select 1 from public.projects p join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where p.id = events.project_id)
);

create policy call_sheets_access on public.call_sheets for all using (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = call_sheets.event_id)
) with check (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = call_sheets.event_id)
);

create policy lineups_access on public.lineups for all using (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = lineups.event_id)
) with check (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = lineups.event_id)
);

create policy riders_access on public.riders for all using (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = riders.event_id)
) with check (
  exists (select 1 from public.events e join public.projects p on p.id = e.project_id join public.memberships m on m.organization_id = p.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where e.id = riders.event_id)
);

create policy spaces_access on public.spaces for all using (
  exists (select 1 from public.memberships m where m.organization_id = spaces.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = spaces.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy procurement_orders_access on public.procurement_orders for all using (
  exists (select 1 from public.memberships m where m.organization_id = procurement_orders.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
) with check (
  exists (select 1 from public.memberships m where m.organization_id = procurement_orders.organization_id and m.user_id = public.current_user_id() and m.status = 'active')
);

create policy procurement_order_items_access on public.procurement_order_items for all using (
  exists (select 1 from public.procurement_orders o join public.memberships m on m.organization_id = o.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where o.id = procurement_order_items.order_id)
) with check (
  exists (select 1 from public.procurement_orders o join public.memberships m on m.organization_id = o.organization_id and m.user_id = public.current_user_id() and m.status = 'active' where o.id = procurement_order_items.order_id)
);
