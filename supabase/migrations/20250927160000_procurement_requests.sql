-- Procurement Requests and Approval Workflow Tables
-- This migration adds comprehensive procurement request management with approval workflows

-- Procurement Requests table
CREATE TABLE IF NOT EXISTS public.procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  business_justification TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'equipment' CHECK (category IN ('equipment', 'supplies', 'services', 'materials', 'software', 'maintenance', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'converted')),
  estimated_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  requested_delivery_date DATE,
  budget_code TEXT,
  department TEXT,
  approval_notes TEXT,
  rejected_reason TEXT,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Procurement Request Items table
CREATE TABLE IF NOT EXISTS public.procurement_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'equipment' CHECK (category IN ('equipment', 'supplies', 'services', 'materials', 'software', 'maintenance', 'other')),
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'each',
  estimated_unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  estimated_total_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  preferred_vendor TEXT,
  specifications TEXT,
  justification TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval Workflow Steps table
CREATE TABLE IF NOT EXISTS public.procurement_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, step_order)
);

-- Request Activity Log table
CREATE TABLE IF NOT EXISTS public.procurement_request_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'submitted', 'approved', 'rejected', 'cancelled', 'updated', 'converted', 'item_added', 'item_removed', 'item_updated')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval Policies table (for configuring approval workflows)
CREATE TABLE IF NOT EXISTS public.procurement_approval_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Conditions for when this policy applies
  approval_steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of approval step configurations
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_procurement_requests_organization_id ON public.procurement_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_requester_id ON public.procurement_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_project_id ON public.procurement_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_status ON public.procurement_requests(status);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_priority ON public.procurement_requests(priority);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_category ON public.procurement_requests(category);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_created_at ON public.procurement_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_estimated_total ON public.procurement_requests(estimated_total);

CREATE INDEX IF NOT EXISTS idx_procurement_request_items_request_id ON public.procurement_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_procurement_request_items_product_id ON public.procurement_request_items(product_id);
CREATE INDEX IF NOT EXISTS idx_procurement_request_items_service_id ON public.procurement_request_items(service_id);
CREATE INDEX IF NOT EXISTS idx_procurement_request_items_category ON public.procurement_request_items(category);

CREATE INDEX IF NOT EXISTS idx_procurement_approval_steps_request_id ON public.procurement_approval_steps(request_id);
CREATE INDEX IF NOT EXISTS idx_procurement_approval_steps_approver_id ON public.procurement_approval_steps(approver_id);
CREATE INDEX IF NOT EXISTS idx_procurement_approval_steps_status ON public.procurement_approval_steps(status);

CREATE INDEX IF NOT EXISTS idx_procurement_request_activity_request_id ON public.procurement_request_activity(request_id);
CREATE INDEX IF NOT EXISTS idx_procurement_request_activity_user_id ON public.procurement_request_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_procurement_request_activity_action ON public.procurement_request_activity(action);
CREATE INDEX IF NOT EXISTS idx_procurement_request_activity_created_at ON public.procurement_request_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_procurement_approval_policies_organization_id ON public.procurement_approval_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_procurement_approval_policies_is_active ON public.procurement_approval_policies(is_active);

-- RLS Policies
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_request_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_approval_policies ENABLE ROW LEVEL SECURITY;

-- Procurement Requests RLS Policies
CREATE POLICY "Users can view requests in their organization" ON public.procurement_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_requests.organization_id
    )
  );

CREATE POLICY "Users can create requests in their organization" ON public.procurement_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_requests.organization_id
    )
  );

CREATE POLICY "Users can update their own requests or managers can update any" ON public.procurement_requests
  FOR UPDATE USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_requests.organization_id
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their own draft requests or managers can delete any" ON public.procurement_requests
  FOR DELETE USING (
    (requester_id = auth.uid() AND status = 'draft') OR
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_requests.organization_id
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );

-- Procurement Request Items RLS Policies
CREATE POLICY "Users can view request items if they can view the request" ON public.procurement_request_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.procurement_requests pr
      JOIN public.memberships m ON m.organization_id = pr.organization_id
      WHERE pr.id = procurement_request_items.request_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage request items if they can manage the request" ON public.procurement_request_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.procurement_requests pr
      JOIN public.memberships m ON m.organization_id = pr.organization_id
      WHERE pr.id = procurement_request_items.request_id
      AND m.user_id = auth.uid()
      AND (pr.requester_id = auth.uid() OR m.role IN ('owner', 'admin', 'manager'))
    )
  );

