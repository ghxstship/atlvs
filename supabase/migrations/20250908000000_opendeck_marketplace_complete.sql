-- OPENDECK Complete Marketplace Schema
-- Full-service digital marketplace for live and experiential entertainment

-- ============================================
-- VENDOR PROFILES & PORTFOLIOS
-- ============================================

-- Enhanced vendor profiles with complete business information
CREATE TABLE IF NOT EXISTS public.opendeck_vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('individual', 'company', 'agency')),
  tax_id TEXT,
  vat_number TEXT,
  
  -- Profile Details
  display_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Contact & Location
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address JSONB, -- {street, city, state, postal_code, country}
  timezone TEXT DEFAULT 'UTC',
  languages TEXT[], -- ['en', 'es', 'fr']
  
  -- Professional Details
  years_experience INTEGER,
  team_size INTEGER,
  hourly_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Categories & Skills
  primary_category TEXT NOT NULL,
  categories TEXT[],
  skills TEXT[],
  certifications JSONB[], -- [{name, issuer, date, expiry, url}]
  
  -- Availability
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  response_time TEXT, -- '1 hour', '1 day', etc
  
  -- Reputation
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items showcasing past work
CREATE TABLE IF NOT EXISTS public.opendeck_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  
  -- Media
  thumbnail_url TEXT,
  media_urls TEXT[], -- images, videos
  video_embed_url TEXT,
  
  -- Project Details
  client_name TEXT,
  project_date DATE,
  project_duration TEXT,
  project_value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Status
  featured BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICE PACKAGES & OFFERINGS
-- ============================================

-- Service packages offered by vendors
CREATE TABLE IF NOT EXISTS public.opendeck_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id) ON DELETE CASCADE,
  
  -- Service Details
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  
  -- Pricing
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('fixed', 'hourly', 'daily', 'project', 'custom')),
  base_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Package Tiers (Basic, Standard, Premium)
  packages JSONB, -- [{name, price, description, features, delivery_time}]
  
  -- Delivery
  delivery_time TEXT NOT NULL, -- '3 days', '1 week', etc
  revisions_included INTEGER DEFAULT 1,
  express_delivery BOOLEAN DEFAULT FALSE,
  express_price DECIMAL(10,2),
  
  -- Requirements
  requirements_form JSONB, -- Custom form fields for buyer requirements
  
  -- Media
  thumbnail_url TEXT,
  gallery_urls TEXT[],
  video_url TEXT,
  
  -- Stats
  views INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Status
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT PROJECTS & BRIEFS
-- ============================================

-- Project postings by clients
CREATE TABLE IF NOT EXISTS public.opendeck_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Project Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  
  -- Requirements
  scope TEXT NOT NULL,
  deliverables JSONB[], -- [{title, description, due_date}]
  skills_required TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  
  -- Budget & Timeline
  budget_type TEXT NOT NULL CHECK (budget_type IN ('fixed', 'hourly', 'not_specified')),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  
  start_date DATE,
  end_date DATE,
  duration TEXT,
  is_urgent BOOLEAN DEFAULT FALSE,
  
  -- Location
  location_type TEXT CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  location JSONB, -- {city, state, country}
  
  -- Attachments
  attachments JSONB[], -- [{name, url, size, type}]
  
  -- Visibility & Matching
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  invited_vendors UUID[], -- Specific vendors invited to bid
  
  -- Stats
  views INTEGER DEFAULT 0,
  proposals_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPOSALS & BIDDING
-- ============================================

-- Proposals/bids from vendors on projects
CREATE TABLE IF NOT EXISTS public.opendeck_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES opendeck_projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id) ON DELETE CASCADE,
  
  -- Proposal Details
  cover_letter TEXT NOT NULL,
  approach TEXT,
  
  -- Pricing
  bid_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  fee_type TEXT CHECK (fee_type IN ('fixed', 'hourly')),
  hourly_rate DECIMAL(10,2),
  estimated_hours INTEGER,
  
  -- Timeline
  proposed_timeline TEXT NOT NULL,
  milestones JSONB[], -- [{title, description, amount, duration}]
  start_availability DATE,
  
  -- Attachments
  portfolio_items UUID[], -- References to portfolio items
  attachments JSONB[], -- [{name, url, size, type}]
  
  -- Questions to client
  questions TEXT,
  
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  
  -- Client interaction
  client_viewed BOOLEAN DEFAULT FALSE,
  client_viewed_at TIMESTAMPTZ,
  shortlisted BOOLEAN DEFAULT FALSE,
  shortlisted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRACTS & AGREEMENTS
-- ============================================

