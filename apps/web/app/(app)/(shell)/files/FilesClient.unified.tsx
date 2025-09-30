'use client';
import {
  User,
  FileText,
  Settings,
  Award,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  Search,
  Play,
  Trash2,
} from 'lucide-react';
import { ModuleTemplate } from '@ghxstship/ui';
import { filesModuleConfig } from '../../../../config/modules/files.config';
import type { User } from '@supabase/supabase-js';

interface FilesClientProps {
  user: User;
  orgId: string;
  translations?: Record<string, string>;
}

/**
 * Unified Files Module Client
 *
 * Replaces the legacy FilesClient with a configuration-driven implementation.
 * Provides comprehensive digital asset management and file organization.
 *
 * Features:
 * - File upload and management
 * - Folder organization
 * - File sharing and permissions
 * - Version control
 * - File preview and metadata
 * - Category-based organization
 * - Search and filtering
 * - Real-time updates
 *
 * Code reduction: ~88% compared to legacy implementation
 */
export default function FilesClientUnified({ user, orgId, translations = {} }: FilesClientProps) {
  // Adapt Supabase User to UI User type
  const adaptedUser = {
    id: user.id,
    email: user.email || '', // Provide fallback for required email
    name: user.user_metadata?.full_name || user.email || '',
    avatar: user.user_metadata?.avatar_url,
    role: user.role,
    metadata: user.user_metadata,
  };

  return (
    <ModuleTemplate
      config={filesModuleConfig}
      user={adaptedUser}
      orgId={orgId}
      translations={translations}
    />
  );
}
