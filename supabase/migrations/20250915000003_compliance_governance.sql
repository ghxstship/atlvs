-- Enterprise Compliance and Governance Migration
-- Phase 3: GDPR, SOC 2, and Advanced Governance

-- Create GDPR compliance tables
CREATE TABLE IF NOT EXISTS public.gdpr_data_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL, -- Can reference users.id or external identifier
    subject_type TEXT NOT NULL CHECK (subject_type IN ('user', 'customer', 'employee', 'contractor')),
    email TEXT NOT NULL,
    full_name TEXT,
    consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'withdrawn', 'expired')),
    consent_date TIMESTAMPTZ,
    consent_version TEXT,
    data_processing_purposes TEXT[],
    legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests')),
    retention_period INTERVAL,
    deletion_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create data processing activities register (Article 30 GDPR)
CREATE TABLE IF NOT EXISTS public.gdpr_processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    purpose_description TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    data_subjects_categories TEXT[] NOT NULL,
    recipients TEXT[],
    third_country_transfers BOOLEAN DEFAULT false,
    third_country_safeguards TEXT,
    retention_period INTERVAL,
    technical_measures TEXT[],
    organizational_measures TEXT[],
    controller_name TEXT NOT NULL,
    controller_contact TEXT NOT NULL,
    dpo_contact TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create data subject requests table (GDPR Rights)
CREATE TABLE IF NOT EXISTS public.gdpr_data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    data_subject_id UUID NOT NULL REFERENCES public.gdpr_data_subjects(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability', 
        'restriction', 'objection', 'withdraw_consent'
    )),
    request_description TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
        'received', 'under_review', 'in_progress', 'completed', 'rejected', 'partially_fulfilled'
    )),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL, -- 30 days from received_at
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    fulfillment_data JSONB,
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create data breach incidents table (Article 33/34 GDPR)
CREATE TABLE IF NOT EXISTS public.gdpr_breach_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    incident_reference TEXT NOT NULL UNIQUE,
    breach_type TEXT NOT NULL CHECK (breach_type IN ('confidentiality', 'integrity', 'availability')),
    severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    affected_data_categories TEXT[],
    affected_subjects_count INTEGER,
    likely_consequences TEXT,
    measures_taken TEXT,
    measures_planned TEXT,
    authority_notified BOOLEAN DEFAULT false,
    authority_notification_date TIMESTAMPTZ,
    subjects_notified BOOLEAN DEFAULT false,
    subjects_notification_date TIMESTAMPTZ,
    discovered_at TIMESTAMPTZ NOT NULL,
    contained_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    reported_by UUID NOT NULL REFERENCES public.users(id),
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create SOC 2 controls table
CREATE TABLE IF NOT EXISTS public.soc2_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    control_id TEXT NOT NULL,
    trust_service_category TEXT NOT NULL CHECK (trust_service_category IN (
        'security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'
    )),
    control_description TEXT NOT NULL,
    control_objective TEXT NOT NULL,
    implementation_status TEXT NOT NULL DEFAULT 'not_implemented' CHECK (implementation_status IN (
        'not_implemented', 'partially_implemented', 'implemented', 'operating_effectively'
    )),
    testing_frequency TEXT NOT NULL CHECK (testing_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    last_tested_at TIMESTAMPTZ,
    next_test_due TIMESTAMPTZ,
    test_results TEXT,
    deficiencies TEXT[],
    remediation_plan TEXT,
    responsible_party UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, control_id)
);

-- Create compliance evidence table
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    framework TEXT NOT NULL CHECK (framework IN ('gdpr', 'soc2', 'iso27001', 'hipaa', 'pci_dss')),
    control_reference TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'policy', 'procedure', 'screenshot', 'log_file', 'certificate', 'assessment', 'training_record'
    )),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_hash TEXT,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    collected_by UUID NOT NULL REFERENCES public.users(id),
    reviewed_by UUID REFERENCES public.users(id),
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create privacy impact assessments table
CREATE TABLE IF NOT EXISTS public.privacy_impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    assessment_name TEXT NOT NULL,
    project_description TEXT NOT NULL,
    data_types TEXT[] NOT NULL,
    processing_purposes TEXT[] NOT NULL,
    legal_basis TEXT NOT NULL,
    necessity_justification TEXT NOT NULL,
    proportionality_assessment TEXT NOT NULL,
    risks_identified TEXT[],
    risk_mitigation_measures TEXT[],
    residual_risks TEXT[],
    consultation_required BOOLEAN DEFAULT false,
    consultation_details TEXT,
    dpo_opinion TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected')),
    conducted_by UUID NOT NULL REFERENCES public.users(id),
    reviewed_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vendor risk assessments table
