import { createBrowserClient } from '@ghxstship/auth';

const supabase = createBrowserClient();

export interface ProfileFilters {
  department?: string;
  status?: string;
  search?: string;
}

export async function getProfiles(orgId: string, filters?: ProfileFilters) {
  let query = supabase
    .from('user_profiles')
    .select('*')
    .eq('organization_id', orgId);

  if (filters?.department) {
    query = query.eq('department', filters.department);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.ilike('full_name', `%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProfile(profileData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profileData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(id: string) {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}
