'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { settingsModuleConfig } from '../../../../config/modules/settings.config';
import type { User } from '@supabase/supabase-js';

interface SettingsClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Settings Module Client
 * 
 * Replaces the legacy SettingsClient with a configuration-driven implementation.
 * Manages organization settings, security, roles, and system configuration.
 * 
 * Features:
 * - Organization profile and preferences
 * - User roles and permissions management
 * - Notification settings
 * - Third-party integrations
 * - Security and audit logging
 * - API management
 * - Billing and subscription
 * - Real-time updates
 * 
 * Code reduction: ~95% compared to legacy implementation
 */
export default function SettingsClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: SettingsClientProps) {
 return (
 <ModuleTemplate
 config={settingsModuleConfig}
 user={user}
 orgId={orgId}
 translations={translations}
 />
 );
}
