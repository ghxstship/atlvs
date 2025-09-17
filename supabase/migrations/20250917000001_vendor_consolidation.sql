-- Vendor Consolidation Migration
-- Adds context tracking to vendor profiles for unified vendor management

-- Add vendor_contexts column to track where vendors are used
ALTER TABLE public.opendeck_vendor_profiles
ADD COLUMN IF NOT EXISTS vendor_contexts TEXT[] DEFAULT '{}';

-- Add indexes for context filtering
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_contexts 
ON public.opendeck_vendor_profiles USING GIN (vendor_contexts);

-- Add payment terms column for procurement context
ALTER TABLE public.opendeck_vendor_profiles
ADD COLUMN IF NOT EXISTS payment_terms TEXT;

-- Add procurement-specific fields
ALTER TABLE public.opendeck_vendor_profiles
ADD COLUMN IF NOT EXISTS procurement_status TEXT DEFAULT 'pending' 
  CHECK (procurement_status IN ('pending', 'approved', 'suspended', 'rejected'));

ALTER TABLE public.opendeck_vendor_profiles
ADD COLUMN IF NOT EXISTS procurement_approved_date TIMESTAMPTZ;

ALTER TABLE public.opendeck_vendor_profiles
ADD COLUMN IF NOT EXISTS procurement_approved_by UUID REFERENCES users(id);

-- Create a view for procurement vendors
CREATE OR REPLACE VIEW public.procurement_vendors_view AS
SELECT 
  id,
  organization_id,
  business_name,
  display_name,
  business_type,
  email,
  phone,
  website,
  address,
  primary_category,
  categories,
  skills,
  hourly_rate,
  currency,
  tax_id,
  vat_number,
  payment_terms,
  rating,
  total_reviews,
  total_projects,
  status,
  procurement_status,
  procurement_approved_date,
  procurement_approved_by,
  created_at,
  updated_at
FROM public.opendeck_vendor_profiles
WHERE 'procurement' = ANY(vendor_contexts)
  AND status = 'active';

-- Create a view for marketplace vendors
CREATE OR REPLACE VIEW public.marketplace_vendors_view AS
SELECT 
  id,
  user_id,
  organization_id,
  business_name,
  display_name,
  business_type,
  bio,
  tagline,
  avatar_url,
  cover_image_url,
  email,
  phone,
  website,
  address,
  primary_category,
  categories,
  skills,
  certifications,
  years_experience,
  team_size,
  hourly_rate,
  currency,
  availability_status,
  response_time,
  rating,
  total_reviews,
  total_projects,
  total_earnings,
  success_rate,
  verified,
  featured,
  status,
  created_at,
  updated_at
FROM public.opendeck_vendor_profiles
WHERE 'marketplace' = ANY(vendor_contexts)
  AND status = 'active';

-- Update existing vendors to have appropriate contexts
-- Set all existing vendors to have marketplace context by default
UPDATE public.opendeck_vendor_profiles
SET vendor_contexts = array_append(vendor_contexts, 'marketplace')
WHERE NOT ('marketplace' = ANY(vendor_contexts));

-- Add comment for documentation
COMMENT ON COLUMN public.opendeck_vendor_profiles.vendor_contexts IS 
'Array of contexts where this vendor is used: marketplace, procurement, internal';

COMMENT ON COLUMN public.opendeck_vendor_profiles.procurement_status IS 
'Approval status for procurement context: pending, approved, suspended, rejected';

-- Grant permissions on views
GRANT SELECT ON public.procurement_vendors_view TO authenticated;
GRANT SELECT ON public.marketplace_vendors_view TO authenticated;

-- Add RLS policies for the views
ALTER TABLE public.opendeck_vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policy to include organization context
DROP POLICY IF EXISTS vendor_profiles_select ON public.opendeck_vendor_profiles;
CREATE POLICY vendor_profiles_select ON public.opendeck_vendor_profiles
  FOR SELECT USING (
    status = 'active' 
    OR user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add trigger to automatically set vendor contexts based on creation source
CREATE OR REPLACE FUNCTION public.set_vendor_context()
RETURNS TRIGGER AS $$
BEGIN
  -- If vendor_contexts is empty, set default based on other fields
  IF NEW.vendor_contexts IS NULL OR array_length(NEW.vendor_contexts, 1) IS NULL THEN
    -- Default to marketplace context
    NEW.vendor_contexts := ARRAY['marketplace'];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vendor_context_trigger
BEFORE INSERT ON public.opendeck_vendor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_vendor_context();
