-- Performance tuning: split remaining CUD policies and add covering indexes

-- Onboarding Tasks: drop CUD and create explicit policies
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='onboarding_tasks' and policyname='onboarding_tasks_cud') then
    execute 'drop policy onboarding_tasks_cud on public.onboarding_tasks';
  end if;
end $$;

drop policy if exists onboarding_tasks_insert on public.onboarding_tasks;
create policy onboarding_tasks_insert on public.onboarding_tasks for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = onboarding_tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists onboarding_tasks_update on public.onboarding_tasks;
create policy onboarding_tasks_update on public.onboarding_tasks for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = onboarding_tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = onboarding_tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists onboarding_tasks_delete on public.onboarding_tasks;
create policy onboarding_tasks_delete on public.onboarding_tasks for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = onboarding_tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Products: drop CUD and create explicit policies
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='products_cud') then
    execute 'drop policy products_cud on public.products';
  end if;
end $$;

drop policy if exists products_insert on public.products;
create policy products_insert on public.products for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = products.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists products_update on public.products;
create policy products_update on public.products for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = products.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = products.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists products_delete on public.products;
create policy products_delete on public.products for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = products.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Opportunities: drop CUD and create explicit policies
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='opportunities' and policyname='opportunities_cud') then
    execute 'drop policy opportunities_cud on public.opportunities';
  end if;
end $$;

drop policy if exists opportunities_insert on public.opportunities;
create policy opportunities_insert on public.opportunities for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = opportunities.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists opportunities_update on public.opportunities;
create policy opportunities_update on public.opportunities for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = opportunities.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = opportunities.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists opportunities_delete on public.opportunities;
create policy opportunities_delete on public.opportunities for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = opportunities.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- RFPs: drop CUD and create explicit policies
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='rfps' and policyname='rfps_cud') then
    execute 'drop policy rfps_cud on public.rfps';
  end if;
end $$;

drop policy if exists rfps_insert on public.rfps;
create policy rfps_insert on public.rfps for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = rfps.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists rfps_update on public.rfps;
create policy rfps_update on public.rfps for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = rfps.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = rfps.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

drop policy if exists rfps_delete on public.rfps;
create policy rfps_delete on public.rfps for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = rfps.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Add covering indexes for remaining unindexed foreign keys flagged by advisor
create index if not exists idx_finance_transactions_account_id on public.finance_transactions(account_id);
create index if not exists idx_finance_transactions_invoice_id on public.finance_transactions(invoice_id);
create index if not exists idx_finance_transactions_organization_id on public.finance_transactions(organization_id);
create index if not exists idx_finance_transactions_project_id on public.finance_transactions(project_id);

create index if not exists idx_forecasts_project_id on public.forecasts(project_id);

create index if not exists idx_invoices_organization_id on public.invoices(organization_id);
create index if not exists idx_invoices_project_id on public.invoices(project_id);
create index if not exists idx_invoices_vendor_company_id on public.invoices(vendor_company_id);

create index if not exists idx_job_assignments_assignee_user_id on public.job_assignments(assignee_user_id);
create index if not exists idx_job_assignments_job_id on public.job_assignments(job_id);

create index if not exists idx_job_compliance_job_id on public.job_compliance(job_id);

create index if not exists idx_job_contracts_company_id on public.job_contracts(company_id);
create index if not exists idx_job_contracts_job_id on public.job_contracts(job_id);

-- Inferred from advisor name: jobs_created_by_fkey
create index if not exists idx_jobs_created_by on public.jobs(created_by);
