-- Split permissive CUD policies and add covering indexes for FKs

-- Services: replace CUD with explicit INSERT/UPDATE/DELETE
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='services' and policyname='services_cud') then
    execute 'drop policy services_cud on public.services';
  end if;
end $$;

drop policy if exists services_insert on public.services;
create policy services_insert on public.services for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = services.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists services_update on public.services;
create policy services_update on public.services for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = services.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = services.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists services_delete on public.services;
create policy services_delete on public.services for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = services.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Tasks: replace CUD with explicit INSERT/UPDATE/DELETE
-- Drop if exists
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='tasks' and policyname='tasks_cud') then
    execute 'drop policy tasks_cud on public.tasks';
  end if;
end $$;

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = tasks.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = tasks.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = tasks.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = tasks.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Trainings: replace CUD with explicit INSERT/UPDATE/DELETE
-- Drop if exists
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='trainings' and policyname='trainings_cud') then
    execute 'drop policy trainings_cud on public.trainings';
  end if;
end $$;

drop policy if exists trainings_insert on public.trainings;
create policy trainings_insert on public.trainings for insert with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = trainings.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists trainings_update on public.trainings;
create policy trainings_update on public.trainings for update using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = trainings.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = trainings.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
drop policy if exists trainings_delete on public.trainings;
create policy trainings_delete on public.trainings for delete using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = trainings.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Covering indexes for common foreign keys
create index if not exists idx_advancing_items_project_id on public.advancing_items(project_id);
create index if not exists idx_bids_company_id on public.bids(company_id);
create index if not exists idx_bids_opportunity_id on public.bids(opportunity_id);
create index if not exists idx_budgets_project_id on public.budgets(project_id);
create index if not exists idx_call_sheets_event_id on public.call_sheets(event_id);
create index if not exists idx_companies_organization_id on public.companies(organization_id);
create index if not exists idx_company_contracts_organization_id on public.company_contracts(organization_id);
create index if not exists idx_company_contracts_company_id on public.company_contracts(company_id);
create index if not exists idx_company_contracts_project_id on public.company_contracts(project_id);
create index if not exists idx_contractor_agreements_project_id on public.contractor_agreements(project_id);
create index if not exists idx_contractor_agreements_user_id on public.contractor_agreements(user_id);
create index if not exists idx_events_project_id on public.events(project_id);
create index if not exists idx_finance_accounts_organization_id on public.finance_accounts(organization_id);
-- add more as needed following advisor output
