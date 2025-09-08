-- Demo seed function for GHXSTSHIP pirate-themed data
CREATE OR REPLACE FUNCTION seed_demo_data(org_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  location_id UUID;
  activation_id UUID;
  person_id UUID;
  space_id UUID;
  job_id UUID;
  product_id UUID;
  budget_id UUID;
BEGIN
  -- Mark organization as demo
  UPDATE organizations 
  SET is_demo = true, name = 'GHXSTSHIP — Blackwater Fleet'
  WHERE id = org_id;

  -- Create demo project
  INSERT INTO projects (id, organization_id, name, description, status, starts_at, ends_at, budget, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    org_id,
    'Blackwater Reverb — Main Deck Takeover',
    'Epic pirate-themed entertainment production featuring live music, immersive experiences, and spectacular stage effects on the main deck.',
    'active',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    75000.00,
    user_id,
    true
  ) RETURNING id INTO project_id;

  -- Create demo locations
  INSERT INTO locations (id, project_id, organization_id, name, address, type, capacity, created_by, is_demo)
  VALUES 
    (gen_random_uuid(), project_id, org_id, 'Port of Lost Echoes', 'Pier 7, Harbor City, Maritime District', 'venue', 500, user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Harbor East Rig', 'East Harbor Platform, Offshore Station Alpha', 'stage', 200, user_id, true)
  RETURNING id INTO location_id;

  -- Create demo activation
  INSERT INTO activations (id, project_id, organization_id, name, description, status, start_date, end_date, location_id, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    project_id,
    org_id,
    'Main Deck Stage + Neon Rig',
    'Primary performance activation featuring the main stage setup with advanced lighting and sound systems.',
    'setup',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '12 days',
    location_id,
    user_id,
    true
  ) RETURNING id INTO activation_id;

  -- Create demo people
  INSERT INTO people (id, organization_id, first_name, last_name, role, email, phone, department, created_by, is_demo)
  VALUES 
    (gen_random_uuid(), org_id, 'Captain J.', 'Sparrow', 'Producer', 'captain@blackwaterfleet.com', '+1-555-PIRATE', 'Production', user_id, true),
    (gen_random_uuid(), org_id, 'Molly', '''Grog'' Teague', 'Rigger', 'molly@blackwaterfleet.com', '+1-555-RIGGING', 'Technical', user_id, true),
    (gen_random_uuid(), org_id, 'Bootstrap', 'Bill Turner', 'Sound Engineer', 'bootstrap@blackwaterfleet.com', '+1-555-SOUND', 'Audio', user_id, true),
    (gen_random_uuid(), org_id, 'Elizabeth', 'Swann', 'Stage Manager', 'elizabeth@blackwaterfleet.com', '+1-555-STAGE', 'Production', user_id, true)
  RETURNING id INTO person_id;

  -- Create demo spaces
  INSERT INTO spaces (id, project_id, organization_id, name, type, capacity, location, created_by, is_demo)
  VALUES 
    (gen_random_uuid(), project_id, org_id, 'Green Room — Brig A', 'green_room', 12, 'Lower deck, port side', user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Dressing Room — Portside', 'dressing_room', 8, 'Main deck, port quarter', user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Captain''s Quarters — VIP Lounge', 'vip_area', 20, 'Upper deck, stern', user_id, true)
  RETURNING id INTO space_id;

  -- Create demo call sheet
  INSERT INTO call_sheets (id, project_id, organization_id, name, event_date, call_time, location, notes, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    project_id,
    org_id,
    'Show Day — 10/31 - Load In & Soundcheck',
    (NOW() + INTERVAL '10 days')::date,
    '08:00',
    'Port of Lost Echoes - Main Deck',
    'All crew report for load-in at 0800. Soundcheck begins at 1400. Dress rehearsal at 1800. Doors open at 2000.',
    user_id,
    true
  );

  -- Create demo riders
  INSERT INTO riders (id, project_id, organization_id, name, type, requirements, notes, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    project_id,
    org_id,
    'Captain''s Technical Rider (Main Stage)',
    'technical',
    'PA System: L-Acoustics K2 line array, 32-channel digital console, wireless mic package (8 channels), monitor system with 6 mixes, fog machines (4 units), pyrotechnic safety clearance',
    'Special requirements: Cannon sound effects system, nautical-themed lighting package, weather protection for all equipment',
    user_id,
    true
  );

  -- Create demo tasks
  INSERT INTO tasks (id, project_id, organization_id, name, description, status, priority, assigned_to, due_date, created_by, is_demo)
  VALUES 
    (gen_random_uuid(), project_id, org_id, 'Rigging: Starboard Mast', 'Install and test rigging for starboard mast lighting and effects', 'in_progress', 'high', person_id, NOW() + INTERVAL '3 days', user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Soundcheck — Captain''s Choir', 'Full soundcheck and line check for the Captain''s Choir performance', 'pending', 'medium', person_id, NOW() + INTERVAL '8 days', user_id, true);

  -- Create demo OPENDECK product
  INSERT INTO products (id, organization_id, name, description, category, price, currency, vendor_name, availability, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    org_id,
    'Phantom PA Stack — Rent',
    'Professional-grade portable PA system perfect for maritime events. Includes wireless capability, weather-resistant housing, and nautical-themed custom wrapping.',
    'audio_equipment',
    2500.00,
    'USD',
    'Blackwater Audio Co',
    'available',
    user_id,
    true
  ) RETURNING id INTO product_id;

  -- Create demo job opportunity
  INSERT INTO job_opportunities (id, organization_id, title, description, type, budget, currency, deadline, status, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    org_id,
    'Dock Build — Night Shift',
    'Seeking experienced dock construction crew for overnight build of temporary performance platform. Maritime construction experience preferred. Must be available for 5-night build schedule.',
    'construction',
    15000.00,
    'USD',
    NOW() + INTERVAL '5 days',
    'open',
    user_id,
    true
  ) RETURNING id INTO job_id;

  -- Create demo budget
  INSERT INTO budgets (id, project_id, organization_id, name, total_amount, currency, status, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    project_id,
    org_id,
    'Event Budget — Blackwater Reverb',
    75000.00,
    'USD',
    'approved',
    user_id,
    true
  ) RETURNING id INTO budget_id;

  -- Create demo expenses
  INSERT INTO expenses (id, budget_id, organization_id, description, amount, currency, category, date, status, created_by, is_demo)
  VALUES 
    (gen_random_uuid(), budget_id, org_id, 'PA System Rental - Phantom Stack', 2500.00, 'USD', 'equipment', NOW(), 'approved', user_id, true),
    (gen_random_uuid(), budget_id, org_id, 'Dock Construction Materials', 8500.00, 'USD', 'construction', NOW(), 'pending', user_id, true),
    (gen_random_uuid(), budget_id, org_id, 'Crew Catering - 3 Days', 1200.00, 'USD', 'catering', NOW(), 'approved', user_id, true);

  -- Create demo invoice
  INSERT INTO invoices (id, organization_id, invoice_number, client_name, amount, currency, status, due_date, created_by, is_demo)
  VALUES (
    gen_random_uuid(),
    org_id,
    'INV-2024-001',
    'Tortuga Entertainment Group',
    25000.00,
    'USD',
    'sent',
    NOW() + INTERVAL '30 days',
    user_id,
    true
  );

  -- Create demo files (placeholder URLs)
  INSERT INTO files (id, project_id, organization_id, name, file_path, file_type, file_size, uploaded_by, is_demo)
  VALUES 
    (gen_random_uuid(), project_id, org_id, 'Main Deck Technical Plans.pdf', '/demo/technical-plans.pdf', 'application/pdf', 2048576, user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Stage Rendering - Pirate Theme.jpg', '/demo/stage-render.jpg', 'image/jpeg', 1536000, user_id, true),
    (gen_random_uuid(), project_id, org_id, 'Equipment Manifest.xlsx', '/demo/equipment-list.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 45056, user_id, true);

  -- Create audit log entries for demo creation
  INSERT INTO audit_logs (organization_id, entity_type, entity_id, action, actor_id, metadata)
  VALUES 
    (org_id, 'organization', org_id, 'Demo data seeded', user_id, '{"demo": true, "seed_version": "1.0"}'),
    (org_id, 'project', project_id, 'Demo project created', user_id, '{"demo": true, "name": "Blackwater Reverb — Main Deck Takeover"}');

END;
$$;
