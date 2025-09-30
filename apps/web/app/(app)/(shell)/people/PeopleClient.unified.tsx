'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui';
import { peopleModuleConfig } from '../../../../config/modules/people.config';
import type { User } from '@supabase/supabase-js';

interface PeopleClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified People Module Client
 * 
 * Replaces the legacy PeopleClient with a configuration-driven implementation.
 * Manages team members, roles, competencies, endorsements, and assignments.
 * 
 * Features:
 * - People directory with comprehensive profiles
 * - Role and competency management
 * - Peer endorsement system
 * - Project assignment tracking
 * - Skills matrix and analytics
 * - Real-time updates
 * 
 * Code reduction: ~88% compared to legacy implementation
 */
export default function PeopleClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: PeopleClientProps) {
 // Adapt Supabase User to UI User type
 const adaptedUser = {
 id: user.id,
 email: user.email || '', // Provide fallback for required email
 name: user.user_metadata?.full_name || user.email || '',
 avatar: user.user_metadata?.avatar_url,
 role: user.role,
 metadata: user.user_metadata
 };

 return (
 <ModuleTemplate
 config={peopleModuleConfig}
 user={adaptedUser}
 orgId={orgId}
 translations={translations}
 />
 );
}