-- Approval Steps RLS Policies
CREATE POLICY "Users can view approval steps for requests in their organization" ON public.procurement_approval_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.procurement_requests pr
      JOIN public.memberships m ON m.organization_id = pr.organization_id
      WHERE pr.id = procurement_approval_steps.request_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage approval steps" ON public.procurement_approval_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.procurement_requests pr
      JOIN public.memberships m ON m.organization_id = pr.organization_id
      WHERE pr.id = procurement_approval_steps.request_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );

-- Activity Log RLS Policies
CREATE POLICY "Users can view activity for requests in their organization" ON public.procurement_request_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.procurement_requests pr
      JOIN public.memberships m ON m.organization_id = pr.organization_id
      WHERE pr.id = procurement_request_activity.request_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert activity logs" ON public.procurement_request_activity
  FOR INSERT WITH CHECK (true);

-- Approval Policies RLS Policies
CREATE POLICY "Users can view approval policies in their organization" ON public.procurement_approval_policies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_approval_policies.organization_id
    )
  );

CREATE POLICY "Managers can manage approval policies" ON public.procurement_approval_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
      AND m.organization_id = procurement_approval_policies.organization_id
      AND m.role IN ('owner', 'admin', 'manager')
    )
  );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_procurement_requests_updated_at
  BEFORE UPDATE ON public.procurement_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_request_items_updated_at
  BEFORE UPDATE ON public.procurement_request_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_approval_steps_updated_at
  BEFORE UPDATE ON public.procurement_approval_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_approval_policies_updated_at
  BEFORE UPDATE ON public.procurement_approval_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically log activity
