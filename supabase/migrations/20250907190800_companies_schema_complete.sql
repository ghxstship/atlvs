-- Complete Companies Module Database Schema
-- Add missing fields to company_contracts and create company_qualifications, company_ratings, company_contacts tables

-- Extend company_contracts table with missing fields
ALTER TABLE public.company_contracts 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'other' CHECK (type IN ('msa', 'sow', 'nda', 'service_agreement', 'purchase_order', 'other')),
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS value numeric(14,2),
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD' CHECK (length(currency) = 3),
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS renewal_date date,
ADD COLUMN IF NOT EXISTS auto_renewal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_terms text,
ADD COLUMN IF NOT EXISTS terms text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Update company_contracts status check constraint
ALTER TABLE public.company_contracts DROP CONSTRAINT IF EXISTS company_contracts_status_check;
ALTER TABLE public.company_contracts ADD CONSTRAINT company_contracts_status_check 
CHECK (status IN ('draft', 'pending', 'active', 'expired', 'terminated', 'renewed'));

-- Create company_qualifications table
CREATE TABLE IF NOT EXISTS public.company_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('certification', 'license', 'insurance', 'bond', 'safety', 'other')),
  name text NOT NULL,
  description text,
  issuing_authority text,
  certificate_number text,
  issue_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'revoked')),
  document_url text,
  verified_date date,
  verified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create company_ratings table
CREATE TABLE IF NOT EXISTS public.company_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('overall', 'quality', 'timeliness', 'communication', 'value', 'safety', 'other')),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  reviewer_name text,
  reviewer_title text,
  is_recommended boolean DEFAULT false,
  is_public boolean DEFAULT false,
  strengths text[],
  improvements text[],
  would_hire_again boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create company_contacts table
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  email text,
  phone text,
  department text,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_company_contracts_updated_at ON public.company_contracts;
CREATE TRIGGER update_company_contracts_updated_at
  BEFORE UPDATE ON public.company_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_qualifications_updated_at ON public.company_qualifications;
CREATE TRIGGER update_company_qualifications_updated_at
  BEFORE UPDATE ON public.company_qualifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_ratings_updated_at ON public.company_ratings;
CREATE TRIGGER update_company_ratings_updated_at
  BEFORE UPDATE ON public.company_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_contacts_updated_at ON public.company_contacts;
CREATE TRIGGER update_company_contacts_updated_at
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.company_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_qualifications
CREATE POLICY company_qualifications_read ON public.company_qualifications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_qualifications.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_qualifications_insert ON public.company_qualifications FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_qualifications.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_qualifications_update ON public.company_qualifications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_qualifications.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_qualifications.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_qualifications_delete ON public.company_qualifications FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_qualifications.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Create RLS policies for company_ratings
CREATE POLICY company_ratings_read ON public.company_ratings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_ratings.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_ratings_insert ON public.company_ratings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_ratings.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_ratings_update ON public.company_ratings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_ratings.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_ratings.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_ratings_delete ON public.company_ratings FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_ratings.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Create RLS policies for company_contacts
CREATE POLICY company_contacts_read ON public.company_contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contacts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_contacts_insert ON public.company_contacts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contacts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_contacts_update ON public.company_contacts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contacts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contacts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

CREATE POLICY company_contacts_delete ON public.company_contacts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contacts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_qualifications_organization_id ON public.company_qualifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_company_qualifications_company_id ON public.company_qualifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_qualifications_type ON public.company_qualifications(type);
CREATE INDEX IF NOT EXISTS idx_company_qualifications_status ON public.company_qualifications(status);
CREATE INDEX IF NOT EXISTS idx_company_qualifications_expiry_date ON public.company_qualifications(expiry_date);

CREATE INDEX IF NOT EXISTS idx_company_ratings_organization_id ON public.company_ratings(organization_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_company_id ON public.company_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_project_id ON public.company_ratings(project_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_category ON public.company_ratings(category);
CREATE INDEX IF NOT EXISTS idx_company_ratings_rating ON public.company_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_company_contacts_organization_id ON public.company_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company_id ON public.company_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_is_primary ON public.company_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_company_contacts_is_active ON public.company_contacts(is_active);

-- Add additional indexes for company_contracts
CREATE INDEX IF NOT EXISTS idx_company_contracts_type ON public.company_contracts(type);
CREATE INDEX IF NOT EXISTS idx_company_contracts_status ON public.company_contracts(status);
CREATE INDEX IF NOT EXISTS idx_company_contracts_end_date ON public.company_contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_company_contracts_auto_renewal ON public.company_contracts(auto_renewal);

-- Add constraint to ensure only one primary contact per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_contacts_unique_primary 
ON public.company_contacts(company_id) 
WHERE is_primary = true;
