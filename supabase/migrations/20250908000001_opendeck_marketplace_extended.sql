-- OPENDECK Extended Marketplace Schema
-- Communication, Payments, Reviews, and Analytics

-- ============================================
-- COMMUNICATION & MESSAGING
-- ============================================

-- Conversation threads
CREATE TABLE IF NOT EXISTS public.opendeck_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  participants UUID[] NOT NULL, -- User IDs
  
  -- Context
  project_id UUID REFERENCES opendeck_projects(id),
  contract_id UUID REFERENCES opendeck_contracts(id),
  
  -- Thread Details
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages
CREATE TABLE IF NOT EXISTS public.opendeck_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES opendeck_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Message Content
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  
  -- Attachments
  attachments JSONB[], -- [{name, url, size, type}]
  
  -- Read receipts
  read_by UUID[], -- User IDs who have read the message
  
  -- Status
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS & ESCROW
-- ============================================

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.opendeck_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES opendeck_contracts(id),
  
  -- Parties
  payer_id UUID NOT NULL REFERENCES users(id),
  payee_id UUID NOT NULL REFERENCES users(id),
  
  -- Transaction Details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'milestone', 'bonus', 'refund', 'withdrawal')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Fees
  platform_fee DECIMAL(10,2) DEFAULT 0,
  processing_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  
  -- Payment Method
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  
  -- Escrow
  escrow_status TEXT CHECK (escrow_status IN ('held', 'released', 'refunded')),
  escrow_release_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow accounts for holding funds
CREATE TABLE IF NOT EXISTS public.opendeck_escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES opendeck_contracts(id),
  
  -- Balance
  total_deposited DECIMAL(12,2) DEFAULT 0,
  total_released DECIMAL(12,2) DEFAULT 0,
  current_balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Milestones
  milestones JSONB[], -- [{id, title, amount, status, release_date}]
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disputed', 'refunded')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

-- Reviews between clients and vendors
CREATE TABLE IF NOT EXISTS public.opendeck_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES opendeck_contracts(id),
  
  -- Reviewer & Reviewee
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('client_to_vendor', 'vendor_to_client')),
  
  -- Ratings (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  
  -- Review Content
  title TEXT,
  comment TEXT NOT NULL,
  
  -- Recommendation
  would_recommend BOOLEAN DEFAULT TRUE,
  would_hire_again BOOLEAN,
  
  -- Response
  response TEXT,
  response_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'disputed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS & ALERTS
-- ============================================

-- Marketplace-specific notifications
CREATE TABLE IF NOT EXISTS public.opendeck_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Notification Details
  type TEXT NOT NULL, -- 'new_proposal', 'message', 'contract_signed', 'payment_received', etc
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Context
  entity_type TEXT, -- 'project', 'proposal', 'contract', etc
  entity_id UUID,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEARCH & DISCOVERY
-- ============================================

-- Saved searches for clients and vendors
CREATE TABLE IF NOT EXISTS public.opendeck_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Search Details
  name TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('projects', 'vendors', 'services')),
  filters JSONB NOT NULL, -- {category, skills, budget_range, location, etc}
  
  -- Alerts
  email_alerts BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  last_alert_sent TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor collections/lists created by clients
CREATE TABLE IF NOT EXISTS public.opendeck_vendor_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Privacy
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors in lists
CREATE TABLE IF NOT EXISTS public.opendeck_vendor_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES opendeck_vendor_lists(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id),
  
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(list_id, vendor_id)
);

-- ============================================
-- DISPUTES & RESOLUTION
-- ============================================

-- Dispute cases
CREATE TABLE IF NOT EXISTS public.opendeck_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES opendeck_contracts(id),
  
  -- Parties
  initiator_id UUID NOT NULL REFERENCES users(id),
  respondent_id UUID NOT NULL REFERENCES users(id),
  
  -- Dispute Details
  reason TEXT NOT NULL CHECK (reason IN ('quality', 'timeline', 'payment', 'scope', 'communication', 'other')),
  description TEXT NOT NULL,
  requested_resolution TEXT,
  
  -- Evidence
  evidence JSONB[], -- [{type, description, url}]
  
  -- Resolution
  resolution_type TEXT CHECK (resolution_type IN ('mutual', 'platform_decision', 'refund', 'partial_refund', 'completion')),
  resolution_details TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & REPORTING
-- ============================================

-- Analytics events for marketplace activity
CREATE TABLE IF NOT EXISTS public.opendeck_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'view', 'click', 'proposal_sent', etc
  entity_type TEXT NOT NULL, -- 'project', 'service', 'vendor', etc
  entity_id UUID,
  
  -- User
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  
  -- Context
  metadata JSONB, -- Additional event-specific data
  
  -- Source
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor earnings reports
CREATE TABLE IF NOT EXISTS public.opendeck_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES opendeck_vendor_profiles(id),
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Earnings
  gross_earnings DECIMAL(12,2) DEFAULT 0,
  platform_fees DECIMAL(12,2) DEFAULT 0,
  processing_fees DECIMAL(12,2) DEFAULT 0,
  net_earnings DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Breakdown
  projects_completed INTEGER DEFAULT 0,
  average_project_value DECIMAL(12,2),
  
  -- Payout
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date TIMESTAMPTZ,
  payout_method TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADDITIONAL INDEXES
-- ============================================

-- Messages
CREATE INDEX idx_messages_conversation ON opendeck_messages(conversation_id);
CREATE INDEX idx_messages_sender ON opendeck_messages(sender_id);
CREATE INDEX idx_messages_created ON opendeck_messages(created_at DESC);