CREATE OR REPLACE FUNCTION log_procurement_request_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.procurement_request_activity (request_id, user_id, action, description, metadata)
    VALUES (NEW.id, auth.uid(), 'created', 'Request created', jsonb_build_object('status', NEW.status));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO public.procurement_request_activity (request_id, user_id, action, description, metadata)
      VALUES (NEW.id, auth.uid(), 
        CASE 
          WHEN NEW.status = 'submitted' THEN 'submitted'
          WHEN NEW.status = 'approved' THEN 'approved'
          WHEN NEW.status = 'rejected' THEN 'rejected'
          WHEN NEW.status = 'cancelled' THEN 'cancelled'
          WHEN NEW.status = 'converted' THEN 'converted'
          ELSE 'updated'
        END,
        'Status changed from ' || OLD.status || ' to ' || NEW.status,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    -- Log other significant changes
    IF OLD.estimated_total != NEW.estimated_total THEN
      INSERT INTO public.procurement_request_activity (request_id, user_id, action, description, metadata)
      VALUES (NEW.id, auth.uid(), 'updated', 'Estimated total updated',
        jsonb_build_object('old_total', OLD.estimated_total, 'new_total', NEW.estimated_total)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER procurement_request_activity_trigger
  AFTER INSERT OR UPDATE ON public.procurement_requests
  FOR EACH ROW EXECUTE FUNCTION log_procurement_request_activity();

-- Function to calculate estimated total from items
CREATE OR REPLACE FUNCTION update_request_estimated_total()
RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC(14,2);
BEGIN
  -- Calculate total from all items for this request
  SELECT COALESCE(SUM(estimated_total_price), 0)
  INTO total
  FROM public.procurement_request_items
  WHERE request_id = COALESCE(NEW.request_id, OLD.request_id);
  
  -- Update the request total
  UPDATE public.procurement_requests
  SET estimated_total = total,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.request_id, OLD.request_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_request_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.procurement_request_items
  FOR EACH ROW EXECUTE FUNCTION update_request_estimated_total();

-- Function to validate approval workflow
CREATE OR REPLACE FUNCTION validate_approval_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure step_order is sequential
  IF NEW.step_order <= 0 THEN
    RAISE EXCEPTION 'Approval step order must be positive';
  END IF;
  
  -- Prevent duplicate step orders for the same request
  IF EXISTS (
    SELECT 1 FROM public.procurement_approval_steps
    WHERE request_id = NEW.request_id
    AND step_order = NEW.step_order
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Duplicate approval step order for request';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_approval_workflow_trigger
  BEFORE INSERT OR UPDATE ON public.procurement_approval_steps
  FOR EACH ROW EXECUTE FUNCTION validate_approval_workflow();

-- Demo data for procurement requests
INSERT INTO public.procurement_requests (
  id,
  organization_id,
  project_id,
  requester_id,
  title,
  description,
  business_justification,
  category,
  priority,
  status,
  estimated_total,
  currency,
  requested_delivery_date,
  budget_code,
  department,
  created_at,
  updated_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.organizations WHERE name = 'GHXSTSHIP — Blackwater Fleet' LIMIT 1),
    (SELECT id FROM public.projects WHERE name = 'Blackwater Reverb — Main Deck Takeover' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'captain@ghxstship.com' LIMIT 1),
    'Camera Equipment for Main Deck Production',
    'Professional camera equipment needed for the main deck takeover production including cameras, lenses, and accessories.',
    'High-quality camera equipment is essential for capturing professional footage during the main deck takeover event. This equipment will ensure we meet production standards and deliver exceptional visual content.',
    'equipment',
    'high',
    'submitted',
    25000.00,
    'USD',
    '2024-02-15',
    'PROD-2024-001',
    'Production',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.organizations WHERE name = 'GHXSTSHIP — Blackwater Fleet' LIMIT 1),
    (SELECT id FROM public.projects WHERE name = 'Blackwater Reverb — Main Deck Takeover' LIMIT 1),
    (SELECT id FROM public.users WHERE email = 'quartermaster@ghxstship.com' LIMIT 1),
    'Catering Services for Crew',
    'Comprehensive catering services for the production crew during the 5-day shoot.',
    'Proper nutrition is crucial for maintaining crew energy and productivity during the intensive 5-day production schedule. Quality catering will ensure crew satisfaction and optimal performance.',
    'services',
    'medium',
    'approved',
    8500.00,
    'USD',
    '2024-02-10',
    'CATER-2024-001',
    'Logistics',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM public.organizations WHERE name = 'GHXSTSHIP — Blackwater Fleet' LIMIT 1),
    NULL,
    (SELECT id FROM public.users WHERE email = 'bosun@ghxstship.com' LIMIT 1),
    'Safety Equipment Upgrade',
    'Upgrade safety equipment including life vests, first aid kits, and emergency communication devices.',
    'Safety equipment upgrade is mandatory to comply with maritime safety regulations and ensure crew safety during operations. Current equipment is approaching end-of-life and needs replacement.',
    'equipment',
    'urgent',
    'draft',
    12000.00,
    'USD',
    '2024-01-30',
    'SAFETY-2024-001',
    'Safety',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Demo request items
INSERT INTO public.procurement_request_items (
  id,
  request_id,
  name,
  description,
  category,
  quantity,
  unit,
  estimated_unit_price,
  estimated_total_price,
  preferred_vendor,
  specifications,
  justification
) VALUES
  -- Camera Equipment Request Items
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Professional Cinema Camera',
    'High-end cinema camera for professional video production',
    'equipment',
    2,
    'each',
    8000.00,
    16000.00,
    'B&H Photo',
    'RED KOMODO 6K, Global Shutter, Canon RF Mount',
    'Primary cameras for main production footage'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Cinema Lens Set',
    'Professional lens set for cinema cameras',
    'equipment',
    1,
    'set',
    6000.00,
    6000.00,
    'B&H Photo',
    'Canon CN-E Prime Lens Set (14mm, 24mm, 50mm, 85mm)',
    'Complete lens coverage for various shots'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Camera Accessories',
    'Tripods, batteries, memory cards, and other accessories',
    'equipment',
    1,
    'package',
    3000.00,
    3000.00,
    'B&H Photo',
    'Manfrotto tripods, V-mount batteries, CFexpress cards',
    'Essential accessories for camera operation'
  ),
  -- Catering Services Items
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    'Daily Crew Meals',
    'Breakfast, lunch, and dinner for production crew',
    'services',
    5,
    'days',
    1200.00,
    6000.00,
    'Seaside Catering Co.',
    '3 meals per day for 25 crew members',
    'Nutritious meals to maintain crew energy'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'Craft Services',
    'Snacks, beverages, and light refreshments',
    'services',
    5,
    'days',
    300.00,
    1500.00,
    'Seaside Catering Co.',
    'Continuous snacks and beverages throughout production',
    'Keep crew energized between meals'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'Special Dietary Accommodations',
    'Vegetarian, vegan, and allergy-friendly options',
    'services',
    5,
    'days',
    200.00,
    1000.00,
    'Seaside Catering Co.',
    'Accommodate crew dietary restrictions and preferences',
    'Ensure all crew members have suitable meal options'
  ),
  -- Safety Equipment Items
  (
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    'Life Vests',
    'Coast Guard approved life vests',
    'equipment',
    30,
    'each',
    150.00,
    4500.00,
    'West Marine',
    'USCG Type I, Adult Universal Size',
    'Replace aging life vests for crew safety'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440003',
    'First Aid Kits',
    'Comprehensive marine first aid kits',
    'equipment',
    5,
    'each',
    300.00,
    1500.00,
    'West Marine',
    'ANSI Class A Marine First Aid Kit',
    'Update first aid supplies for emergency response'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440003',
    'Emergency Communication Devices',
    'Waterproof emergency communication radios',
    'equipment',
    10,
    'each',
    600.00,
    6000.00,
    'West Marine',
    'Icom IC-M37 Handheld VHF Radio, Waterproof',
    'Reliable communication for emergency situations'
  );

