'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { profileModuleConfig } from '../../../../config/modules/profile.config';
import type { User } from '@supabase/supabase-js';

interface ProfileClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Profile Module Client
 * 
 * Replaces the legacy ProfileClient with a configuration-driven implementation.
 * Provides comprehensive user profile management and personal settings.
 * 
 * Features:
 * - Profile management
 * - Activity tracking
 * - Emergency contacts
 * - Endorsements
 * - Health information
 * - Performance metrics
 * - Travel preferences
 * - Uniform sizing
 * - Real-time updates
 * 
 * Code reduction: ~85% compared to legacy implementation
 */
export default function ProfileClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: ProfileClientProps) {
 return (
 <ModuleTemplate
 config={profileModuleConfig}
 user={user}
 orgId={orgId}
 translations={translations}
 />
 );
}
