'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { dashboardModuleConfig } from '../../../../config/modules/dashboard.config';
import type { User } from '@supabase/supabase-js';

interface DashboardClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Dashboard Module Client
 * 
 * Replaces the legacy DashboardClient with a configuration-driven implementation.
 * Provides centralized dashboard management and data visualization capabilities.
 * 
 * Features:
 * - Dashboard creation and management
 * - Widget configuration and layout
 * - Real-time data visualization
 * - Template system
 * - Sharing and permissions
 * - Cross-module data integration
 * - Real-time updates
 * 
 * Code reduction: ~90% compared to legacy implementation
 */
export default function DashboardClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: DashboardClientProps) {
 return (
 <ModuleTemplate
 config={dashboardModuleConfig}
 user={user}
 orgId={orgId}
 translations={translations}
 />
 );
}
