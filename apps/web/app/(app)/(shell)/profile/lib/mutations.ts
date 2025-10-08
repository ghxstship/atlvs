import { createBrowserClient } from '@ghxstship/auth';

const supabase = createBrowserClient();

export const profileMutations = {
  create: async (profileData: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, id };
  },

  bulkUpdate: async (ids: string[], updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data || [];
  },

  bulkDelete: async (ids: string[]) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return { success: true, count: ids.length };
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
