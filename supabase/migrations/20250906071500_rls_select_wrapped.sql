-- RLS policy conversions to wrap auth.* calls in SELECT to avoid per-row re-evaluation
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- organization_entitlements: org_entitlements_modify
DROP POLICY IF EXISTS org_entitlements_modify ON public.organization_entitlements;
CREATE POLICY org_entitlements_modify
ON public.organization_entitlements
AS PERMISSIVE
FOR ALL
TO public
USING (
  ((SELECT auth.role()) = 'service_role') OR EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_entitlements.organization_id
      AND m.user_id = current_user_id()
      AND m.status = 'active'
      AND m.role = ANY (ARRAY['owner','admin'])
  )
)
WITH CHECK (
  ((SELECT auth.role()) = 'service_role') OR EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_entitlements.organization_id
      AND m.user_id = current_user_id()
      AND m.status = 'active'
      AND m.role = ANY (ARRAY['owner','admin'])
  )
);

-- organization_invites: org_invites_modify
DROP POLICY IF EXISTS org_invites_modify ON public.organization_invites;
CREATE POLICY org_invites_modify
ON public.organization_invites
AS PERMISSIVE
FOR ALL
TO public
USING (
  ((SELECT auth.role()) = 'service_role') OR EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invites.organization_id
      AND m.user_id = current_user_id()
      AND m.status = 'active'
      AND m.role = ANY (ARRAY['owner','admin'])
  )
)
WITH CHECK (
  ((SELECT auth.role()) = 'service_role') OR EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = organization_invites.organization_id
      AND m.user_id = current_user_id()
      AND m.status = 'active'
      AND m.role = ANY (ARRAY['owner','admin'])
  )
);

-- payments: payments_modify
DROP POLICY IF EXISTS payments_modify ON public.payments;
CREATE POLICY payments_modify
ON public.payments
AS PERMISSIVE
FOR ALL
TO public
USING (((SELECT auth.role()) = 'service_role'))
WITH CHECK (((SELECT auth.role()) = 'service_role'));
