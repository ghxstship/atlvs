/**
 * PEOPLE MODULE - CENTRALIZED API CLIENT
 * Enterprise-grade API service layer for all People module operations
 * Provides unified interface for all CRUD operations across all submodules
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Base API configuration
const API_BASE = '/api/v1/people';

// Core People API Client
export class PeopleApiClient {
  private supabase = createClient();
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
  }

  // Core People Operations
  async getPeople(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
    role?: string;
  }) {
    const { page = 1, limit = 50, search, status, department, role } = params || {};

    let query = this.supabase
      .from('people')
      .select(`
        *,
        memberships!inner(
          role,
          status,
          organization:organizations(id, name, slug)
        ),
        roles:people_roles(*),
        competencies:person_competencies(*),
        endorsements:people_endorsements(*),
        network:people_network(*)
      `, { count: 'exact' })
      .eq('memberships.organization_id', this.orgId)
      .eq('memberships.status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (role) {
      query = query.eq('memberships.role', role);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getPerson(id: string) {
    const { data, error } = await this.supabase
      .from('people')
      .select(`
        *,
        memberships!inner(
          role,
          status,
          organization:organizations(id, name, slug)
        ),
        roles:people_roles(*),
        competencies:person_competencies(*),
        endorsements:people_endorsements(*),
        network:people_network(*),
        assignments:people_assignments(*),
        contracts:people_contracts(*),
        training:people_training(*)
      `)
      .eq('id', id)
      .eq('memberships.organization_id', this.orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createPerson(personData: unknown) {
    const { data, error } = await this.supabase
      .from('people')
      .insert([{
        ...personData,
        organization_id: this.orgId,
        created_by: (await this.supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePerson(id: string, updates: unknown) {
    const { data, error } = await this.supabase
      .from('people')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', this.orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePerson(id: string) {
    const { error } = await this.supabase
      .from('people')
      .delete()
      .eq('id', id)
      .eq('organization_id', this.orgId);

    if (error) throw error;
    return true;
  }

  // Roles Operations
  async getRoles() {
    const { data, error } = await this.supabase
      .from('people_roles')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createRole(roleData: unknown) {
    const { data, error } = await this.supabase
      .from('people_roles')
      .insert([{
        ...roleData,
        organization_id: this.orgId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Competencies Operations
  async getCompetencies() {
    const { data, error } = await this.supabase
      .from('people_competencies')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPersonCompetencies(personId: string) {
    const { data, error } = await this.supabase
      .from('person_competencies')
      .select(`
        *,
        competency:people_competencies(*)
      `)
      .eq('person_id', personId);

    if (error) throw error;
    return data || [];
  }

  // Assignments Operations
  async getAssignments(params?: {
    person_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { person_id, status, page = 1, limit = 50 } = params || {};

    let query = this.supabase
      .from('people_assignments')
      .select(`
        *,
        person:people(id, first_name, last_name, email),
        assigned_by:people!people_assignments_assigned_by_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (person_id) {
      query = query.eq('person_id', person_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // Bulk Operations
  async bulkUpdatePeople(ids: string[], updates: unknown) {
    const { data, error } = await this.supabase
      .from('people')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('organization_id', this.orgId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async bulkDeletePeople(ids: string[]) {
    const { error } = await this.supabase
      .from('people')
      .delete()
      .in('id', ids)
      .eq('organization_id', this.orgId);

    if (error) throw error;
    return true;
  }

  // Analytics & Statistics
  async getPeopleStats() {
    const { data: totalPeople, error: totalError } = await this.supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', this.orgId);

    const { data: activePeople, error: activeError } = await this.supabase
      .from('people')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', this.orgId)
      .eq('status', 'active');

    const { data: departmentStats, error: deptError } = await this.supabase
      .from('people')
      .select('department')
      .eq('organization_id', this.orgId);

    if (totalError || activeError || deptError) {
      throw new Error('Failed to fetch people statistics');
    }

    const departmentBreakdown = departmentStats?.reduce((acc: unknown, person: unknown) => {
      acc[person.department || 'Unassigned'] = (acc[person.department || 'Unassigned'] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total: totalPeople || 0,
      active: activePeople || 0,
      inactive: (totalPeople || 0) - (activePeople || 0),
      departmentBreakdown
    };
  }

  // Search Operations
  async searchPeople(query: string, filters?: unknown) {
    const { status, department, role } = filters || {};

    let searchQuery = this.supabase
      .from('people')
      .select(`
        *,
        memberships!inner(
          role,
          status,
          organization:organizations(id, name, slug)
        )
      `)
      .eq('memberships.organization_id', this.orgId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);

    if (status) {
      searchQuery = searchQuery.eq('status', status);
    }

    if (department) {
      searchQuery = searchQuery.eq('department', department);
    }

    if (role) {
      searchQuery = searchQuery.eq('memberships.role', role);
    }

    const { data, error } = await searchQuery.limit(50);

    if (error) throw error;
    return data || [];
  }
}

// Factory function for API client
export function createPeopleApiClient(orgId: string) {
  return new PeopleApiClient(orgId);
}
