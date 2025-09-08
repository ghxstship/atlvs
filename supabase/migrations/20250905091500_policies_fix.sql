-- Fix function search_path and add missing RLS policies per advisor

-- Ensure current_user_id has a fixed search_path
create or replace function public.current_user_id()
returns uuid
language sql
stable
set search_path = public, pg_temp
as $$
  select u.id from public.users u where u.auth_id = auth.uid();
$$;

-- Org-scoped table policies: company_contracts
create policy company_contracts_read on public.company_contracts for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = company_contracts.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
create policy company_contracts_cud on public.company_contracts for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = company_contracts.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = company_contracts.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Project-scoped: budgets
create policy budgets_access on public.budgets for all using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = budgets.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = budgets.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Project-scoped: forecasts
create policy forecasts_access on public.forecasts for all using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = forecasts.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = forecasts.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Project-scoped: manning_slots
create policy manning_slots_access on public.manning_slots for all using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = manning_slots.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = manning_slots.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Project-scoped: advancing_items
create policy advancing_items_access on public.advancing_items for all using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = advancing_items.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = advancing_items.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Org-scoped: trainings
create policy trainings_read on public.trainings for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = trainings.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
create policy trainings_cud on public.trainings for all using (
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

-- Org-scoped via training -> organization: training_attendance
create policy training_attendance_access on public.training_attendance for all using (
  exists (
    select 1 from public.trainings t
    join public.memberships m on m.organization_id = t.organization_id
    where t.id = training_attendance.training_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.trainings t
    join public.memberships m on m.organization_id = t.organization_id
    where t.id = training_attendance.training_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Org-scoped: onboarding_tasks
create policy onboarding_tasks_read on public.onboarding_tasks for select using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = onboarding_tasks.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
create policy onboarding_tasks_cud on public.onboarding_tasks for all using (
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

-- Org-scoped via task -> organization: onboarding_assignments
create policy onboarding_assignments_access on public.onboarding_assignments for all using (
  exists (
    select 1 from public.onboarding_tasks t
    join public.memberships m on m.organization_id = t.organization_id
    where t.id = onboarding_assignments.task_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.onboarding_tasks t
    join public.memberships m on m.organization_id = t.organization_id
    where t.id = onboarding_assignments.task_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
