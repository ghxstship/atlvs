-- Add missing created_by column to organizations table
-- This column is needed for the onboarding flow to track who created the organization

BEGIN;

-- Add created_by column if it doesn't exist
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- Add updated_at column if it doesn't exist (for consistency)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS set_updated_at_organizations ON public.organizations;
CREATE TRIGGER set_updated_at_organizations
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create helper function to get auth user ID if current_user_id returns null
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT auth.uid();
$$;

-- Add policy to allow authenticated users to create their user profile
DROP POLICY IF EXISTS users_insert_self ON public.users;
CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Add policy to allow users to create organizations (without created_by requirement initially)
DROP POLICY IF EXISTS org_create ON public.organizations;
CREATE POLICY org_create ON public.organizations
  FOR INSERT WITH CHECK (true);

-- Add policy to allow anyone to update organizations temporarily (for setting created_by)
DROP POLICY IF EXISTS org_update ON public.organizations;
CREATE POLICY org_update ON public.organizations
  FOR UPDATE USING (true);

-- Add policy to allow authenticated users to create memberships
DROP POLICY IF EXISTS membership_create ON public.memberships;
CREATE POLICY membership_create ON public.memberships
  FOR INSERT WITH CHECK (
    user_id = public.current_user_id()
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = memberships.organization_id
        AND m.user_id = public.current_user_id()
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

COMMIT;