-- Demo approval steps
INSERT INTO public.procurement_approval_steps (
  id,
  request_id,
  approver_id,
  step_order,
  status,
  approved_at,
  notes
) VALUES
  -- Camera Equipment Approval (submitted, pending approval)
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.users WHERE email = 'quartermaster@ghxstship.com' LIMIT 1),
    1,
    'pending',
    NULL,
    NULL
  ),
  -- Catering Services Approval (approved)
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.users WHERE email = 'captain@ghxstship.com' LIMIT 1),
    1,
    'approved',
    NOW() - INTERVAL '1 day',
    'Approved for production needs. Ensure dietary accommodations are properly handled.'
  );

-- Demo activity logs
INSERT INTO public.procurement_request_activity (
  request_id,
  user_id,
  action,
  description,
  metadata,
  created_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.users WHERE email = 'captain@ghxstship.com' LIMIT 1),
    'created',
    'Request created',
    '{"status": "draft"}',
    NOW() - INTERVAL '2 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.users WHERE email = 'captain@ghxstship.com' LIMIT 1),
    'submitted',
    'Status changed from draft to submitted',
    '{"old_status": "draft", "new_status": "submitted"}',
    NOW() - INTERVAL '2 days' + INTERVAL '1 hour'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.users WHERE email = 'quartermaster@ghxstship.com' LIMIT 1),
    'created',
    'Request created',
    '{"status": "draft"}',
    NOW() - INTERVAL '5 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.users WHERE email = 'quartermaster@ghxstship.com' LIMIT 1),
    'submitted',
    'Status changed from draft to submitted',
    '{"old_status": "draft", "new_status": "submitted"}',
    NOW() - INTERVAL '4 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.users WHERE email = 'captain@ghxstship.com' LIMIT 1),
    'approved',
    'Status changed from submitted to approved',
    '{"old_status": "submitted", "new_status": "approved"}',
    NOW() - INTERVAL '1 day'
  );

-- Demo approval policy
INSERT INTO public.procurement_approval_policies (
  id,
  organization_id,
  name,
  description,
  conditions,
  approval_steps,
  is_active
) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.organizations WHERE name = 'GHXSTSHIP — Blackwater Fleet' LIMIT 1),
    'Standard Procurement Approval',
    'Standard approval workflow for procurement requests',
    '{"estimated_total": {"min": 0, "max": 50000}, "categories": ["equipment", "supplies", "services"]}',
    '[
      {"step": 1, "role": "manager", "description": "Department manager approval"},
      {"step": 2, "role": "admin", "description": "Finance approval for requests over $10,000", "conditions": {"estimated_total": {"min": 10000}}}
    ]',
    true
  );
