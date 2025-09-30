-- GL Accounts (General Ledger) Schema
-- This creates a proper chart of accounts for financial management

-- Create GL accounts table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_number text not null,
  name text not null,
  description text,
  type text not null check (type in ('asset', 'liability', 'equity', 'revenue', 'expense')),
  subtype text,
  parent_account_id uuid references public.accounts(id) on delete set null,
  is_active boolean not null default true,
  currency text not null default 'USD',
  balance numeric(14,2) not null default 0,
  normal_balance text not null check (normal_balance in ('debit', 'credit')),
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure unique account numbers within organization
  unique(organization_id, account_number)
);

-- Create indexes for performance
create index if not exists idx_accounts_organization_id on public.accounts(organization_id);
create index if not exists idx_accounts_type on public.accounts(type);
create index if not exists idx_accounts_parent_account_id on public.accounts(parent_account_id);
create index if not exists idx_accounts_account_number on public.accounts(account_number);
create index if not exists idx_accounts_is_active on public.accounts(is_active);

-- RLS policies for accounts
alter table public.accounts enable row level security;

-- Policy: Users can view accounts in their organization
create policy "Users can view accounts in their organization"
  on public.accounts for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.organization_id = accounts.organization_id
      and memberships.status = 'active'
    )
  );

-- Policy: Admins and managers can create accounts
create policy "Admins and managers can create accounts"
  on public.accounts for insert
  with check (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.organization_id = accounts.organization_id
      and memberships.role in ('owner', 'admin', 'manager')
      and memberships.status = 'active'
    )
  );

-- Policy: Admins and managers can update accounts
create policy "Admins and managers can update accounts"
  on public.accounts for update
  using (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.organization_id = accounts.organization_id
      and memberships.role in ('owner', 'admin', 'manager')
      and memberships.status = 'active'
    )
  );

-- Policy: Only owners and admins can delete accounts
create policy "Only owners and admins can delete accounts"
  on public.accounts for delete
  using (
    exists (
      select 1 from public.memberships
      where memberships.user_id = auth.uid()
      and memberships.organization_id = accounts.organization_id
      and memberships.role in ('owner', 'admin')
      and memberships.status = 'active'
    )
  );

-- Update finance_transactions to reference the new accounts table
alter table public.finance_transactions 
  drop constraint if exists finance_transactions_account_id_fkey,
  add constraint finance_transactions_account_id_fkey 
    foreign key (account_id) references public.accounts(id) on delete cascade;

-- Function to automatically set normal_balance based on account type
create or replace function set_normal_balance()
returns trigger as $$
begin
  case new.type
    when 'asset' then new.normal_balance = 'debit';
    when 'expense' then new.normal_balance = 'debit';
    when 'liability' then new.normal_balance = 'credit';
    when 'equity' then new.normal_balance = 'credit';
    when 'revenue' then new.normal_balance = 'credit';
    else new.normal_balance = 'debit';
  end case;
  return new;
end;
$$ language plpgsql;

-- Trigger to set normal_balance automatically
create trigger set_normal_balance_trigger
  before insert or update on public.accounts
  for each row execute function set_normal_balance();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamp
create trigger update_accounts_updated_at
  before update on public.accounts
  for each row execute function update_updated_at_column();

-- Insert standard chart of accounts for new organizations
-- This will be used as a template when organizations are created

-- Create function to initialize standard chart of accounts
create or replace function initialize_chart_of_accounts(org_id uuid)
returns void as $$
begin
  -- Assets
  insert into public.accounts (organization_id, account_number, name, type, subtype, description) values
  (org_id, '1000', 'Cash and Cash Equivalents', 'asset', 'current', 'Petty cash, checking accounts, savings accounts'),
  (org_id, '1100', 'Accounts Receivable', 'asset', 'current', 'Money owed by customers'),
  (org_id, '1200', 'Inventory', 'asset', 'current', 'Goods held for sale'),
  (org_id, '1300', 'Prepaid Expenses', 'asset', 'current', 'Expenses paid in advance'),
  (org_id, '1500', 'Equipment', 'asset', 'fixed', 'Machinery, tools, and equipment'),
  (org_id, '1600', 'Accumulated Depreciation - Equipment', 'asset', 'contra', 'Depreciation of equipment'),
  (org_id, '1700', 'Intangible Assets', 'asset', 'intangible', 'Patents, trademarks, goodwill');

  -- Liabilities
  insert into public.accounts (organization_id, account_number, name, type, subtype, description) values
  (org_id, '2000', 'Accounts Payable', 'liability', 'current', 'Money owed to suppliers'),
  (org_id, '2100', 'Accrued Expenses', 'liability', 'current', 'Expenses incurred but not yet paid'),
  (org_id, '2200', 'Short-term Debt', 'liability', 'current', 'Debt due within one year'),
  (org_id, '2500', 'Long-term Debt', 'liability', 'long-term', 'Debt due after one year'),
  (org_id, '2600', 'Deferred Revenue', 'liability', 'current', 'Revenue received in advance');

  -- Equity
  insert into public.accounts (organization_id, account_number, name, type, subtype, description) values
  (org_id, '3000', 'Owner''s Equity', 'equity', 'capital', 'Owner''s investment in the business'),
  (org_id, '3100', 'Retained Earnings', 'equity', 'retained', 'Accumulated profits retained in business'),
  (org_id, '3200', 'Dividends', 'equity', 'distribution', 'Distributions to owners');

  -- Revenue
  insert into public.accounts (organization_id, account_number, name, type, subtype, description) values
  (org_id, '4000', 'Service Revenue', 'revenue', 'operating', 'Revenue from primary services'),
  (org_id, '4100', 'Product Sales', 'revenue', 'operating', 'Revenue from product sales'),
  (org_id, '4200', 'Interest Income', 'revenue', 'non-operating', 'Interest earned on investments'),
  (org_id, '4300', 'Other Income', 'revenue', 'non-operating', 'Miscellaneous income');

  -- Expenses
  insert into public.accounts (organization_id, account_number, name, type, subtype, description) values
  (org_id, '5000', 'Cost of Goods Sold', 'expense', 'cogs', 'Direct costs of producing goods/services'),
  (org_id, '6000', 'Salaries and Wages', 'expense', 'operating', 'Employee compensation'),
  (org_id, '6100', 'Benefits', 'expense', 'operating', 'Employee benefits and insurance'),
  (org_id, '6200', 'Rent Expense', 'expense', 'operating', 'Office and facility rent'),
  (org_id, '6300', 'Utilities', 'expense', 'operating', 'Electricity, water, internet'),
  (org_id, '6400', 'Office Supplies', 'expense', 'operating', 'General office supplies'),
  (org_id, '6500', 'Marketing and Advertising', 'expense', 'operating', 'Marketing and promotional expenses'),
  (org_id, '6600', 'Professional Services', 'expense', 'operating', 'Legal, accounting, consulting fees'),
  (org_id, '6700', 'Depreciation Expense', 'expense', 'operating', 'Depreciation of fixed assets'),
  (org_id, '6800', 'Interest Expense', 'expense', 'non-operating', 'Interest on loans and debt'),
  (org_id, '6900', 'Other Expenses', 'expense', 'operating', 'Miscellaneous expenses');
end;
$$ language plpgsql;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.accounts to authenticated;
grant execute on function initialize_chart_of_accounts(uuid) to authenticated;
