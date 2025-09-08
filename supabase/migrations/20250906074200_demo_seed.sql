-- Demo seed and cleanup (pirate-themed dataset)
set local search_path = public;

-- Add is_demo flags (idempotent)
alter table if exists public.organizations add column if not exists is_demo boolean not null default false;
alter table if exists public.projects add column if not exists is_demo boolean not null default false;
alter table if exists public.tasks add column if not exists is_demo boolean not null default false;
alter table if exists public.events add column if not exists is_demo boolean not null default false;
alter table if exists public.call_sheets add column if not exists is_demo boolean not null default false;
alter table if exists public.riders add column if not exists is_demo boolean not null default false;
alter table if exists public.spaces add column if not exists is_demo boolean not null default false;
alter table if exists public.companies add column if not exists is_demo boolean not null default false;
alter table if exists public.procurement_orders add column if not exists is_demo boolean not null default false;
alter table if exists public.procurement_order_items add column if not exists is_demo boolean not null default false;
alter table if exists public.opportunities add column if not exists is_demo boolean not null default false;
alter table if exists public.rfps add column if not exists is_demo boolean not null default false;
alter table if exists public.finance_accounts add column if not exists is_demo boolean not null default false;
alter table if exists public.invoices add column if not exists is_demo boolean not null default false;
alter table if exists public.products add column if not exists is_demo boolean not null default false;
alter table if exists public.services add column if not exists is_demo boolean not null default false;

