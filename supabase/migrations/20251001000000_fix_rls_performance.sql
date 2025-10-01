-- Migration: Fix RLS Performance Issues
-- Description: Wrap auth.uid() calls in subselects to avoid re-evaluation per row
-- Issue: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Helper function to get current user's organizations
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id 
  FROM memberships 
  WHERE user_id = auth.uid() 
  AND status = 'active';
$$;

-- Helper function to check if user has role in org
CREATE OR REPLACE FUNCTION public.user_has_org_role(org_id uuid, required_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM memberships 
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND status = 'active'
    AND role = ANY(required_roles)
  );
$$;

-- Now update all policies to use (select auth.uid())
-- This prevents re-evaluation per row

-- PROJECTS
DROP POLICY IF EXISTS "Project creators and managers can update projects" ON projects;
CREATE POLICY "Project creators and managers can update projects" ON projects FOR UPDATE
USING (
  organization_id IN (SELECT get_user_org_ids())
  AND user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])
  OR created_by = (SELECT auth.uid())
);

-- TASKS
DROP POLICY IF EXISTS "Members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Owners and admins can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Task assignees and managers can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks in their organizations" ON tasks;

CREATE POLICY "Members can create tasks" ON tasks FOR INSERT
WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can delete tasks" ON tasks FOR DELETE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Task assignees and managers can update tasks" ON tasks FOR UPDATE
USING (
  user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])
  OR assignee_id = (SELECT auth.uid())
);

CREATE POLICY "Users can view tasks in their organizations" ON tasks FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- MEMBERSHIPS  
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON memberships;
CREATE POLICY "Users can view memberships in their organizations" ON memberships FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- OPENDECK CONVERSATIONS
DROP POLICY IF EXISTS "Users can create conversations" ON opendeck_conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON opendeck_conversations;

CREATE POLICY "Users can create conversations" ON opendeck_conversations FOR INSERT
WITH CHECK (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their conversations" ON opendeck_conversations FOR SELECT
USING (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()));

-- OPENDECK MESSAGES
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON opendeck_messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON opendeck_messages;

CREATE POLICY "Users can send messages in their conversations" ON opendeck_messages FOR INSERT
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM opendeck_conversations 
    WHERE id = conversation_id 
    AND (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()))
  )
);

CREATE POLICY "Users can view messages in their conversations" ON opendeck_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM opendeck_conversations 
    WHERE id = conversation_id 
    AND (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()))
  )
);

-- OPENDECK TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their transactions" ON opendeck_transactions;
CREATE POLICY "Users can view their transactions" ON opendeck_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM opendeck_contracts 
    WHERE id = contract_id 
    AND (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()))
  )
);

-- OPENDECK REVIEWS
DROP POLICY IF EXISTS "Users can create reviews for completed contracts" ON opendeck_reviews;
CREATE POLICY "Users can create reviews for completed contracts" ON opendeck_reviews FOR INSERT
WITH CHECK (
  reviewer_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM opendeck_contracts 
    WHERE id = contract_id 
    AND status = 'completed'
    AND (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()))
  )
);

-- OPENDECK NOTIFICATIONS
DROP POLICY IF EXISTS "Users can update their own notifications" ON opendeck_notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON opendeck_notifications;

CREATE POLICY "Users can update their own notifications" ON opendeck_notifications FOR UPDATE
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own notifications" ON opendeck_notifications FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- OPENDECK SAVED SEARCHES
DROP POLICY IF EXISTS "Users can manage their saved searches" ON opendeck_saved_searches;
CREATE POLICY "Users can manage their saved searches" ON opendeck_saved_searches FOR ALL
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- OPENDECK VENDOR LISTS
DROP POLICY IF EXISTS "Users can manage their vendor lists" ON opendeck_vendor_lists;
CREATE POLICY "Users can manage their vendor lists" ON opendeck_vendor_lists FOR ALL
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- OPENDECK VENDOR LIST ITEMS
DROP POLICY IF EXISTS "Users can manage items in their lists" ON opendeck_vendor_list_items;
CREATE POLICY "Users can manage items in their lists" ON opendeck_vendor_list_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM opendeck_vendor_lists 
    WHERE id = list_id 
    AND user_id = (SELECT auth.uid())
  )
);

-- OPENDECK DISPUTES
DROP POLICY IF EXISTS "Parties can view their disputes" ON opendeck_disputes;
CREATE POLICY "Parties can view their disputes" ON opendeck_disputes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM opendeck_contracts 
    WHERE id = contract_id 
    AND (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()))
  )
);