CREATE TABLE IF NOT EXISTS public.vendor_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_company_id UUID REFERENCES public.companies(id),
    vendor_name TEXT NOT NULL,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('initial', 'annual', 'incident_driven', 'contract_renewal')),
    risk_categories JSONB NOT NULL, -- {security: "high", privacy: "medium", operational: "low"}
    overall_risk_score INTEGER CHECK (overall_risk_score BETWEEN 1 AND 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    data_shared TEXT[],
    access_level TEXT NOT NULL CHECK (access_level IN ('none', 'limited', 'moderate', 'extensive')),
    security_controls_verified BOOLEAN DEFAULT false,
    compliance_certifications TEXT[],
    contract_terms_adequate BOOLEAN DEFAULT false,
    monitoring_requirements TEXT[],
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'conditional', 'rejected')),
    approval_conditions TEXT[],
    next_review_date TIMESTAMPTZ,
    assessed_by UUID NOT NULL REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for compliance tables
CREATE INDEX IF NOT EXISTS idx_gdpr_data_subjects_org_id ON public.gdpr_data_subjects(organization_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_subjects_email ON public.gdpr_data_subjects(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_subjects_consent_status ON public.gdpr_data_subjects(consent_status);

CREATE INDEX IF NOT EXISTS idx_gdpr_processing_activities_org_id ON public.gdpr_processing_activities(organization_id);

CREATE INDEX IF NOT EXISTS idx_gdpr_data_requests_org_id ON public.gdpr_data_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_requests_status ON public.gdpr_data_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_data_requests_due_date ON public.gdpr_data_requests(due_date);

CREATE INDEX IF NOT EXISTS idx_gdpr_breach_incidents_org_id ON public.gdpr_breach_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_breach_incidents_severity ON public.gdpr_breach_incidents(severity_level);
CREATE INDEX IF NOT EXISTS idx_gdpr_breach_incidents_discovered_at ON public.gdpr_breach_incidents(discovered_at);

CREATE INDEX IF NOT EXISTS idx_soc2_controls_org_id ON public.soc2_controls(organization_id);
CREATE INDEX IF NOT EXISTS idx_soc2_controls_category ON public.soc2_controls(trust_service_category);
CREATE INDEX IF NOT EXISTS idx_soc2_controls_status ON public.soc2_controls(implementation_status);

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_org_id ON public.compliance_evidence(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_framework ON public.compliance_evidence(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_valid_until ON public.compliance_evidence(valid_until);

-- Enable RLS on compliance tables
ALTER TABLE public.gdpr_data_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soc2_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for compliance tables (admin/owner only)
CREATE POLICY gdpr_data_subjects_admin_only ON public.gdpr_data_subjects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = gdpr_data_subjects.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY gdpr_processing_activities_admin_only ON public.gdpr_processing_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = gdpr_processing_activities.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY gdpr_data_requests_admin_only ON public.gdpr_data_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = gdpr_data_requests.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY soc2_controls_admin_only ON public.soc2_controls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = soc2_controls.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- GDPR compliance functions

-- Function to handle data subject access requests
CREATE OR REPLACE FUNCTION public.process_gdpr_access_request(
    p_request_id UUID
)
RETURNS JSONB AS $$
DECLARE
    request_record RECORD;
    subject_data JSONB := '{}';
    table_name TEXT;
    sql_query TEXT;
    result_data JSONB;
BEGIN
    -- Get the request details
    SELECT * INTO request_record
    FROM public.gdpr_data_requests gdr
    JOIN public.gdpr_data_subjects gds ON gds.id = gdr.data_subject_id
    WHERE gdr.id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Request not found');
    END IF;
    
    -- Collect data from all relevant tables
    FOR table_name IN 
        SELECT DISTINCT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name IN ('user_id', 'email', 'created_by')
    LOOP
        -- Build dynamic query to extract user data
        sql_query := format('
            SELECT to_jsonb(array_agg(%I.*)) 
            FROM public.%I 
            WHERE (user_id = %L OR email = %L OR created_by = %L)
              AND organization_id = %L
        ', 
            table_name, table_name,
            request_record.subject_id,
            request_record.email,
            request_record.subject_id,
            request_record.organization_id
        );
        
        EXECUTE sql_query INTO result_data;
        
        IF result_data IS NOT NULL AND result_data != 'null'::jsonb THEN
            subject_data := subject_data || jsonb_build_object(table_name, result_data);
        END IF;
    END LOOP;
    
    -- Update request status
    UPDATE public.gdpr_data_requests
    SET status = 'completed',
        completed_at = NOW(),
        fulfillment_data = subject_data
    WHERE id = p_request_id;
    
    RETURN subject_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle data erasure requests (Right to be Forgotten)
CREATE OR REPLACE FUNCTION public.process_gdpr_erasure_request(
    p_request_id UUID,
    p_anonymize_only BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    request_record RECORD;
    table_name TEXT;
    sql_query TEXT;
    affected_rows INTEGER := 0;
    total_affected INTEGER := 0;
    erasure_log JSONB := '{}';
BEGIN
    -- Get the request details
    SELECT * INTO request_record
    FROM public.gdpr_data_requests gdr
    JOIN public.gdpr_data_subjects gds ON gds.id = gdr.data_subject_id
    WHERE gdr.id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Request not found');
    END IF;
    
    -- Process erasure for each relevant table
    FOR table_name IN 
        SELECT DISTINCT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name IN ('user_id', 'email', 'created_by')
          AND table_name NOT IN ('audit_logs', 'gdpr_data_requests', 'gdpr_data_subjects')
    LOOP
        IF p_anonymize_only THEN
            -- Anonymize instead of delete
            sql_query := format('
                UPDATE public.%I 
                SET email = ''anonymized@example.com'',
                    full_name = ''Anonymized User'',
                    first_name = ''Anonymized'',
                    last_name = ''User''
                WHERE (user_id = %L OR email = %L OR created_by = %L)
                  AND organization_id = %L
            ', 
                table_name,
                request_record.subject_id,
                request_record.email,
                request_record.subject_id,
                request_record.organization_id
            );
        ELSE
            -- Archive then delete
            sql_query := format('
                WITH archived AS (
                    INSERT INTO public.archived_records (
                        organization_id, original_table, original_id, record_data, archived_reason
                    )
                    SELECT organization_id, %L, id, to_jsonb(%I.*), ''GDPR erasure request''
                    FROM public.%I 
                    WHERE (user_id = %L OR email = %L OR created_by = %L)
                      AND organization_id = %L
                    RETURNING original_id
                )
                DELETE FROM public.%I 
                WHERE id IN (SELECT original_id FROM archived)
            ', 
                table_name, table_name, table_name,
                request_record.subject_id,
                request_record.email,
                request_record.subject_id,
                request_record.organization_id,
                table_name
            );
        END IF;
        
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        
        IF affected_rows > 0 THEN
            total_affected := total_affected + affected_rows;
            erasure_log := erasure_log || jsonb_build_object(
                table_name, jsonb_build_object(
                    'affected_rows', affected_rows,
                    'action', CASE WHEN p_anonymize_only THEN 'anonymized' ELSE 'deleted' END
                )
            );
        END IF;
    END LOOP;
    
    -- Update request status
    UPDATE public.gdpr_data_requests
    SET status = 'completed',
        completed_at = NOW(),
        fulfillment_data = erasure_log
    WHERE id = p_request_id;
    
    -- Update data subject status
    UPDATE public.gdpr_data_subjects
    SET consent_status = 'withdrawn',
        deletion_scheduled_at = NOW()
    WHERE id = request_record.data_subject_id;
    
    RETURN jsonb_build_object(
        'total_affected_rows', total_affected,
        'tables_processed', erasure_log,
        'action', CASE WHEN p_anonymize_only THEN 'anonymized' ELSE 'deleted' END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check GDPR compliance status
CREATE OR REPLACE FUNCTION public.check_gdpr_compliance_status(
    p_organization_id UUID
)
RETURNS JSONB AS $$
DECLARE
    compliance_status JSONB;
    overdue_requests INTEGER;
    expired_consents INTEGER;
    missing_legal_basis INTEGER;
BEGIN
    -- Check overdue data subject requests
    SELECT COUNT(*) INTO overdue_requests
    FROM public.gdpr_data_requests gdr
    JOIN public.gdpr_data_subjects gds ON gds.id = gdr.data_subject_id
    WHERE gds.organization_id = p_organization_id
      AND gdr.status NOT IN ('completed', 'rejected')
      AND gdr.due_date < NOW();
    
    -- Check expired consents
    SELECT COUNT(*) INTO expired_consents
    FROM public.gdpr_data_subjects
    WHERE organization_id = p_organization_id
      AND consent_status = 'expired';
    
    -- Check missing legal basis
    SELECT COUNT(*) INTO missing_legal_basis
    FROM public.gdpr_processing_activities
    WHERE organization_id = p_organization_id
      AND (legal_basis IS NULL OR legal_basis = '');
    
    compliance_status := jsonb_build_object(
        'organization_id', p_organization_id,
        'overdue_requests', overdue_requests,
        'expired_consents', expired_consents,
        'missing_legal_basis', missing_legal_basis,
        'compliance_score', CASE 
            WHEN overdue_requests = 0 AND expired_consents = 0 AND missing_legal_basis = 0 THEN 100
            WHEN overdue_requests > 0 THEN 60
            WHEN expired_consents > 5 THEN 70
            WHEN missing_legal_basis > 0 THEN 80
            ELSE 90
        END,
        'checked_at', NOW()
    );
    
    RETURN compliance_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at on compliance tables
CREATE TRIGGER set_updated_at_gdpr_data_subjects
    BEFORE UPDATE ON public.gdpr_data_subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_gdpr_processing_activities
    BEFORE UPDATE ON public.gdpr_processing_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_gdpr_data_requests
    BEFORE UPDATE ON public.gdpr_data_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_gdpr_breach_incidents
    BEFORE UPDATE ON public.gdpr_breach_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_soc2_controls
    BEFORE UPDATE ON public.soc2_controls
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_compliance_evidence
    BEFORE UPDATE ON public.compliance_evidence
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default SOC 2 controls
INSERT INTO public.soc2_controls (organization_id, control_id, trust_service_category, control_description, control_objective, testing_frequency)
SELECT 
    o.id,
    'CC1.1',
    'security',
    'Management establishes structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives.',
    'Establish organizational structure and accountability',
    'quarterly'
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.soc2_controls 
    WHERE organization_id = o.id AND control_id = 'CC1.1'
);

-- Add comments for documentation
COMMENT ON TABLE public.gdpr_data_subjects IS 'GDPR data subjects and consent management';
COMMENT ON TABLE public.gdpr_processing_activities IS 'Article 30 GDPR processing activities register';
COMMENT ON TABLE public.gdpr_data_requests IS 'Data subject rights requests (access, erasure, etc.)';
COMMENT ON TABLE public.gdpr_breach_incidents IS 'Data breach incidents (Article 33/34 GDPR)';
COMMENT ON TABLE public.soc2_controls IS 'SOC 2 Type II controls implementation and testing';
COMMENT ON TABLE public.compliance_evidence IS 'Compliance evidence collection and management';

COMMENT ON FUNCTION public.process_gdpr_access_request(UUID) IS 'Process GDPR data subject access request';
COMMENT ON FUNCTION public.process_gdpr_erasure_request(UUID, BOOLEAN) IS 'Process GDPR right to be forgotten request';
COMMENT ON FUNCTION public.check_gdpr_compliance_status(UUID) IS 'Check overall GDPR compliance status';
