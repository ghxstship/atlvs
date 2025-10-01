-- Migration: Add missing indexes for foreign keys
-- Date: 2025-01-01
-- Description: Adds covering indexes for foreign key constraints to improve query performance

-- Comment Reactions
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON public.comment_reactions(user_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_resolved_by ON public.comments(resolved_by);

-- Files
CREATE INDEX IF NOT EXISTS idx_files_created_by ON public.files(created_by);

-- Locations
CREATE INDEX IF NOT EXISTS idx_locations_created_by ON public.locations(created_by);

-- OpenDeck Contracts
CREATE INDEX IF NOT EXISTS idx_opendeck_contracts_client_id ON public.opendeck_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_opendeck_contracts_proposal_id ON public.opendeck_contracts(proposal_id);

-- OpenDeck Disputes
CREATE INDEX IF NOT EXISTS idx_opendeck_disputes_initiated_by ON public.opendeck_disputes(initiated_by);
CREATE INDEX IF NOT EXISTS idx_opendeck_disputes_resolved_by ON public.opendeck_disputes(resolved_by);

-- OpenDeck Earnings
CREATE INDEX IF NOT EXISTS idx_opendeck_earnings_transaction_id ON public.opendeck_earnings(transaction_id);

-- OpenDeck Projects
CREATE INDEX IF NOT EXISTS idx_opendeck_projects_hired_vendor_id ON public.opendeck_projects(hired_vendor_id);
CREATE INDEX IF NOT EXISTS idx_opendeck_projects_organization_id ON public.opendeck_projects(organization_id);

-- OpenDeck Transactions
CREATE INDEX IF NOT EXISTS idx_opendeck_transactions_client_id ON public.opendeck_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_opendeck_transactions_project_id ON public.opendeck_transactions(project_id);

-- OpenDeck Vendor Profiles
CREATE INDEX IF NOT EXISTS idx_opendeck_vendor_profiles_organization_id ON public.opendeck_vendor_profiles(organization_id);

-- Tags
CREATE INDEX IF NOT EXISTS idx_tags_created_by ON public.tags(created_by);

-- User Notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_organization_id ON public.user_notifications(organization_id);

-- User Permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON public.user_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_permissions_organization_id ON public.user_permissions(organization_id);

-- Add comments for documentation
COMMENT ON INDEX idx_comment_reactions_user_id IS 'Improves performance for user reaction lookups';
COMMENT ON INDEX idx_comments_resolved_by IS 'Improves performance for resolved comment queries';
COMMENT ON INDEX idx_files_created_by IS 'Improves performance for file creator lookups';
COMMENT ON INDEX idx_locations_created_by IS 'Improves performance for location creator lookups';
COMMENT ON INDEX idx_opendeck_contracts_client_id IS 'Improves performance for client contract lookups';
COMMENT ON INDEX idx_opendeck_contracts_proposal_id IS 'Improves performance for proposal contract lookups';
COMMENT ON INDEX idx_opendeck_disputes_initiated_by IS 'Improves performance for dispute initiator lookups';
COMMENT ON INDEX idx_opendeck_disputes_resolved_by IS 'Improves performance for dispute resolver lookups';
COMMENT ON INDEX idx_opendeck_earnings_transaction_id IS 'Improves performance for earnings transaction lookups';
COMMENT ON INDEX idx_opendeck_projects_hired_vendor_id IS 'Improves performance for hired vendor lookups';
COMMENT ON INDEX idx_opendeck_projects_organization_id IS 'Improves performance for organization project lookups';
COMMENT ON INDEX idx_opendeck_transactions_client_id IS 'Improves performance for client transaction lookups';
COMMENT ON INDEX idx_opendeck_transactions_project_id IS 'Improves performance for project transaction lookups';
COMMENT ON INDEX idx_opendeck_vendor_profiles_organization_id IS 'Improves performance for organization vendor lookups';
COMMENT ON INDEX idx_tags_created_by IS 'Improves performance for tag creator lookups';
COMMENT ON INDEX idx_user_notifications_organization_id IS 'Improves performance for organization notification lookups';
COMMENT ON INDEX idx_user_permissions_granted_by IS 'Improves performance for permission granter lookups';
COMMENT ON INDEX idx_user_permissions_organization_id IS 'Improves performance for organization permission lookups';