-- Transactions
CREATE INDEX idx_transactions_contract ON opendeck_transactions(contract_id);
CREATE INDEX idx_transactions_payer ON opendeck_transactions(payer_id);
CREATE INDEX idx_transactions_payee ON opendeck_transactions(payee_id);
CREATE INDEX idx_transactions_status ON opendeck_transactions(status);

-- Reviews
CREATE INDEX idx_reviews_contract ON opendeck_reviews(contract_id);
CREATE INDEX idx_reviews_reviewee ON opendeck_reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON opendeck_reviews(overall_rating);

-- Notifications
CREATE INDEX idx_notifications_user ON opendeck_notifications(user_id);
CREATE INDEX idx_notifications_read ON opendeck_notifications(read);
CREATE INDEX idx_notifications_created ON opendeck_notifications(created_at DESC);

-- Disputes
CREATE INDEX idx_disputes_contract ON opendeck_disputes(contract_id);
CREATE INDEX idx_disputes_status ON opendeck_disputes(status);

-- Earnings
CREATE INDEX idx_earnings_vendor ON opendeck_earnings(vendor_id);
CREATE INDEX idx_earnings_period ON opendeck_earnings(period_start, period_end);

-- ============================================
-- ROW LEVEL SECURITY (CONTINUED)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE opendeck_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_vendor_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_vendor_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeck_earnings ENABLE ROW LEVEL SECURITY;

-- Conversations - Participants only
CREATE POLICY conversations_select ON opendeck_conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY conversations_insert ON opendeck_conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Messages - Conversation participants only
CREATE POLICY messages_select ON opendeck_messages
  FOR SELECT USING (
    conversation_id IN (SELECT id FROM opendeck_conversations WHERE auth.uid() = ANY(participants))
  );

CREATE POLICY messages_insert ON opendeck_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (SELECT id FROM opendeck_conversations WHERE auth.uid() = ANY(participants))
  );

-- Transactions - Parties involved only
CREATE POLICY transactions_select ON opendeck_transactions
  FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Escrow Accounts - Contract parties only
CREATE POLICY escrow_select ON opendeck_escrow_accounts
  FOR SELECT USING (
    contract_id IN (
      SELECT id FROM opendeck_contracts 
      WHERE client_id = auth.uid() OR 
      vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
    )
  );

-- Reviews - Public viewing, authors can edit
CREATE POLICY reviews_select ON opendeck_reviews
  FOR SELECT USING (status = 'published' OR reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY reviews_insert ON opendeck_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY reviews_update ON opendeck_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Notifications - User's own only
CREATE POLICY notifications_select ON opendeck_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update ON opendeck_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Saved Searches - User's own only
CREATE POLICY saved_searches_select ON opendeck_saved_searches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY saved_searches_insert ON opendeck_saved_searches
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_searches_update ON opendeck_saved_searches
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY saved_searches_delete ON opendeck_saved_searches
  FOR DELETE USING (user_id = auth.uid());

-- Vendor Lists - Based on visibility
CREATE POLICY vendor_lists_select ON opendeck_vendor_lists
  FOR SELECT USING (
    user_id = auth.uid() OR 
    visibility = 'public' OR
    (visibility = 'team' AND organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY vendor_lists_insert ON opendeck_vendor_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY vendor_lists_update ON opendeck_vendor_lists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY vendor_lists_delete ON opendeck_vendor_lists
  FOR DELETE USING (user_id = auth.uid());

-- Vendor List Items - Based on list access
CREATE POLICY vendor_list_items_select ON opendeck_vendor_list_items
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM opendeck_vendor_lists 
      WHERE user_id = auth.uid() OR 
      visibility = 'public' OR
      (visibility = 'team' AND organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY vendor_list_items_insert ON opendeck_vendor_list_items
  FOR INSERT WITH CHECK (
    list_id IN (SELECT id FROM opendeck_vendor_lists WHERE user_id = auth.uid())
  );

CREATE POLICY vendor_list_items_delete ON opendeck_vendor_list_items
  FOR DELETE USING (
    list_id IN (SELECT id FROM opendeck_vendor_lists WHERE user_id = auth.uid())
  );

-- Disputes - Parties involved only
CREATE POLICY disputes_select ON opendeck_disputes
  FOR SELECT USING (initiator_id = auth.uid() OR respondent_id = auth.uid());

CREATE POLICY disputes_insert ON opendeck_disputes
  FOR INSERT WITH CHECK (initiator_id = auth.uid());

CREATE POLICY disputes_update ON opendeck_disputes
  FOR UPDATE USING (initiator_id = auth.uid() OR respondent_id = auth.uid());

-- Analytics - Service role only for writes, public reads for aggregated data
CREATE POLICY analytics_insert ON opendeck_analytics
  FOR INSERT TO service_role WITH CHECK (true);

-- Earnings - Vendor's own only
CREATE POLICY earnings_select ON opendeck_earnings
  FOR SELECT USING (
    vendor_id IN (SELECT id FROM opendeck_vendor_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- TRIGGERS (CONTINUED)
-- ============================================

-- Update timestamps
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON opendeck_conversations 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON opendeck_transactions 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_escrow_accounts_updated_at BEFORE UPDATE ON opendeck_escrow_accounts 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON opendeck_reviews 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_saved_searches_updated_at BEFORE UPDATE ON opendeck_saved_searches 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_vendor_lists_updated_at BEFORE UPDATE ON opendeck_vendor_lists 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_disputes_updated_at BEFORE UPDATE ON opendeck_disputes 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_earnings_updated_at BEFORE UPDATE ON opendeck_earnings 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
