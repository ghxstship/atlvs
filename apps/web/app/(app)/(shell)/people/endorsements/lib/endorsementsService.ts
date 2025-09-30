import { createBrowserClient } from '@ghxstship/auth';

export interface Endorsement {
  id: string;
  person_id: string;
  endorser_id: string;
  competency_id?: string;
  message: string;
  rating: number;
  created_at: string;
  updated_at: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  endorser?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  competency?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface CreateEndorsementData {
  person_id: string;
  endorser_id: string;
  competency_id?: string;
  message: string;
  rating: number;
}

export interface UpdateEndorsementData extends Partial<CreateEndorsementData> {}

export class EndorsementsService {
  private supabase = createBrowserClient();

  async getEndorsements(orgId: string): Promise<Endorsement[]> {
    const { data, error } = await this.supabase
      .from('people_endorsements')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .eq('person.organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getEndorsement(id: string): Promise<Endorsement | null> {
    const { data, error } = await this.supabase
      .from('people_endorsements')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createEndorsement(data: CreateEndorsementData): Promise<Endorsement> {
    const { data: endorsement, error } = await this.supabase
      .from('people_endorsements')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .single();

    if (error) throw error;
    return endorsement;
  }

  async updateEndorsement(id: string, data: UpdateEndorsementData): Promise<Endorsement> {
    const { data: endorsement, error } = await this.supabase
      .from('people_endorsements')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .single();

    if (error) throw error;
    return endorsement;
  }

  async deleteEndorsement(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('people_endorsements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getEndorsementsForPerson(personId: string): Promise<Endorsement[]> {
    const { data, error } = await this.supabase
      .from('people_endorsements')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getEndorsementsByEndorser(endorserId: string): Promise<Endorsement[]> {
    const { data, error } = await this.supabase
      .from('people_endorsements')
      .select(`
        *,
        person:people!person_id(id, first_name, last_name, email),
        endorser:people!endorser_id(id, first_name, last_name, email),
        competency:people_competencies(id, name, category)
      `)
      .eq('endorser_id', endorserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getEndorsementStats(orgId: string): Promise<unknown> {
    const endorsements = await this.getEndorsements(orgId);
    
    const stats = {
      total: endorsements.length,
      average_rating: endorsements.reduce((sum, e) => sum + e.rating, 0) / endorsements.length || 0,
      by_rating: {} as Record<number, number>,
      by_competency: {} as Record<string, number>,
      top_endorsers: {} as Record<string, number>,
      top_endorsed: {} as Record<string, number>
    };

    endorsements.forEach(endorsement => {
      // By rating
      stats.by_rating[endorsement.rating] = (stats.by_rating[endorsement.rating] || 0) + 1;
      
      // By competency
      if (endorsement.competency) {
        stats.by_competency[endorsement.competency.name] = (stats.by_competency[endorsement.competency.name] || 0) + 1;
      }
      
      // Top endorsers
      if (endorsement.endorser) {
        const endorserName = `${endorsement.endorser.first_name} ${endorsement.endorser.last_name}`;
        stats.top_endorsers[endorserName] = (stats.top_endorsers[endorserName] || 0) + 1;
      }
      
      // Top endorsed
      if (endorsement.person) {
        const personName = `${endorsement.person.first_name} ${endorsement.person.last_name}`;
        stats.top_endorsed[personName] = (stats.top_endorsed[personName] || 0) + 1;
      }
    });

    return stats;
  }
}