-- Contracts between clients and vendors
CREATE TABLE IF NOT EXISTS public.opendeck_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES opendeck_projects(id),
  proposal_id UUID REFERENCES opendeck_proposals(id),
  client_id UUID NOT NULL REFERENCES users(id),
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Contract Details
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT CHECK (contract_type IN ('fixed', 'hourly', 'retainer', 'milestone')),
  
  -- Terms
  scope_of_work TEXT NOT NULL,
  deliverables JSONB[], -- [{title, description, due_date, amount}]
  terms_conditions TEXT,
  
  -- Financial
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_schedule TEXT,
  milestones JSONB[], -- [{title, amount, due_date, status}]
  
  -- Escrow
  escrow_enabled BOOLEAN DEFAULT TRUE,
  escrow_amount DECIMAL(12,2),
  escrow_released DECIMAL(12,2) DEFAULT 0,
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Signatures
  client_signed BOOLEAN DEFAULT FALSE,
  client_signed_at TIMESTAMPTZ,
  vendor_signed BOOLEAN DEFAULT FALSE,
  vendor_signed_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'terminated', 'disputed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Vendor Profiles
CREATE INDEX idx_vendor_profiles_user ON opendeck_vendor_profiles(user_id);
CREATE INDEX idx_vendor_profiles_org ON opendeck_vendor_profiles(organization_id);
CREATE INDEX idx_vendor_profiles_status ON opendeck_vendor_profiles(status);
CREATE INDEX idx_vendor_profiles_category ON opendeck_vendor_profiles(primary_category);
CREATE INDEX idx_vendor_profiles_rating ON opendeck_vendor_profiles(rating DESC);

-- Services
CREATE INDEX idx_services_vendor ON opendeck_services(vendor_id);
CREATE INDEX idx_services_category ON opendeck_services(category);
CREATE INDEX idx_services_status ON opendeck_services(status);

-- Projects
CREATE INDEX idx_projects_client ON opendeck_projects(client_id);
CREATE INDEX idx_projects_org ON opendeck_projects(organization_id);
CREATE INDEX idx_projects_status ON opendeck_projects(status);
CREATE INDEX idx_projects_category ON opendeck_projects(category);

-- Proposals
CREATE INDEX idx_proposals_project ON opendeck_proposals(project_id);
CREATE INDEX idx_proposals_vendor ON opendeck_proposals(vendor_id);
CREATE INDEX idx_proposals_status ON opendeck_proposals(status);

-- Contracts
CREATE INDEX idx_contracts_client ON opendeck_contracts(client_id);
CREATE INDEX idx_contracts_vendor ON opendeck_contracts(vendor_id);
CREATE INDEX idx_contracts_status ON opendeck_contracts(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE opendeck_vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_contracts ENABLE ROW LEVEL SECURITY;

-- Vendor Profiles - Users can view public profiles, edit their own
CREATE POLICY vendor_profiles_select ON opendeck_vendor_profiles
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY vendor_profiles_insert ON opendeck_vendor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY vendor_profiles_update ON opendeck_vendor_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Portfolio Items - Public viewing, vendor editing
CREATE POLICY portfolio_select ON opendeck_portfolio_items
  FOR SELECT USING (
    visibility = 'public' OR 
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY portfolio_insert ON opendeck_portfolio_items
  FOR INSERT WITH CHECK (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY portfolio_update ON opendeck_portfolio_items
  FOR UPDATE USING (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

-- Services - Public viewing, vendor editing
CREATE POLICY services_select ON opendeck_services
  FOR SELECT USING (
    status = 'active' OR 
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY services_insert ON opendeck_services
  FOR INSERT WITH CHECK (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY services_update ON opendeck_services
  FOR UPDATE USING (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

-- Projects - Visibility based on status and ownership
CREATE POLICY projects_select ON opendeck_projects
  FOR SELECT USING (
    visibility = 'public' OR 
    client_id = auth.uid() OR
    id IN (SELECT project_id FROM opendeck_proposals WHERE vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY projects_insert ON opendeck_projects
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY projects_update ON opendeck_projects
  FOR UPDATE USING (client_id = auth.uid());

-- Proposals - Vendors see their own, clients see proposals on their projects
CREATE POLICY proposals_select ON opendeck_proposals
  FOR SELECT USING (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid()) OR
    project_id IN (SELECT id FROM opendeck_projects WHERE client_id = auth.uid())
  );

CREATE POLICY proposals_insert ON opendeck_proposals
  FOR INSERT WITH CHECK (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY proposals_update ON opendeck_proposals
  FOR UPDATE USING (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

-- Contracts - Both parties can view and update
CREATE POLICY contracts_select ON opendeck_contracts
  FOR SELECT USING (
    client_id = auth.uid() OR 
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY contracts_insert ON opendeck_contracts
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY contracts_update ON opendeck_contracts
  FOR UPDATE USING (
    client_id = auth.uid() OR 
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER set_vendor_profiles_updated_at BEFORE UPDATE ON opendeck_vendor_profiles 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_portfolio_items_updated_at BEFORE UPDATE ON opendeck_portfolio_items 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON opendeck_services 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON opendeck_projects 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_proposals_updated_at BEFORE UPDATE ON opendeck_proposals 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_contracts_updated_at BEFORE UPDATE ON opendeck_contracts 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
