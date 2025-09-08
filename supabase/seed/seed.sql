-- Seed demo data
insert into public.organizations (id, name, slug)
values
  ('00000000-0000-0000-0000-000000000001','Demo Org','demo-org')
  on conflict (id) do nothing;

-- Note: you must create an auth user and map it to public.users manually or via edge function.
-- Example mapping (replace UUIDs):
-- insert into public.users (id, auth_id, full_name) values ('11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','Demo User');
-- insert into public.memberships (user_id, organization_id, role) values ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000001','owner');

-- Projects
-- insert into public.projects (organization_id, name, status, created_by)
-- values ('00000000-0000-0000-0000-000000000001','Launch Event 2026','planning','11111111-1111-1111-1111-111111111111');

-- Companies
insert into public.companies (organization_id, name, website)
values
  ('00000000-0000-0000-0000-000000000001','Starlight Productions','https://starlight.example.com'),
  ('00000000-0000-0000-0000-000000000001','Atlas Logistics','https://atlas.example.com')
on conflict do nothing;

-- Products
insert into public.products (organization_id, name, sku, unit)
values
  ('00000000-0000-0000-0000-000000000001','Stage Truss Segment','TRS-2M','each'),
  ('00000000-0000-0000-0000-000000000001','LED Panel 2.6mm','LED-2.6','each')
on conflict do nothing;

-- Services
insert into public.services (organization_id, name, description)
values
  ('00000000-0000-0000-0000-000000000001','Rigging Crew','Certified riggers for load-in/out'),
  ('00000000-0000-0000-0000-000000000001','FOH Engineer','Front-of-house audio engineer')
on conflict do nothing;

-- Finance Accounts
insert into public.finance_accounts (organization_id, name, kind)
values
  ('00000000-0000-0000-0000-000000000001','General Ledger','general'),
  ('00000000-0000-0000-0000-000000000001','Operating Bank','bank')
on conflict do nothing;

-- Invoices (demo)
insert into public.invoices (organization_id, status, amount_due)
values
  ('00000000-0000-0000-0000-000000000001','draft', 15000.00),
  ('00000000-0000-0000-0000-000000000001','sent', 3200.00)
on conflict do nothing;

-- Spaces
insert into public.spaces (organization_id, name, kind, capacity)
values
  ('00000000-0000-0000-0000-000000000001','Green Room A','green_room',12),
  ('00000000-0000-0000-0000-000000000001','Meeting Room 1','meeting_room',8)
on conflict do nothing;

-- Trainings
insert into public.trainings (organization_id, title, required)
values
  ('00000000-0000-0000-0000-000000000001','OSHA 10', true),
  ('00000000-0000-0000-0000-000000000001','Forklift Certification', false)
on conflict do nothing;

-- Onboarding Tasks
insert into public.onboarding_tasks (organization_id, title, required)
values
  ('00000000-0000-0000-0000-000000000001','Submit W-9', true),
  ('00000000-0000-0000-0000-000000000001','Acknowledge Safety Policy', true)
on conflict do nothing;

-- Opportunities & RFPs (project_id may be null for demo)
insert into public.opportunities (organization_id, title, status)
values
  ('00000000-0000-0000-0000-000000000001','LED Wall Install for Main Stage','open')
on conflict do nothing;

insert into public.rfps (organization_id, title, status)
values
  ('00000000-0000-0000-0000-000000000001','Rigging Services RFP','open')
on conflict do nothing;

-- Procurement Orders (vendor references companies)
insert into public.procurement_orders (organization_id, vendor_company_id, status, total_amount)
select '00000000-0000-0000-0000-000000000001', c.id, 'approved', 5000.00 from public.companies c where c.name = 'Atlas Logistics'
on conflict do nothing;

