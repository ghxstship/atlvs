import { createBrowserClient } from '@ghxstship/auth';

export interface Workshop {
  id: string;
  organization_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  instructor?: string | null;
  location?: string | null;
  capacity?: number | null;
  duration_minutes?: number | null;
  starts_at: string;
  ends_at?: string | null;
  prerequisites?: string[] | null;
  materials_needed?: string[] | null;
  learning_objectives?: string[] | null;
  price?: number | null;
  currency?: string | null;
  registration_deadline?: string | null;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export class WorkshopsService {
  private supabase = createBrowserClient();

  async getWorkshops(orgId: string, filters?: {
    projectId?: string;
    category?: string;
    status?: string;
    difficultyLevel?: string;
    instructor?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Workshop[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_workshops')
        .select(`
          *,
          project:projects(id, name, status)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('starts_at', { ascending: true });

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.difficultyLevel) {
        query = query.eq('difficulty_level', filters.difficultyLevel);
      }
      if (filters?.instructor) {
        query = query.eq('instructor', filters.instructor);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit && filters?.offset !== undefined) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  }

  async createWorkshop(orgId: string, userId: string, workshopData: Partial<Workshop>): Promise<Workshop> {
    try {
      const { data, error } = await this.supabase
        .from('programming_workshops')
        .insert({
          ...workshopData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: workshopData.status || 'draft',
          difficulty_level: workshopData.difficulty_level || 'beginner',
          prerequisites: workshopData.prerequisites || [],
          materials_needed: workshopData.materials_needed || [],
          learning_objectives: workshopData.learning_objectives || [],
          currency: workshopData.currency || 'USD',
          metadata: workshopData.metadata || {}
        })
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        category: data.category,
        starts_at: data.starts_at
      });

      return data;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  }

  async updateWorkshop(workshopId: string, userId: string, workshopData: Partial<Workshop>): Promise<Workshop> {
    try {
      const { data, error } = await this.supabase
        .from('programming_workshops')
        .update({
          ...workshopData,
          updated_by: userId
        })
        .eq('id', workshopId)
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', workshopId, {
        title: data.title,
        changes: Object.keys(workshopData)
      });

      return data;
    } catch (error) {
      console.error('Error updating workshop:', error);
      throw error;
    }
  }

  async deleteWorkshop(workshopId: string, userId: string): Promise<void> {
    try {
      const { data: workshop } = await this.supabase
        .from('programming_workshops')
        .select('organization_id, title')
        .eq('id', workshopId)
        .single();

      const { error } = await this.supabase
        .from('programming_workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      if (workshop) {
        await this.logActivity(workshop.organization_id, userId, 'delete', workshopId, {
          title: workshop.title
        });
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
      throw error;
    }
  }

  async getWorkshopStats(orgId: string): Promise<{
    totalWorkshops: number;
    publishedWorkshops: number;
    completedWorkshops: number;
    upcomingWorkshops: number;
    averageCapacity: number;
    categoriesCount: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_workshops')
        .select('status, starts_at, capacity, category')
        .eq('organization_id', orgId);

      if (error) throw error;

      const now = new Date().toISOString();
      const capacities = data.filter(w => w.capacity).map(w => w.capacity);
      const categoriesCount: Record<string, number> = {};
      
      data.forEach(workshop => {
        if (workshop.category) {
          categoriesCount[workshop.category] = (categoriesCount[workshop.category] || 0) + 1;
        }
      });

      const stats = {
        totalWorkshops: data.length,
        publishedWorkshops: data.filter(w => w.status === 'published').length,
        completedWorkshops: data.filter(w => w.status === 'completed').length,
        upcomingWorkshops: data.filter(w => w.starts_at > now && w.status !== 'cancelled').length,
        averageCapacity: capacities.length > 0 ? capacities.reduce((a, b) => a + b, 0) / capacities.length : 0,
        categoriesCount
      };

      return stats;
    } catch (error) {
      console.error('Error fetching workshop stats:', error);
      throw error;
    }
  }

  async getWorkshopsByInstructor(orgId: string, instructor: string): Promise<Workshop[]> {
    try {
      const { data, error } = await this.supabase
        .from('programming_workshops')
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .eq('organization_id', orgId)
        .eq('instructor', instructor)
        .order('starts_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workshops by instructor:', error);
      throw error;
    }
  }

  async registerForWorkshop(workshopId: string, userId: string, registrationData?: unknown): Promise<void> {
    try {
      // This would typically involve a separate registrations table
      // For now, we'll log it as an activity
      await this.logActivity('', userId, 'register', workshopId, {
        registration_data: registrationData,
        registered_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error registering for workshop:', error);
      throw error;
    }
  }

  private async logActivity(orgId: string, userId: string, action: string, resourceId: string, details: unknown): Promise<void> {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          organization_id: orgId,
          user_id: userId,
          resource_type: 'programming_workshop',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const workshopsService = new WorkshopsService();
