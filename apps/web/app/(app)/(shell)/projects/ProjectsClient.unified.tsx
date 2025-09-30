'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { projectsModuleConfig } from '../../../../config/modules/projects.config';
import type { User } from '@supabase/supabase-js';

interface ProjectsClientProps {
 user: User;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Projects Module Client
 * 
 * Replaces the legacy ProjectsClient with a configuration-driven implementation.
 * All functionality is provided through the ModuleTemplate and configuration.
 * 
 * Features:
 * - Project management with full CRUD
 * - Task tracking with kanban board
 * - File management
 * - Location tracking
 * - Risk assessment
 * - Schedule management
 * - Real-time updates
 * 
 * Code reduction: ~85% compared to legacy implementation
 */
export default function ProjectsClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: ProjectsClientProps) {
 return (
 <ModuleTemplate
 config={projectsModuleConfig}
 user={user}
 orgId={orgId}
 translations={translations}
 />
 );
}
