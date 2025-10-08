export interface User {
  id: string;
  role: string;
  organization_id: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  user_id?: string;
  status: string;
}

export function canViewProfile(user: User, profile: Profile): boolean {
  // Users can view profiles in their organization
  return user.organization_id === profile.organization_id;
}

export function canEditProfile(user: User, profile: Profile): boolean {
  // Users can edit their own profile or if they're admin
  if (user.role === 'admin' || user.role === 'owner') {
    return user.organization_id === profile.organization_id;
  }
  
  // Users can edit their own profile
  return user.id === profile.user_id && user.organization_id === profile.organization_id;
}

export function canDeleteProfile(user: User, profile: Profile): boolean {
  // Only admins and owners can delete profiles
  if (user.role === 'admin' || user.role === 'owner') {
    return user.organization_id === profile.organization_id;
  }
  
  return false;
}

export function canCreateProfile(user: User): boolean {
  // Admins and owners can create profiles
  return user.role === 'admin' || user.role === 'owner' || user.role === 'manager';
}

export function canBulkEditProfiles(user: User): boolean {
  // Only admins and owners can bulk edit
  return user.role === 'admin' || user.role === 'owner';
}

export function canExportProfiles(user: User): boolean {
  // Admins, owners, and managers can export
  return user.role === 'admin' || user.role === 'owner' || user.role === 'manager';
}

export function canImportProfiles(user: User): boolean {
  // Only admins and owners can import
  return user.role === 'admin' || user.role === 'owner';
}

export function canViewSensitiveData(user: User, profile: Profile): boolean {
  // Users can view their own sensitive data, or if they're admin
  if (user.role === 'admin' || user.role === 'owner') {
    return user.organization_id === profile.organization_id;
  }
  
  return user.id === profile.user_id;
}
