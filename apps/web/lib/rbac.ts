import { createClient } from '@/lib/supabase/server';

export type Permission = 
  | 'settings:manage'
  | 'users:manage'
  | 'users:view'
  | 'projects:manage'
  | 'projects:view'
  | 'finance:manage'
  | 'finance:view'
  | '*'; // Wildcard for all permissions

export type Role = 'owner' | 'admin' | 'manager' | 'member';

const rolePermissions: Record<Role, Permission[]> = {
  owner: ['*'], // All permissions
  admin: ['settings:manage', 'users:manage', 'projects:manage', 'finance:manage'],
  manager: ['projects:manage', 'users:view', 'finance:view'],
  member: ['projects:view', 'users:view'],
};

export async function checkPermission(
  userId: string,
  organizationId: string,
  requiredPermission: Permission
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get user's role in the organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      console.error('Failed to get user membership:', error);
      return false;
    }

    const userRole = membership.role as Role;
    const permissions = rolePermissions[userRole] || [];
    
    // Check for wildcard or specific permission
    return permissions.includes('*') || permissions.includes(requiredPermission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function requirePermission(
  userId: string,
  organizationId: string,
  requiredPermission: Permission
): Promise<void> {
  const hasPermission = await checkPermission(userId, organizationId, requiredPermission);
  
  if (!hasPermission) {
    throw new Error(`Unauthorized: Missing permission ${requiredPermission}`);
  }
}

export function hasRole(userRole: string | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  
  const roleHierarchy: Record<Role, number> = {
    owner: 4,
    admin: 3,
    manager: 2,
    member: 1,
  };
  
  const userLevel = roleHierarchy[userRole as Role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}
