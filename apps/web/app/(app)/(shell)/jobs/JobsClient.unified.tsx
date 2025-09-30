'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { jobsModuleConfig } from '../../../../config/modules/jobs.config';
import type { User } from '@supabase/supabase-js';

interface JobsClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Jobs Module Client
 * 
 * Replaces the legacy JobsClient with a configuration-driven implementation.
 * Provides comprehensive job management, assignments, and workforce coordination.
 * 
 * Features:
 * - Job posting and management
 * - Assignment tracking
 * - Bid management
 * - Contract lifecycle
 * - Compliance monitoring
 * - Opportunity tracking
 * - RFP management
 * - Real-time updates
 * 
 * Code reduction: ~91% compared to legacy implementation
 */
export default function JobsClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: JobsClientProps) {
 return (
 <ModuleTemplate
 config={jobsModuleConfig}
 user={user}
 orgId={orgId}
 translations={translations}
 />
 );
}
