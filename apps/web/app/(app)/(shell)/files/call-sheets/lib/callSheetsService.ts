import { createBrowserClient } from '@ghxstship/auth';

export interface CallSheet {
  id: string;
  organization_id: string;
  project_id?: string | null;
  event_id?: string | null;
  title: string;
  description?: string | null;
  call_date: string;
  status: 'draft' | 'published' | 'distributed' | 'completed' | 'cancelled';
  call_time?: string | null;
  location?: string | null;
  weather?: string | null;
  emergency_contacts: EmergencyContact[];
  crew_calls: CrewCall[];
  talent_calls: TalentCall[];
  equipment_list?: string[] | null;
  catering_info?: unknown;
  transportation_info?: unknown;
  special_instructions?: string | null;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string | null;
}

export interface CrewCall {
  id: string;
  department: string;
  role: string;
  person_name?: string | null;
  call_time: string;
  location?: string | null;
  notes?: string | null;
}

export interface TalentCall {
  id: string;
  talent_name: string;
  role?: string | null;
  call_time: string;
  makeup_time?: string | null;
  wardrobe_time?: string | null;
  location?: string | null;
  notes?: string | null;
}

export class CallSheetsService {
  private supabase = createBrowserClient();

  async getCallSheets(orgId: string, filters?: {
    projectId?: string;
    eventId?: string;
    status?: string;
    callDate?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: CallSheet[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_call_sheets')
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('call_date', { ascending: false });

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.callDate) {
        query = query.eq('call_date', filters.callDate);
      }
      if (filters?.dateFrom) {
        query = query.gte('call_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('call_date', filters.dateTo);
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
      console.error('Error fetching call sheets:', error);
      throw error;
    }
  }

  async createCallSheet(orgId: string, userId: string, callSheetData: Partial<CallSheet>): Promise<CallSheet> {
    try {
      const { data, error } = await this.supabase
        .from('programming_call_sheets')
        .insert({
          ...callSheetData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: callSheetData.status || 'draft',
          emergency_contacts: callSheetData.emergency_contacts || [],
          crew_calls: callSheetData.crew_calls || [],
          talent_calls: callSheetData.talent_calls || [],
          equipment_list: callSheetData.equipment_list || [],
          catering_info: callSheetData.catering_info || {},
          transportation_info: callSheetData.transportation_info || {},
          metadata: callSheetData.metadata || {}
        })
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        call_date: data.call_date,
        crew_count: data.crew_calls?.length || 0,
        talent_count: data.talent_calls?.length || 0
      });

      return data;
    } catch (error) {
      console.error('Error creating call sheet:', error);
      throw error;
    }
  }

  async updateCallSheet(callSheetId: string, userId: string, callSheetData: Partial<CallSheet>): Promise<CallSheet> {
    try {
      const { data, error } = await this.supabase
        .from('programming_call_sheets')
        .update({
          ...callSheetData,
          updated_by: userId
        })
        .eq('id', callSheetId)
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', callSheetId, {
        title: data.title,
        changes: Object.keys(callSheetData)
      });

      return data;
    } catch (error) {
      console.error('Error updating call sheet:', error);
      throw error;
    }
  }

  async deleteCallSheet(callSheetId: string, userId: string): Promise<void> {
    try {
      const { data: callSheet } = await this.supabase
        .from('programming_call_sheets')
        .select('organization_id, title')
        .eq('id', callSheetId)
        .single();

      const { error } = await this.supabase
        .from('programming_call_sheets')
        .delete()
        .eq('id', callSheetId);

      if (error) throw error;

      if (callSheet) {
        await this.logActivity(callSheet.organization_id, userId, 'delete', callSheetId, {
          title: callSheet.title
        });
      }
    } catch (error) {
      console.error('Error deleting call sheet:', error);
      throw error;
    }
  }

  async publishCallSheet(callSheetId: string, userId: string): Promise<CallSheet> {
    try {
      return await this.updateCallSheet(callSheetId, userId, {
        status: 'published'
      });
    } catch (error) {
      console.error('Error publishing call sheet:', error);
      throw error;
    }
  }

  async distributeCallSheet(callSheetId: string, userId: string, recipients: string[]): Promise<CallSheet> {
    try {
      const callSheet = await this.updateCallSheet(callSheetId, userId, {
        status: 'distributed'
      });

      // Log distribution activity
      await this.logActivity(callSheet.organization_id, userId, 'distribute', callSheetId, {
        title: callSheet.title,
        recipients_count: recipients.length,
        distributed_at: new Date().toISOString()
      });

      return callSheet;
    } catch (error) {
      console.error('Error distributing call sheet:', error);
      throw error;
    }
  }

  async addCrewCall(callSheetId: string, crewCall: Omit<CrewCall, 'id'>, userId: string): Promise<CallSheet> {
    try {
      const { data: currentCallSheet, error: fetchError } = await this.supabase
        .from('programming_call_sheets')
        .select('crew_calls')
        .eq('id', callSheetId)
        .single();

      if (fetchError) throw fetchError;

      const newCrewCall: CrewCall = {
        ...crewCall,
        id: crypto.randomUUID()
      };

      const updatedCrewCalls = [...(currentCallSheet.crew_calls || []), newCrewCall];

      return await this.updateCallSheet(callSheetId, userId, {
        crew_calls: updatedCrewCalls
      });
    } catch (error) {
      console.error('Error adding crew call:', error);
      throw error;
    }
  }

  async addTalentCall(callSheetId: string, talentCall: Omit<TalentCall, 'id'>, userId: string): Promise<CallSheet> {
    try {
      const { data: currentCallSheet, error: fetchError } = await this.supabase
        .from('programming_call_sheets')
        .select('talent_calls')
        .eq('id', callSheetId)
        .single();

      if (fetchError) throw fetchError;

      const newTalentCall: TalentCall = {
        ...talentCall,
        id: crypto.randomUUID()
      };

      const updatedTalentCalls = [...(currentCallSheet.talent_calls || []), newTalentCall];

      return await this.updateCallSheet(callSheetId, userId, {
        talent_calls: updatedTalentCalls
      });
    } catch (error) {
      console.error('Error adding talent call:', error);
      throw error;
    }
  }

  async getCallSheetStats(orgId: string): Promise<{
    totalCallSheets: number;
    publishedCallSheets: number;
    distributedCallSheets: number;
    draftCallSheets: number;
    totalCrewCalls: number;
    totalTalentCalls: number;
    averageCrewPerSheet: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_call_sheets')
        .select('status, crew_calls, talent_calls')
        .eq('organization_id', orgId);

      if (error) throw error;

      let totalCrewCalls = 0;
      let totalTalentCalls = 0;

      data.forEach(callSheet => {
        totalCrewCalls += (callSheet.crew_calls || []).length;
        totalTalentCalls += (callSheet.talent_calls || []).length;
      });

      const stats = {
        totalCallSheets: data.length,
        publishedCallSheets: data.filter(cs => cs.status === 'published').length,
        distributedCallSheets: data.filter(cs => cs.status === 'distributed').length,
        draftCallSheets: data.filter(cs => cs.status === 'draft').length,
        totalCrewCalls,
        totalTalentCalls,
        averageCrewPerSheet: data.length > 0 ? totalCrewCalls / data.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching call sheet stats:', error);
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
          resource_type: 'programming_call_sheet',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const callSheetsService = new CallSheetsService();