-- OPENDECK ANALYTICS
DROP POLICY IF EXISTS "Authenticated users can write analytics" ON opendeck_analytics;
CREATE POLICY "Authenticated users can write analytics" ON opendeck_analytics FOR INSERT
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- OPENDECK EARNINGS
DROP POLICY IF EXISTS "Vendors can view their earnings" ON opendeck_earnings;
CREATE POLICY "Vendors can view their earnings" ON opendeck_earnings FOR SELECT
USING (vendor_id = (SELECT auth.uid()));

-- Continue with remaining tables...
-- (Similar pattern for all other tables mentioned in the linter warnings)


-- EVENTS
DROP POLICY IF EXISTS "Managers can update events" ON events;
DROP POLICY IF EXISTS "Members can create events" ON events;
DROP POLICY IF EXISTS "Owners and admins can delete events" ON events;
DROP POLICY IF EXISTS "Users can view events in their organizations" ON events;

CREATE POLICY "Members can create events" ON events FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE organization_id IN (SELECT get_user_org_ids())
  )
);

CREATE POLICY "Managers can update events" ON events FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM projects p 
    WHERE user_has_org_role(p.organization_id, ARRAY['owner', 'admin', 'manager'])
  )
);

CREATE POLICY "Owners and admins can delete events" ON events FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM projects p 
    WHERE user_has_org_role(p.organization_id, ARRAY['owner', 'admin'])
  )
);

CREATE POLICY "Users can view events in their organizations" ON events FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE organization_id IN (SELECT get_user_org_ids())
  )
);

-- SPACES
DROP POLICY IF EXISTS "Users can view spaces in their organizations" ON spaces;
CREATE POLICY "Users can view spaces in their organizations" ON spaces FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- MANNING SLOTS
DROP POLICY IF EXISTS "Managers can create manning slots" ON manning_slots;
DROP POLICY IF EXISTS "Managers can update manning slots" ON manning_slots;
DROP POLICY IF EXISTS "Owners and admins can delete manning slots" ON manning_slots;
DROP POLICY IF EXISTS "Users can view manning slots in their organizations" ON manning_slots;

CREATE POLICY "Managers can create manning slots" ON manning_slots FOR INSERT
WITH CHECK (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Managers can update manning slots" ON manning_slots FOR UPDATE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Owners and admins can delete manning slots" ON manning_slots FOR DELETE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Users can view manning slots in their organizations" ON manning_slots FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- PAYMENTS
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
DROP POLICY IF EXISTS "Users can view payments in their organizations" ON payments;

CREATE POLICY "Service role can manage payments" ON payments FOR ALL
USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Users can view payments in their organizations" ON payments FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- ORGANIZATION DOMAINS
DROP POLICY IF EXISTS "Users can view org domains in their organizations" ON organization_domains;
CREATE POLICY "Users can view org domains in their organizations" ON organization_domains FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- AUDIT LOGS
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs in their organizations" ON audit_logs;

CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT
WITH CHECK ((SELECT auth.role()) IN ('service_role', 'authenticated'));

CREATE POLICY "Users can view audit logs in their organizations" ON audit_logs FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- OPENDECK VENDOR PROFILES
DROP POLICY IF EXISTS "Users can manage their own vendor profile" ON opendeck_vendor_profiles;
CREATE POLICY "Users can manage their own vendor profile" ON opendeck_vendor_profiles FOR ALL
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- OPENDECK PORTFOLIO ITEMS
DROP POLICY IF EXISTS "Vendors can manage their own portfolio" ON opendeck_portfolio_items;
CREATE POLICY "Vendors can manage their own portfolio" ON opendeck_portfolio_items FOR ALL
USING (
  vendor_profile_id IN (
    SELECT id FROM opendeck_vendor_profiles WHERE user_id = (SELECT auth.uid())
  )
);

-- OPENDECK SERVICES
DROP POLICY IF EXISTS "Vendors can manage their own services" ON opendeck_services;
CREATE POLICY "Vendors can manage their own services" ON opendeck_services FOR ALL
USING (
  vendor_profile_id IN (
    SELECT id FROM opendeck_vendor_profiles WHERE user_id = (SELECT auth.uid())
  )
);

-- OPENDECK PROJECTS
DROP POLICY IF EXISTS "Clients can manage their own projects" ON opendeck_projects;
CREATE POLICY "Clients can manage their own projects" ON opendeck_projects FOR ALL
USING (client_id = (SELECT auth.uid()))
WITH CHECK (client_id = (SELECT auth.uid()));

-- OPENDECK PROPOSALS
DROP POLICY IF EXISTS "Clients can view proposals for their projects" ON opendeck_proposals;
DROP POLICY IF EXISTS "Vendors can manage their own proposals" ON opendeck_proposals;
DROP POLICY IF EXISTS "Vendors can view their own proposals" ON opendeck_proposals;

CREATE POLICY "Clients can view proposals for their projects" ON opendeck_proposals FOR SELECT
USING (
  project_id IN (
    SELECT id FROM opendeck_projects WHERE client_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Vendors can manage their own proposals" ON opendeck_proposals FOR ALL
USING (vendor_id = (SELECT auth.uid()))
WITH CHECK (vendor_id = (SELECT auth.uid()));

-- OPENDECK CONTRACTS
DROP POLICY IF EXISTS "Parties can update their contracts" ON opendeck_contracts;
DROP POLICY IF EXISTS "Parties can view their contracts" ON opendeck_contracts;

CREATE POLICY "Parties can update their contracts" ON opendeck_contracts FOR UPDATE
USING (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()));

CREATE POLICY "Parties can view their contracts" ON opendeck_contracts FOR SELECT
USING (client_id = (SELECT auth.uid()) OR vendor_id = (SELECT auth.uid()));

-- JOBS
DROP POLICY IF EXISTS "Job creators and managers can update jobs" ON jobs;
CREATE POLICY "Job creators and managers can update jobs" ON jobs FOR UPDATE
USING (
  user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])
  OR created_by = (SELECT auth.uid())
);

