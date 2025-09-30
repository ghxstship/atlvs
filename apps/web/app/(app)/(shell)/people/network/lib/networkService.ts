import { createBrowserClient } from '@ghxstship/auth';

export interface NetworkConnection {
  id: string;
  person_id: string;
  connected_person_id: string;
  relationship_type: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength: number; // 1-5
  notes?: string;
  created_at: string;
  updated_at: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  connected_person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

export interface CreateNetworkConnectionData {
  person_id: string;
  connected_person_id: string;
  relationship_type: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength?: number;
  notes?: string;
}

export interface UpdateNetworkConnectionData extends Partial<CreateNetworkConnectionData> {}

export class NetworkService {
  private supabase = createBrowserClient();

  async getNetworkConnections(orgId: string): Promise<NetworkConnection[]> {
    const { data, error } = await this.supabase
      .from('people_network')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(id, first_name, last_name, email, role, department)
      `)
      .eq('person.organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getNetworkConnection(id: string): Promise<NetworkConnection | null> {
    const { data, error } = await this.supabase
      .from('people_network')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(id, first_name, last_name, email, role, department)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createNetworkConnection(data: CreateNetworkConnectionData): Promise<NetworkConnection> {
    const { data: connection, error } = await this.supabase
      .from('people_network')
      .insert({
        ...data,
        strength: data.strength || 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(id, first_name, last_name, email, role, department)
      `)
      .single();

    if (error) throw error;
    return connection;
  }

  async updateNetworkConnection(id: string, data: UpdateNetworkConnectionData): Promise<NetworkConnection> {
    const { data: connection, error } = await this.supabase
      .from('people_network')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(id, first_name, last_name, email, role, department)
      `)
      .single();

    if (error) throw error;
    return connection;
  }

  async deleteNetworkConnection(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('people_network')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getConnectionsForPerson(personId: string): Promise<NetworkConnection[]> {
    const { data, error } = await this.supabase
      .from('people_network')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email, role, department),
        connected_person:people!connected_person_id(id, first_name, last_name, email, role, department)
      `)
      .or(`person_id.eq.${personId},connected_person_id.eq.${personId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getNetworkStats(orgId: string): Promise<unknown> {
    const connections = await this.getNetworkConnections(orgId);
    
    const stats = {
      total: connections.length,
      by_relationship_type: {} as Record<string, number>,
      by_strength: {} as Record<number, number>,
      average_strength: connections.reduce((sum, c) => sum + c.strength, 0) / connections.length || 0,
      most_connected: {} as Record<string, number>,
      by_department: {} as Record<string, number>
    };

    connections.forEach(connection => {
      // By relationship type
      stats.by_relationship_type[connection.relationship_type] = 
        (stats.by_relationship_type[connection.relationship_type] || 0) + 1;
      
      // By strength
      stats.by_strength[connection.strength] = (stats.by_strength[connection.strength] || 0) + 1;
      
      // Most connected people
      if (connection.person) {
        const personName = `${connection.person.first_name} ${connection.person.last_name}`;
        stats.most_connected[personName] = (stats.most_connected[personName] || 0) + 1;
      }
      if (connection.connected_person) {
        const connectedName = `${connection.connected_person.first_name} ${connection.connected_person.last_name}`;
        stats.most_connected[connectedName] = (stats.most_connected[connectedName] || 0) + 1;
      }
      
      // By department connections
      if (connection.person?.department && connection.connected_person?.department) {
        const deptConnection = `${connection.person.department} ↔ ${connection.connected_person.department}`;
        stats.by_department[deptConnection] = (stats.by_department[deptConnection] || 0) + 1;
      }
    });

    return stats;
  }

  async suggestConnections(personId: string, orgId: string): Promise<any[]> {
    // Get person's current connections
    const existingConnections = await this.getConnectionsForPerson(personId);
    const connectedIds = existingConnections.flatMap(c => [c.person_id, c.connected_person_id]);
    
    // Get person details
    const { data: person } = await this.supabase
      .from('people')
      .select('department, role')
      .eq('id', personId)
      .single();

    if (!person) return [];

    // Find people in same department or role who aren't already connected
    const { data: suggestions, error } = await this.supabase
      .from('people')
      .select('id, first_name, last_name, email, role, department')
      .eq('organization_id', orgId)
      .neq('id', personId)
      .not('id', 'in', `(${connectedIds.join(',')})`)
      .or(`department.eq.${person.department},role.eq.${person.role}`)
      .limit(10);

    if (error) throw error;
    return suggestions || [];
  }
}
