-- Programs
create table if not exists public.programs (
  id uuid primary key,
  organization_id uuid not null,
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists programs_org_idx on public.programs (organization_id);

alter table public.programs enable row level security;
create policy programs_no_select on public.programs for select using (false);
create policy programs_service_write on public.programs for all to service_role using (true) with check (true);

-- Pipeline stages
create table if not exists public.pipeline_stages (
  id uuid primary key,
  organization_id uuid not null,
  name text not null,
  "order" int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pipeline_stages_org_idx on public.pipeline_stages (organization_id);

alter table public.pipeline_stages enable row level security;
create policy pipeline_stages_no_select on public.pipeline_stages for select using (false);
create policy pipeline_stages_service_write on public.pipeline_stages for all to service_role using (true) with check (true);

-- Purchase orders
create table if not exists public.purchase_orders (
  id uuid primary key,
  organization_id uuid not null,
  vendor text not null,
  total numeric not null,
  currency text not null,
  status text not null check (status in ('draft','approved','sent','received','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists po_org_idx on public.purchase_orders (organization_id);
create index if not exists po_status_idx on public.purchase_orders (status);

alter table public.purchase_orders enable row level security;
create policy po_no_select on public.purchase_orders for select using (false);
create policy po_service_write on public.purchase_orders for all to service_role using (true) with check (true);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key,
  organization_id uuid not null,
  amount numeric not null,
  currency text not null,
  status text not null check (status in ('draft','issued','paid','overdue','void')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_org_idx on public.invoices (organization_id);
create index if not exists invoices_status_idx on public.invoices (status);

alter table public.invoices enable row level security;
create policy invoices_no_select on public.invoices for select using (false);
create policy invoices_service_write on public.invoices for all to service_role using (true) with check (true);

-- Jobs
create table if not exists public.jobs (
  id uuid primary key,
  organization_id uuid not null,
  title text not null,
  status text not null check (status in ('draft','open','in_progress','completed','cancelled')),
  rfp_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_org_idx on public.jobs (organization_id);
create index if not exists jobs_status_idx on public.jobs (status);

alter table public.jobs enable row level security;
create policy jobs_no_select on public.jobs for select using (false);
create policy jobs_service_write on public.jobs for all to service_role using (true) with check (true);

-- Reports
create table if not exists public.reports (
  id uuid primary key,
  organization_id uuid not null,
  name text not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reports_org_idx on public.reports (organization_id);

alter table public.reports enable row level security;
create policy reports_no_select on public.reports for select using (false);
create policy reports_service_write on public.reports for all to service_role using (true) with check (true);

-- Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_programs_updated_at before update on public.programs for each row execute procedure public.set_updated_at();
create trigger set_pipeline_stages_updated_at before update on public.pipeline_stages for each row execute procedure public.set_updated_at();
create trigger set_po_updated_at before update on public.purchase_orders for each row execute procedure public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute procedure public.set_updated_at();
create trigger set_jobs_updated_at before update on public.jobs for each row execute procedure public.set_updated_at();
create trigger set_reports_updated_at before update on public.reports for each row execute procedure public.set_updated_at();