-- Seed RPC
create or replace function public.seed_demo_for_org(org_uuid uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_user_id();
  v_project_id uuid;
  v_event_id uuid;
  v_vendor_company_id uuid;
  v_po_id uuid;
  v_invoice_id uuid;
begin
  if org_uuid is null then
    raise exception 'org_uuid is required';
  end if;
  if v_user_id is null then
    raise exception 'must be authenticated';
  end if;
  -- Only members may seed
  if not exists (select 1 from public.memberships m where m.organization_id = org_uuid and m.user_id = v_user_id and m.status = 'active') then
    raise exception 'forbidden';
  end if;
  -- Skip if org has non-demo projects
  if exists(select 1 from public.projects p where p.organization_id = org_uuid and coalesce(p.is_demo,false) = false) then
    return json_build_object('skipped', true, 'reason', 'org_has_real_data');
  end if;

  -- Create demo project
  insert into public.projects (id, organization_id, name, status, starts_at, ends_at, created_by, is_demo)
  values (gen_random_uuid(), org_uuid, 'Blackwater Reverb — Main Deck Takeover', 'planning', now(), now() + interval '7 days', v_user_id, true)
  returning id into v_project_id;

  -- Spaces (locations)
  insert into public.spaces (id, organization_id, name, kind, capacity, is_demo)
  values
    (gen_random_uuid(), org_uuid, 'Green Room — Brig A', 'green_room', 10, true),
    (gen_random_uuid(), org_uuid, 'Dressing Room — Portside', 'dressing_room', 6, true)
  on conflict do nothing;

  -- Activation Event
  insert into public.events (id, project_id, name, kind, starts_at, ends_at, is_demo)
  values (gen_random_uuid(), v_project_id, 'Main Deck Stage + Neon Rig', 'activation', now() + interval '1 day', now() + interval '1 day 6 hours', true)
  returning id into v_event_id;

  -- Call Sheet
  insert into public.call_sheets (id, event_id, call_date, details, is_demo)
  values (gen_random_uuid(), v_event_id, (now() + interval '2 days')::date, '{"title":"Show Day — 10/31 - Load In & Soundcheck"}'::jsonb, true);

  -- Rider
  insert into public.riders (id, event_id, kind, details, is_demo)
  values (gen_random_uuid(), v_event_id, 'technical', '{"title":"Captain''s Technical Rider (Main Stage)"}'::jsonb, true);

  -- Tasks
  insert into public.tasks (id, organization_id, project_id, title, status, due_at, created_by, is_demo)
  values
    (gen_random_uuid(), org_uuid, v_project_id, 'Rigging: Starboard Mast', 'in_progress', now() + interval '1 day', v_user_id, true),
    (gen_random_uuid(), org_uuid, v_project_id, 'Soundcheck — Captain''s Choir', 'todo', now() + interval '2 days', v_user_id, true);

  -- Vendor company
  insert into public.companies (id, organization_id, name, website, rating, is_demo)
  values (gen_random_uuid(), org_uuid, 'Blackwater Audio Co', 'https://blackwater-audio.example.com', 4.8, true)
  on conflict do nothing
  returning id into v_vendor_company_id;

  -- Procurement order
  insert into public.procurement_orders (id, organization_id, project_id, vendor_company_id, status, expected_delivery, total_amount, is_demo)
  values (gen_random_uuid(), org_uuid, v_project_id, v_vendor_company_id, 'approved', (now() + interval '3 days')::date, 2500.00, true)
  returning id into v_po_id;

  -- Budget & invoice (simple)
  insert into public.finance_accounts (id, organization_id, name, kind, is_demo)
  values (gen_random_uuid(), org_uuid, 'Event Budget — 75,000', 'general', true)
  on conflict do nothing;

  insert into public.invoices (id, organization_id, project_id, status, amount_due, due_at, is_demo)
  values (gen_random_uuid(), org_uuid, v_project_id, 'draft', 12500.00, (now() + interval '14 days')::date, true)
  returning id into v_invoice_id;

  -- Opportunities & OPENDECK-ish listing placeholders (org-scoped entities)
  insert into public.opportunities (id, organization_id, project_id, title, status, is_demo)
  values (gen_random_uuid(), org_uuid, v_project_id, 'Dock Build — Night Shift (Submit Bids)', 'open', true)
  on conflict do nothing;

  insert into public.rfps (id, organization_id, project_id, title, status, is_demo)
  values (gen_random_uuid(), org_uuid, v_project_id, 'Captain''s Technical Rider (Main Stage)', 'open', true)
  on conflict do nothing;

  return json_build_object('ok', true, 'project_id', v_project_id);
end;
$$;

revoke all on function public.seed_demo_for_org(uuid) from public;
grant execute on function public.seed_demo_for_org(uuid) to authenticated;

-- Cleanup RPC
create or replace function public.remove_demo_for_org(org_uuid uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_user_id();
  v_deleted_projects int := 0;
  v_deleted_companies int := 0;
  v_deleted_accounts int := 0;
  v_deleted_invoices int := 0;
  v_deleted_opps int := 0;
  v_deleted_rfps int := 0;
begin
  if org_uuid is null then
    raise exception 'org_uuid is required';
  end if;
  if v_user_id is null then
    raise exception 'must be authenticated';
  end if;
  if not exists (select 1 from public.memberships m where m.organization_id = org_uuid and m.user_id = v_user_id and m.status = 'active') then
    raise exception 'forbidden';
  end if;

  delete from public.projects p where p.organization_id = org_uuid and p.is_demo = true returning 1 into v_deleted_projects;
  delete from public.companies c where c.organization_id = org_uuid and c.is_demo = true returning 1 into v_deleted_companies;
  delete from public.finance_accounts fa where fa.organization_id = org_uuid and fa.is_demo = true returning 1 into v_deleted_accounts;
  delete from public.invoices i where i.organization_id = org_uuid and i.is_demo = true returning 1 into v_deleted_invoices;
  delete from public.opportunities o where o.organization_id = org_uuid and o.is_demo = true returning 1 into v_deleted_opps;
  delete from public.rfps r where r.organization_id = org_uuid and r.is_demo = true returning 1 into v_deleted_rfps;

  return json_build_object(
    'ok', true,
    'projects_deleted', v_deleted_projects,
    'companies_deleted', v_deleted_companies,
    'accounts_deleted', v_deleted_accounts,
    'invoices_deleted', v_deleted_invoices,
    'opportunities_deleted', v_deleted_opps,
    'rfps_deleted', v_deleted_rfps
  );
end;
$$;

revoke all on function public.remove_demo_for_org(uuid) from public;
grant execute on function public.remove_demo_for_org(uuid) to authenticated;
