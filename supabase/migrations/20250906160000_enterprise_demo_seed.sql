-- Enterprise Demo Seed Function for ATLVS/OPENDECK/GHXSTSHIP
-- Creates comprehensive pirate-themed demo data as specified in enterprise standards

CREATE OR REPLACE FUNCTION seed_demo_data(org_id UUID, user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  location_id UUID;
  activation_id UUID;
  space_id UUID;
  person_id UUID;
  product_id UUID;
  order_id UUID;
  job_id UUID;
  account_id UUID;
  invoice_id UUID;
  result JSON;
BEGIN
  -- Generate UUIDs for demo records
  project_id := gen_random_uuid();
  location_id := gen_random_uuid();
  activation_id := gen_random_uuid();
  space_id := gen_random_uuid();
  person_id := gen_random_uuid();
  product_id := gen_random_uuid();
  order_id := gen_random_uuid();
  job_id := gen_random_uuid();
  account_id := gen_random_uuid();
  invoice_id := gen_random_uuid();

  -- Check if org already has demo data
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE organization_id = org_id AND is_demo = true
  ) THEN
    RETURN json_build_object('error', 'Demo data already exists for this organization');
  END IF;

  -- Mark organization as having demo data
  UPDATE organizations 
  SET is_demo = true, updated_at = NOW()
  WHERE id = org_id;

  -- 1. Create demo project: "Blackwater Reverb — Main Deck Takeover"
  INSERT INTO projects (
    id, organization_id, name, status, starts_at, ends_at, 
    created_by, is_demo, created_at, updated_at
  ) VALUES (
    project_id, org_id, 'Blackwater Reverb — Main Deck Takeover', 'planning',
    NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days',
    user_id, true, NOW(), NOW()
  );

  -- 2. Create demo locations
  INSERT INTO locations (
    id, organization_id, project_id, name, address, capacity, notes,
    created_by, is_demo, created_at, updated_at
  ) VALUES 
    (location_id, org_id, project_id, 'Port of Lost Echoes', 'Pier 7, Harbor City', 500, 'Main venue with harbor views', user_id, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, project_id, 'Harbor East Rig', 'East Harbor Platform', 200, 'Secondary stage location', user_id, true, NOW(), NOW());

  -- 3. Create demo people/crew
  INSERT INTO people (
    id, organization_id, first_name, last_name, role, email, phone,
    created_by, is_demo, created_at, updated_at
  ) VALUES 
    (person_id, org_id, 'Captain J.', 'Sparrow', 'Producer', 'captain@blackwaterfleet.com', '+1-555-PIRATE', user_id, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Molly', 'Teague', 'Rigger', 'molly.grog@blackwaterfleet.com', '+1-555-RIGGER', user_id, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, 'Bootstrap', 'Bill', 'Sound Engineer', 'bootstrap@blackwaterfleet.com', '+1-555-SOUND', user_id, true, NOW(), NOW());

  -- 4. Create demo tasks
  INSERT INTO tasks (
    id, organization_id, project_id, title, description, status, priority, 
    assigned_to, due_at, created_by, is_demo, created_at, updated_at
  ) VALUES 
    (gen_random_uuid(), org_id, project_id, 'Rigging: Starboard Mast', 'Complete rigging setup for starboard performance area', 'pending', 'high', person_id, NOW() + INTERVAL '5 days', user_id, true, NOW(), NOW()),
    (gen_random_uuid(), org_id, project_id, 'Soundcheck — Captain''s Choir', 'Full soundcheck and line check for the Captain''s Choir performance', 'pending', 'medium', person_id, NOW() + INTERVAL '8 days', user_id, true, NOW(), NOW());

  -- 5. Create demo spaces
  INSERT INTO spaces (
    id, organization_id, name, kind, capacity
  ) VALUES 
    (space_id, org_id, 'Green Room — Brig A', 'green_room', 12),
    (gen_random_uuid(), org_id, 'Dressing Room — Portside', 'dressing_room', 8);

  -- 6. Create demo events
  INSERT INTO events (
    id, project_id, name, kind, starts_at, ends_at
  ) VALUES 
    (gen_random_uuid(), project_id, 'Main Deck Stage + Neon Rig', 'performance', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 4 hours'),
    (gen_random_uuid(), project_id, 'Captain''s Technical Soundcheck', 'workshop', NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days 2 hours');

  -- 7. Create demo OPENDECK product
  INSERT INTO products (
    id, organization_id, name, description, category, price, currency, 
    vendor_name, availability, created_by, is_demo, created_at, updated_at
  ) VALUES (
    product_id, org_id, 'Phantom PA Stack — Rent', 
    'High-output touring PA stack with subs. Perfect for harbor venues and outdoor events.',
    'audio_equipment', 250000, 'USD', 'Blackwater Audio Co', 'available',
    user_id, true, NOW(), NOW()
  );

  -- 8. Create demo procurement order
  INSERT INTO procurement_orders (
    id, organization_id, project_id, order_number, vendor_name, description,
    total_amount, currency, status, order_date, expected_delivery,
    created_by, is_demo, created_at, updated_at
  ) VALUES (
    order_id, org_id, project_id, 'BWF-2024-001', 'Blackwater Audio Co',
    'PA system rental for Main Deck Takeover event',
    250000, 'USD', 'approved', NOW()::date, (NOW() + INTERVAL '6 days')::date,
    user_id, true, NOW(), NOW()
  );

  -- 9. Create demo job opportunity
  INSERT INTO jobs (
    id, organization_id, project_id, title, status, due_at, created_by
  ) VALUES (
    job_id, org_id, project_id, 'Dock Build — Night Shift', 'open', NOW() + INTERVAL '12 days', user_id
  );

  -- 10. Create demo finance account
  INSERT INTO finance_accounts (
    id, organization_id, name, account_type, currency, balance,
    created_by, is_demo, created_at, updated_at
  ) VALUES (
    account_id, org_id, 'Event Production Account', 'operating', 'USD', 7500000,
    user_id, true, NOW(), NOW()
  );

  -- 11. Create demo budget
  INSERT INTO budgets (
    id, project_id, category, amount, created_at
  ) VALUES 
    (gen_random_uuid(), project_id, 'Audio Equipment', 250000, NOW()),
    (gen_random_uuid(), project_id, 'Staging & Rigging', 150000, NOW()),
    (gen_random_uuid(), project_id, 'Crew & Labor', 200000, NOW()),
    (gen_random_uuid(), project_id, 'Catering & Hospitality', 75000, NOW()),
    (gen_random_uuid(), project_id, 'Security & Safety', 50000, NOW()),
    (gen_random_uuid(), project_id, 'Contingency', 25000, NOW());

  -- 12. Create demo invoice
  INSERT INTO invoices (
    id, organization_id, project_id, invoice_number, client_name, 
    total_amount, currency, status, due_date,
    created_by, is_demo, created_at, updated_at
  ) VALUES (
    invoice_id, org_id, project_id, 'BWF-INV-2024-001', 'Harbor City Events',
    750000, 'USD', 'sent', NOW() + INTERVAL '30 days',
    user_id, true, NOW(), NOW()
  );

  -- 13. Create demo finance transaction
  INSERT INTO finance_transactions (
    id, organization_id, account_id, project_id, invoice_id,
    kind, amount, occurred_at
  ) VALUES (
    gen_random_uuid(), org_id, account_id, project_id, invoice_id,
    'revenue', 750000, NOW()
  );

  -- 14. Create demo call sheet
  INSERT INTO call_sheets (
    id, organization_id, project_id, name, call_time, location,
    created_by, is_demo, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), org_id, project_id, 'Show Day — 10/31 - Load In & Soundcheck',
    (NOW() + INTERVAL '10 days')::timestamp, 'Port of Lost Echoes - Main Stage',
    user_id, true, NOW(), NOW()
  );

  -- 15. Create demo riders
  INSERT INTO riders (
    id, event_id, kind, details
  ) VALUES (
    gen_random_uuid(), 
    (SELECT id FROM events WHERE project_id = project_id LIMIT 1),
    'technical',
    '{"power": "3-phase 400A", "audio": "L-Acoustics K2 or equivalent", "lighting": "Full LED rig with haze", "staging": "40x24 deck with 4ft height"}'::jsonb
  );

  -- 16. Create audit log entry
  INSERT INTO audit_logs (
    action, resource_type, resource_id, user_id, organization_id, metadata, created_at
  ) VALUES (
    'demo.seeded', 'organization', org_id, user_id, org_id,
    json_build_object(
      'project_id', project_id,
      'demo_theme', 'pirate_entertainment_production',
      'records_created', 25
    ),
    NOW()
  );

  -- Return success with created record IDs
  result := json_build_object(
    'success', true,
    'message', 'Pirate-themed demo data seeded successfully',
    'data', json_build_object(
      'organization_id', org_id,
      'project_id', project_id,
      'location_id', location_id,
      'product_id', product_id,
      'order_id', order_id,
      'job_id', job_id,
      'invoice_id', invoice_id,
      'total_budget', 750000,
      'theme', 'GHXSTSHIP — Blackwater Fleet'
    )
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO audit_logs (
      action, resource_type, resource_id, user_id, organization_id, metadata, created_at
    ) VALUES (
      'demo.seed_failed', 'organization', org_id, user_id, org_id,
      json_build_object('error', SQLERRM),
      NOW()
    );
    
    RETURN json_build_object('error', SQLERRM);
END;
$$;
