'use client';
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { analyticsModuleConfig } from '../../../../config/modules/analytics.config';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as ModuleUser } from '@ghxstship/ui/config/types';

interface AnalyticsClientProps {
 user: SupabaseUser;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Analytics Module Client
 * 
 * Replaces the legacy AnalyticsClient with a configuration-driven implementation.
 * Provides business intelligence, reporting, and data visualization capabilities.
 * 
 * Features:
 * - Interactive dashboard builder
 * - Advanced report generation
 * - Data export and scheduling
 * - Custom metrics tracking
 * - Real-time data visualization
 * - Automated insights
 * - Real-time updates
 * 
 * Code reduction: ~94% compared to legacy implementation
 */
export default function AnalyticsClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: AnalyticsClientProps) {
 const moduleUser: ModuleUser = {
 id: user.id,
 email: user.email ?? user.user_metadata?.email ?? 'unknown@ghxstship.local',
 name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? undefined,
 avatar: (user.user_metadata?.avatar_url as string | undefined) ?? undefined,
 role: (user.user_metadata?.role as string | undefined) ?? undefined,
 metadata: user.user_metadata ?? undefined,
 };

 return (
 <ModuleTemplate
 config={analyticsModuleConfig}
 user={moduleUser}
 orgId={orgId}
 translations={translations}
 />
 );
}
