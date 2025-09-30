import { createBrowserClient } from '@ghxstship/auth';
import type {
  DigitalAsset,
  CreateAssetData,
  UpdateAssetData,
  ResourceFilters,
} from '../types';

export class ResourcesService {
  private supabase = createBrowserClient();

  async getResources(orgId: string, filters?: ResourceFilters) {
    let query = this.supabase
      .from('resources')
      .select('*')
      .eq('organization_id', orgId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createResource(orgId: string, data: CreateAssetData) {
    const { data: resource, error } = await this.supabase
      .from('resources')
      .insert({
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return resource;
  }

  async updateResource(id: string, data: UpdateAssetData) {
    const { data: resource, error } = await this.supabase
      .from('resources')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return resource;
  }

  async deleteResource(id: string) {
    const { error } = await this.supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteResources(ids: string[]) {
    const { error } = await this.supabase
      .from('resources')
      .delete()
      .in('id', ids);

    if (error) throw error;
  }

  async getResourceById(id: string) {
    const { data, error } = await this.supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async incrementDownloadCount(id: string) {
    const { error } = await this.supabase.rpc('increment_resource_downloads', { resource_id: id });
    if (error) throw error;
  }

  async incrementViewCount(id: string) {
    const { error } = await this.supabase.rpc('increment_resource_views', { resource_id: id });
    if (error) throw error;
  }

  async uploadFile(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { error: uploadError } = await this.supabase.storage.from('resources').upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage.from('resources').getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export const resourcesService = new ResourcesService();