-- OPPORTUNITIES
DROP POLICY IF EXISTS "Users can view opportunities in their organizations" ON opportunities;
CREATE POLICY "Users can view opportunities in their organizations" ON opportunities FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- INVOICES
DROP POLICY IF EXISTS "Users can view invoices in their organizations" ON invoices;
CREATE POLICY "Users can view invoices in their organizations" ON invoices FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- BIDS
DROP POLICY IF EXISTS "Managers can update bids" ON bids;
DROP POLICY IF EXISTS "Members can create bids" ON bids;
DROP POLICY IF EXISTS "Owners and admins can delete bids" ON bids;
DROP POLICY IF EXISTS "Users can view bids for opportunities in their organizations" ON bids;

CREATE POLICY "Members can create bids" ON bids FOR INSERT
WITH CHECK (
  opportunity_id IN (
    SELECT id FROM opportunities WHERE organization_id IN (SELECT get_user_org_ids())
  )
);

CREATE POLICY "Managers can update bids" ON bids FOR UPDATE
USING (
  opportunity_id IN (
    SELECT o.id FROM opportunities o 
    WHERE user_has_org_role(o.organization_id, ARRAY['owner', 'admin', 'manager'])
  )
);

CREATE POLICY "Owners and admins can delete bids" ON bids FOR DELETE
USING (
  opportunity_id IN (
    SELECT o.id FROM opportunities o 
    WHERE user_has_org_role(o.organization_id, ARRAY['owner', 'admin'])
  )
);

CREATE POLICY "Users can view bids for opportunities in their organizations" ON bids FOR SELECT
USING (
  opportunity_id IN (
    SELECT id FROM opportunities WHERE organization_id IN (SELECT get_user_org_ids())
  )
);

-- TRAININGS
DROP POLICY IF EXISTS "Users can view trainings in their organizations" ON trainings;
CREATE POLICY "Users can view trainings in their organizations" ON trainings FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- ORGANIZATION ENTITLEMENTS
DROP POLICY IF EXISTS "Owners and admins can manage org entitlements" ON organization_entitlements;
DROP POLICY IF EXISTS "Users can view org entitlements in their organizations" ON organization_entitlements;

CREATE POLICY "Owners and admins can manage org entitlements" ON organization_entitlements FOR ALL
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Users can view org entitlements in their organizations" ON organization_entitlements FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- USER ENTITLEMENTS
DROP POLICY IF EXISTS "System can manage user entitlements" ON user_entitlements;
DROP POLICY IF EXISTS "Users can update their own entitlements" ON user_entitlements;
DROP POLICY IF EXISTS "Users can view their own entitlements" ON user_entitlements;

CREATE POLICY "System can manage user entitlements" ON user_entitlements FOR ALL
USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Users can update their own entitlements" ON user_entitlements FOR UPDATE
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own entitlements" ON user_entitlements FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- FILES
DROP POLICY IF EXISTS "File creators and admins can delete files" ON files;
DROP POLICY IF EXISTS "File creators and managers can update files" ON files;
DROP POLICY IF EXISTS "Users can view files in their organizations" ON files;

