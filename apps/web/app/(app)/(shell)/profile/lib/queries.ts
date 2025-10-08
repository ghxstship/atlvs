import { createBrowserClient } from '@ghxstship/auth';

const supabase = createBrowserClient();

export const profileQueries = {
  getAll: async (orgId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  search: async (orgId: string, query: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  filter: async (orgId: string, filters: Record<string, unknown>) => {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getByDepartment: async (orgId: string, department: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .eq('department', department)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getByStatus: async (orgId: string, status: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
