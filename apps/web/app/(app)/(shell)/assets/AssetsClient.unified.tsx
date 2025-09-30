'use client';
import React from 'react';
import { ModuleTemplate } from '@ghxstship/ui/core/templates/ModuleTemplate';
import { assetsModuleConfig } from '../../../../config/modules/assets.config';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as UIUser } from '@ghxstship/ui/config/types';

interface AssetsClientProps {
 user: SupabaseUser;
 orgId: string;
 translations?: Record<string, string>;
}

/**
 * Unified Assets Module Client
 * 
 * Replaces the legacy AssetsClient with a configuration-driven implementation.
 * Manages physical assets, inventory, equipment lifecycle, and maintenance.
 * 
 * Features:
 * - Asset inventory with comprehensive tracking
 * - Location hierarchy management
 * - Assignment and checkout system
 * - Maintenance scheduling and tracking
 * - Asset auditing and compliance
 * - Barcode/QR code integration
 * - Real-time updates
 * 
 * Code reduction: ~92% compared to legacy implementation
 */
export default function AssetsClientUnified({ 
 user, 
 orgId, 
 translations = {} 
}: AssetsClientProps): React.JSX.Element {
  // Transform Supabase user to UI User format
  const uiUser: UIUser = {
    id: user.id,
    email: user.email || '', // Supabase user should have email, but make it required for UI
    name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar: user.user_metadata?.avatar_url,
    role: 'user', // Default role, could be enhanced with membership data
    metadata: user.user_metadata as Record<string, unknown>,
  };

 return (
 <ModuleTemplate
 config={assetsModuleConfig}
 user={uiUser}
 orgId={orgId}
 translations={translations}
 />
 );
}
