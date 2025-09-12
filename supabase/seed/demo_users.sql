-- Demo Users Seed Script
-- Creates authenticated demo users for each role type with proper permissions

-- First, we need to create auth users (this would typically be done via Supabase Auth API)
-- For demo purposes, we'll create the profile records and assume auth users exist

-- Demo Organization
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'GHXSTSHIP Demo Org', 'ghxstship-demo')
ON CONFLICT (id) DO NOTHING;

-- Demo Users (profiles)
INSERT INTO public.users (id, auth_id, full_name, preferred_locale, timezone)
VALUES 
  -- Owner User
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alex Chen (Owner)', 'en', 'America/Los_Angeles'),
  -- Admin User  
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Sarah Johnson (Admin)', 'en', 'America/New_York'),
  -- Manager User
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Mike Rodriguez (Manager)', 'en', 'America/Chicago'),
  -- Contributor User
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Emma Thompson (Contributor)', 'en', 'America/Denver'),
  -- Viewer User
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'David Park (Viewer)', 'en', 'America/Los_Angeles')
ON CONFLICT (id) DO NOTHING;

-- Memberships with different roles
INSERT INTO public.memberships (user_id, organization_id, role, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'admin', 'active'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'manager', 'active'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'contributor', 'active'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'viewer', 'active')
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Demo Projects (created by different users to show permissions)
INSERT INTO public.projects (id, organization_id, name, status, starts_at, ends_at, created_by)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'Summer Music Festival 2025', 'planning', '2025-07-15', '2025-07-20', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', 'Corporate Conference Q2', 'active', '2025-04-10', '2025-04-12', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', 'Product Launch Event', 'planning', '2025-06-01', '2025-06-01', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Demo Tasks for different projects
INSERT INTO public.tasks (organization_id, project_id, title, status, assigned_to, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Secure main stage venue', 'in_progress', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
  ('00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Book headlining artists', 'todo', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
  ('00000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Setup registration system', 'completed', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Design event branding', 'in_progress', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Demo Companies for procurement/vendor management
INSERT INTO public.companies (organization_id, name, website, contact_email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Starlight Productions', 'https://starlight.example.com', 'contact@starlight.example.com'),
  ('00000000-0000-0000-0000-000000000001', 'Atlas Logistics', 'https://atlas.example.com', 'info@atlas.example.com'),
  ('00000000-0000-0000-0000-000000000001', 'Premier Audio Visual', 'https://premierav.example.com', 'sales@premierav.example.com')
ON CONFLICT DO NOTHING;

-- Demo Finance Data
INSERT INTO public.finance_accounts (organization_id, name, kind, balance)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Operating Account', 'bank', 125000.00),
  ('00000000-0000-0000-0000-000000000001', 'Petty Cash', 'cash', 2500.00),
  ('00000000-0000-0000-0000-000000000001', 'Equipment Reserve', 'savings', 50000.00)
ON CONFLICT DO NOTHING;

-- Demo Invoices with different statuses
INSERT INTO public.invoices (organization_id, status, amount_due, client_name, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'draft', 15000.00, 'Tech Corp Annual Event', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'sent', 8500.00, 'Startup Launch Party', '33333333-3333-3333-3333-333333333333'),
  ('00000000-0000-0000-0000-000000000001', 'paid', 12000.00, 'Wedding Reception Services', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'overdue', 3200.00, 'Small Business Conference', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Demo People/Crew for different roles
INSERT INTO public.people (organization_id, first_name, last_name, email, phone, role_title, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Marcus', 'Williams', 'marcus.w@example.com', '+1-555-0101', 'Lead Rigger', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'Lisa', 'Chen', 'lisa.chen@example.com', '+1-555-0102', 'Audio Engineer', '33333333-3333-3333-3333-333333333333'),
  ('00000000-0000-0000-0000-000000000001', 'James', 'Miller', 'j.miller@example.com', '+1-555-0103', 'Lighting Designer', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'Sofia', 'Garcia', 'sofia.g@example.com', '+1-555-0104', 'Stage Manager', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Demo Assets/Equipment
INSERT INTO public.assets (organization_id, name, category, status, location, created_by)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Meyer Sound LEO Array', 'audio', 'available', 'Warehouse A', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'Chamsys MQ500 Console', 'lighting', 'in_use', 'Studio B', '33333333-3333-3333-3333-333333333333'),
  ('00000000-0000-0000-0000-000000000001', 'Barco E2 Video Processor', 'video', 'maintenance', 'Tech Shop', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', 'Genie Super Lift', 'rigging', 'available', 'Warehouse B', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;
