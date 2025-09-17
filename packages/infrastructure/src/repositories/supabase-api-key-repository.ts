import type { ApiKey } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseApiKeyRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async create(key: ApiKey): Promise<ApiKey> {
    const { data, error } = await this.sb.from('api_keys').insert({
      id: key.id,
      organization_id: key.organizationId,
      name: key.name,
      hash: key.hash,
      prefix: key.prefix,
      scopes: key.scopes,
      created_at: key.createdAt,
      updated_at: key.updatedAt,
      last_used_at: key.lastUsedAt ?? null,
      expires_at: key.expiresAt ?? null,
      active: key.active
    }).select('*').single();
    if (error) throw error;
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      hash: data.hash,
      prefix: data.prefix,
      scopes: data.scopes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastUsedAt: data.last_used_at ?? undefined,
      expiresAt: data.expires_at ?? undefined,
      active: data.active
    } as ApiKey;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const { data, error } = await this.sb.from('api_keys').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      hash: data.hash,
      prefix: data.prefix,
      scopes: data.scopes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastUsedAt: data.last_used_at ?? undefined,
      expiresAt: data.expires_at ?? undefined,
      active: data.active
    } as ApiKey;
  }

  async findByHash(hash: string): Promise<ApiKey | null> {
    const { data, error } = await this.sb.from('api_keys').select('*').eq('hash', hash).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      hash: data.hash,
      prefix: data.prefix,
      scopes: data.scopes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastUsedAt: data.last_used_at ?? undefined,
      expiresAt: data.expires_at ?? undefined,
      active: data.active
    } as ApiKey;
  }

  async listByOrg(organizationId: string): Promise<ApiKey[]> {
    const { data, error } = await this.sb.from('api_keys').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d: any) => ({
      id: d.id,
      organizationId: d.organization_id,
      name: d.name,
      hash: d.hash,
      prefix: d.prefix,
      scopes: d.scopes,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      lastUsedAt: d.last_used_at ?? undefined,
      expiresAt: d.expires_at ?? undefined,
      active: d.active
    } as ApiKey));
  }

  async deactivate(id: string): Promise<void> {
    const { error } = await this.sb.from('api_keys').update({ active: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
}
