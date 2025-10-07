import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface TenantContext {
  organizationId: string;
  userId: string;
  userRole?: string;
}

export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return null;
    }

    // Get organization from headers or user metadata
    const headersList = await headers();
    let organizationId = headersList.get('x-organization-id');
    
    // If no header, try to get from user's default organization
    if (!organizationId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return null;
      }
      
      organizationId = profile.organization_id;
    }

    if (!organizationId) {
      console.error('No organization context found');
      return null;
    }

    // Get user's role in the organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    return {
      organizationId,
      userId: user.id,
      userRole: membership?.role || 'member',
    };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
}

export async function requireTenantContext(): Promise<TenantContext> {
  const context = await getTenantContext();
  
  if (!context) {
    throw new Error('Unauthorized: No tenant context available');
  }
  
  return context;
}

export function hasPermission(userRole: string | undefined, requiredPermission: string): boolean {
  if (!userRole) return false;
  
  // Define role hierarchy
  const rolePermissions: Record<string, string[]> = {
    owner: ['*'], // All permissions
    admin: ['settings:manage', 'users:manage', 'projects:manage', 'finance:manage'],
    manager: ['projects:manage', 'users:view'],
    member: ['projects:view', 'users:view'],
  };
  
  const permissions = rolePermissions[userRole] || [];
  
  // Check for wildcard or specific permission
  return permissions.includes('*') || permissions.includes(requiredPermission);
}

export async function extractTenantContext(): Promise<TenantContext> {
  const context = await getTenantContext();
  
  if (!context) {
    throw new Error('Unauthorized: No tenant context available');
  }
  
  return context;
}