CREATE POLICY "File creators and admins can delete files" ON files FOR DELETE
USING (
  user_has_org_role(organization_id, ARRAY['owner', 'admin'])
  OR uploaded_by = (SELECT auth.uid())
);

CREATE POLICY "File creators and managers can update files" ON files FOR UPDATE
USING (
  user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])
  OR uploaded_by = (SELECT auth.uid())
);

CREATE POLICY "Users can view files in their organizations" ON files FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- RFPS
DROP POLICY IF EXISTS "Users can view rfps in their organizations" ON rfps;
CREATE POLICY "Users can view rfps in their organizations" ON rfps FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- PRODUCTS
DROP POLICY IF EXISTS "Users can view products in their organizations" ON products;
CREATE POLICY "Users can view products in their organizations" ON products FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- ORGANIZATION INVITES
DROP POLICY IF EXISTS "Owners and admins can manage org invites" ON organization_invites;
CREATE POLICY "Owners and admins can manage org invites" ON organization_invites FOR ALL
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

-- PROCUREMENT ORDERS
DROP POLICY IF EXISTS "Users can view procurement orders in their organizations" ON procurement_orders;
CREATE POLICY "Users can view procurement orders in their organizations" ON procurement_orders FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- FINANCE ACCOUNTS
DROP POLICY IF EXISTS "Users can view finance accounts in their organizations" ON finance_accounts;
CREATE POLICY "Users can view finance accounts in their organizations" ON finance_accounts FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- FINANCE TRANSACTIONS
DROP POLICY IF EXISTS "Users can view finance transactions in their organizations" ON finance_transactions;
CREATE POLICY "Users can view finance transactions in their organizations" ON finance_transactions FOR SELECT
USING (
  account_id IN (
    SELECT id FROM finance_accounts WHERE organization_id IN (SELECT get_user_org_ids())
  )
);

-- BUDGETS
DROP POLICY IF EXISTS "Managers can create budgets" ON budgets;
DROP POLICY IF EXISTS "Managers can update budgets" ON budgets;
DROP POLICY IF EXISTS "Owners and admins can delete budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view budgets in their organizations" ON budgets;

CREATE POLICY "Managers can create budgets" ON budgets FOR INSERT
WITH CHECK (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Managers can update budgets" ON budgets FOR UPDATE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Owners and admins can delete budgets" ON budgets FOR DELETE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Users can view budgets in their organizations" ON budgets FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- FORECASTS
DROP POLICY IF EXISTS "Managers can create forecasts" ON forecasts;
DROP POLICY IF EXISTS "Managers can update forecasts" ON forecasts;
DROP POLICY IF EXISTS "Owners and admins can delete forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can view forecasts in their organizations" ON forecasts;

CREATE POLICY "Managers can create forecasts" ON forecasts FOR INSERT
WITH CHECK (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Managers can update forecasts" ON forecasts FOR UPDATE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Owners and admins can delete forecasts" ON forecasts FOR DELETE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Users can view forecasts in their organizations" ON forecasts FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- LOCATIONS
DROP POLICY IF EXISTS "Managers can update locations" ON locations;
DROP POLICY IF EXISTS "Users can view locations in their organizations" ON locations;

CREATE POLICY "Managers can update locations" ON locations FOR UPDATE
USING (user_has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users can view locations in their organizations" ON locations FOR SELECT
USING (organization_id IN (SELECT get_user_org_ids()));

-- USER NAV PINS
DROP POLICY IF EXISTS "user_nav_pins_insert_self" ON user_nav_pins;
DROP POLICY IF EXISTS "user_nav_pins_select_self" ON user_nav_pins;
DROP POLICY IF EXISTS "user_nav_pins_update_self" ON user_nav_pins;

CREATE POLICY "user_nav_pins_insert_self" ON user_nav_pins FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "user_nav_pins_select_self" ON user_nav_pins FOR SELECT
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "user_nav_pins_update_self" ON user_nav_pins FOR UPDATE
USING (user_id = (SELECT auth.uid()));

-- ORGANIZATIONS
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations FOR SELECT
USING (id IN (SELECT get_user_org_ids()));

-- Add indexes to support the helper functions
CREATE INDEX IF NOT EXISTS idx_memberships_user_org_status 
ON memberships(user_id, organization_id, status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_memberships_org_user_role_status 
ON memberships(organization_id, user_id, role, status) 
WHERE status = 'active';

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_user_org_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_org_role(uuid, text[]) TO authenticated;

COMMENT ON MIGRATION IS 'Fixed RLS performance by wrapping auth functions in subselects and using helper functions';
