-- Add RLS policies for contractor_agreements

-- Assuming row level security is already enabled on public.contractor_agreements
-- Project-scoped access via contractor_agreements.project_id
create policy contractor_agreements_access on public.contractor_agreements for all using (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = contractor_agreements.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = contractor_agreements.project_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);
