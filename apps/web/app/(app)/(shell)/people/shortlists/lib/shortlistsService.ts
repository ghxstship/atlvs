import { createBrowserClient } from '@ghxstship/auth';

export interface Shortlist {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  project_id?: string;
  role_id?: string;
  status: 'active' | 'closed' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
  members?: ShortlistMember[];
  member_count?: number;
}

export interface ShortlistMember {
  id: string;
  shortlist_id: string;
  person_id: string;
  status: 'candidate' | 'interviewed' | 'selected' | 'rejected';
  notes?: string;
  added_by?: string;
  added_at: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

export interface CreateShortlistData {
  name: string;
  description?: string;
  project_id?: string;
  role_id?: string;
  status?: 'active' | 'closed' | 'archived';
}

export interface UpdateShortlistData extends Partial<CreateShortlistData> {}

export interface CreateShortlistMemberData {
  shortlist_id: string;
  person_id: string;
  status?: 'candidate' | 'interviewed' | 'selected' | 'rejected';
  notes?: string;
}

export class ShortlistsService {
  private supabase = createBrowserClient();

  async getShortlists(orgId: string): Promise<Shortlist[]> {
    const { data, error } = await this.supabase
      .from('people_shortlists')
      .select(`
        *,
        project:projects(id, name),
        role:people_roles(id, name),
        members:shortlist_members(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getShortlist(id: string, orgId: string): Promise<Shortlist | null> {
    const { data, error } = await this.supabase
      .from('people_shortlists')
      .select(`
        *,
        project:projects(id, name),
        role:people_roles(id, name),
        members:shortlist_members(
          *,
          person:people(id, first_name, last_name, email, role, department)
        )
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createShortlist(orgId: string, userId: string, data: CreateShortlistData): Promise<Shortlist> {
    const { data: shortlist, error } = await this.supabase
      .from('people_shortlists')
      .insert({
        ...data,
        organization_id: orgId,
        created_by: userId,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        project:projects(id, name),
        role:people_roles(id, name)
      `)
      .single();

    if (error) throw error;
    return shortlist;
  }

  async updateShortlist(id: string, orgId: string, data: UpdateShortlistData): Promise<Shortlist> {
    const { data: shortlist, error } = await this.supabase
      .from('people_shortlists')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select(`
        *,
        project:projects(id, name),
        role:people_roles(id, name)
      `)
      .single();

    if (error) throw error;
    return shortlist;
  }

  async deleteShortlist(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('people_shortlists')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async addPersonToShortlist(data: CreateShortlistMemberData, userId: string): Promise<ShortlistMember> {
    const { data: member, error } = await this.supabase
      .from('shortlist_members')
      .insert({
        ...data,
        status: data.status || 'candidate',
        added_by: userId,
        added_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people(id, first_name, last_name, email, role, department)
      `)
      .single();

    if (error) throw error;
    return member;
  }

  async updateShortlistMember(id: string, data: Partial<CreateShortlistMemberData>): Promise<ShortlistMember> {
    const { data: member, error } = await this.supabase
      .from('shortlist_members')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        person:people(id, first_name, last_name, email, role, department)
      `)
      .single();

    if (error) throw error;
    return member;
  }

  async removePersonFromShortlist(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('shortlist_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getShortlistStats(orgId: string): Promise<unknown> {
    const shortlists = await this.getShortlists(orgId);
    
    const stats = {
      total: shortlists.length,
      active: shortlists.filter(s => s.status === 'active').length,
      closed: shortlists.filter(s => s.status === 'closed').length,
      archived: shortlists.filter(s => s.status === 'archived').length,
      total_members: shortlists.reduce((sum, s) => sum + (s.member_count || 0), 0),
      by_project: {} as Record<string, number>,
      by_role: {} as Record<string, number>
    };

    shortlists.forEach(shortlist => {
      if (shortlist.project) {
        stats.by_project[shortlist.project.name] = (stats.by_project[shortlist.project.name] || 0) + 1;
      }
      if (shortlist.role) {
        stats.by_role[shortlist.role.name] = (stats.by_role[shortlist.role.name] || 0) + 1;
      }
    });

    return stats;
  }
}
