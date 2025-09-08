-- Complete Finance module database schema
-- Adding missing tables for expenses and revenue

-- Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  budget_id uuid references public.budgets(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null,
  currency text not null default 'USD',
  category text not null,
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected','paid')),
  receipt_url text,
  submitted_by uuid references public.users(id),
  approved_by uuid references public.users(id),
  submitted_at timestamptz,
  approved_at timestamptz,
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Revenue table
create table if not exists public.revenue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null,
  currency text not null default 'USD',
  source text not null,
  status text not null default 'projected' check (status in ('projected','invoiced','received','cancelled')),
  recognition_date date,
  received_date date,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Update budgets table to include organization_id and additional fields
alter table public.budgets 
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists spent numeric(14,2) default 0,
  add column if not exists currency text default 'USD',
  add column if not exists status text default 'active' check (status in ('active','inactive','completed')),
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists updated_at timestamptz default now();

-- Update forecasts table to include organization_id and additional fields
alter table public.forecasts 
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists projected_amount numeric(14,2) default 0,
  add column if not exists actual_amount numeric(14,2) default 0,
  add column if not exists variance numeric(14,2) default 0,
  add column if not exists confidence_level text default 'medium' check (confidence_level in ('low','medium','high')),
  add column if not exists forecast_date date not null default current_date,
  add column if not exists created_by uuid references public.users(id),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Update finance_accounts table to include additional fields
alter table public.finance_accounts 
  add column if not exists description text,
  add column if not exists balance numeric(14,2) default 0,
  add column if not exists currency text default 'USD',
  add column if not exists status text default 'active' check (status in ('active','inactive','closed')),
  add column if not exists bank_name text,
  add column if not exists account_number text,
  add column if not exists routing_number text,
  add column if not exists updated_at timestamptz default now();

-- Update finance_transactions table to include additional fields
alter table public.finance_transactions 
  add column if not exists description text,
  add column if not exists reference_number text,
  add column if not exists status text default 'completed' check (status in ('pending','completed','failed','cancelled')),
  add column if not exists currency text default 'USD',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Update invoices table to include additional fields from enterprise module
alter table public.invoices 
  add column if not exists invoice_number text,
  add column if not exists description text,
  add column if not exists line_items jsonb default '[]'::jsonb,
  add column if not exists tax_amount numeric(14,2) default 0,
  add column if not exists discount_amount numeric(14,2) default 0,
  add column if not exists total_amount numeric(14,2),
  add column if not exists currency text default 'USD',
  add column if not exists purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  add column if not exists client_company_id uuid references public.companies(id) on delete set null,
  add column if not exists issued_date date,
  add column if not exists paid_date date,
  add column if not exists notes text;

-- Create indexes for performance
create index if not exists expenses_org_idx on public.expenses (organization_id);
create index if not exists expenses_project_idx on public.expenses (project_id);
create index if not exists expenses_status_idx on public.expenses (status);
create index if not exists expenses_date_idx on public.expenses (expense_date);

create index if not exists revenue_org_idx on public.revenue (organization_id);
create index if not exists revenue_project_idx on public.revenue (project_id);
create index if not exists revenue_status_idx on public.revenue (status);
create index if not exists revenue_date_idx on public.revenue (recognition_date);

create index if not exists budgets_org_idx on public.budgets (organization_id);
create index if not exists budgets_project_idx on public.budgets (project_id);
create index if not exists budgets_status_idx on public.budgets (status);

create index if not exists forecasts_org_idx on public.forecasts (organization_id);
create index if not exists forecasts_project_idx on public.forecasts (project_id);
create index if not exists forecasts_date_idx on public.forecasts (forecast_date);

create index if not exists finance_accounts_org_idx on public.finance_accounts (organization_id);
create index if not exists finance_accounts_status_idx on public.finance_accounts (status);

create index if not exists finance_transactions_org_idx on public.finance_transactions (organization_id);
create index if not exists finance_transactions_account_idx on public.finance_transactions (account_id);
create index if not exists finance_transactions_date_idx on public.finance_transactions (occurred_at);

create index if not exists invoices_org_idx on public.invoices (organization_id);
create index if not exists invoices_project_idx on public.invoices (project_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_due_date_idx on public.invoices (due_at);

-- Enable RLS on all finance tables
alter table public.expenses enable row level security;
alter table public.revenue enable row level security;

-- Create RLS policies for expenses
create policy expenses_no_select on public.expenses for select using (false);
create policy expenses_service_write on public.expenses for all to service_role using (true) with check (true);

-- Create RLS policies for revenue
create policy revenue_no_select on public.revenue for select using (false);
create policy revenue_service_write on public.revenue for all to service_role using (true) with check (true);

-- Update RLS policies for updated tables
drop policy if exists budgets_no_select on public.budgets;
drop policy if exists budgets_service_write on public.budgets;
create policy budgets_no_select on public.budgets for select using (false);
create policy budgets_service_write on public.budgets for all to service_role using (true) with check (true);

drop policy if exists forecasts_no_select on public.forecasts;
drop policy if exists forecasts_service_write on public.forecasts;
create policy forecasts_no_select on public.forecasts for select using (false);
create policy forecasts_service_write on public.forecasts for all to service_role using (true) with check (true);

drop policy if exists finance_accounts_no_select on public.finance_accounts;
drop policy if exists finance_accounts_service_write on public.finance_accounts;
create policy finance_accounts_no_select on public.finance_accounts for select using (false);
create policy finance_accounts_service_write on public.finance_accounts for all to service_role using (true) with check (true);

drop policy if exists finance_transactions_no_select on public.finance_transactions;
drop policy if exists finance_transactions_service_write on public.finance_transactions;
create policy finance_transactions_no_select on public.finance_transactions for select using (false);
create policy finance_transactions_service_write on public.finance_transactions for all to service_role using (true) with check (true);

-- Create triggers for updated_at timestamps
create trigger set_expenses_updated_at before update on public.expenses for each row execute procedure public.set_updated_at();
create trigger set_revenue_updated_at before update on public.revenue for each row execute procedure public.set_updated_at();
create trigger set_budgets_updated_at before update on public.budgets for each row execute procedure public.set_updated_at();
create trigger set_forecasts_updated_at before update on public.forecasts for each row execute procedure public.set_updated_at();
create trigger set_finance_accounts_updated_at before update on public.finance_accounts for each row execute procedure public.set_updated_at();
create trigger set_finance_transactions_updated_at before update on public.finance_transactions for each row execute procedure public.set_updated_at();
