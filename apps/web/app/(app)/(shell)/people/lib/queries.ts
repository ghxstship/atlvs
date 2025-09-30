/**
 * PEOPLE MODULE - DATABASE QUERY HANDLERS
 * Specialized query functions for complex People module operations
 * Optimized for performance with proper indexing and query patterns
 */

import { createClient } from '@/lib/supabase/server';

// Query builders for complex operations
export class PeopleQueryBuilder {
  private supabase = createClient();
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
  }

  // Advanced People Queries with Relationships
  async getPeopleWithFullProfile(params?: {
    includeInactive?: boolean;
    department?: string;
    role?: string;
    competencies?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      includeInactive = false,
      department,
      role,
      competencies,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = params || {};

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
        competencies:person_competencies(
          *,
          competency:people_competencies(*)
        ),
        endorsements:people_endorsements(
          *,
          endorser:people(id, first_name, last_name, avatar_url)
        ),
        network_connections:people_network!people_network_person_id_fkey(
          *,
          connected_person:people!people_network_connected_person_id_fkey(id, first_name, last_name, avatar_url)
        ),
        assignments:people_assignments(*),
        contracts:people_contracts(*),
        training:people_training(*)
      `, { count: 'exact' })
      .eq('memberships.organization_id', this.orgId);

    if (!includeInactive) {
      query = query.eq('memberships.status', 'active');
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (role) {
      query = query.eq('memberships.role', role);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%`);
    }

    // Competency filtering (if competencies specified)
    if (competencies && competencies.length > 0) {
      query = query.in('person_competencies.competency_id', competencies);
    }

    // Sorting
    const validSortFields = ['first_name', 'last_name', 'email', 'department', 'title', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range((page - 1) * limit, page * limit - 1);

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

  // Organizational Hierarchy Queries
  async getOrganizationHierarchy() {
    // Get all people with their reporting relationships
    const { data: people, error: peopleError } = await this.supabase
      .from('people')
      .select(`
        id,
        first_name,
        last_name,
        title,
        department,
        reports_to,
        avatar_url,
        memberships!inner(role, status)
      `)
      .eq('memberships.organization_id', this.orgId)
      .eq('memberships.status', 'active');

    if (peopleError) throw peopleError;

    // Build hierarchy tree
    const hierarchy = this.buildHierarchyTree(people || []);
    return hierarchy;
  }

  private buildHierarchyTree(people: unknown[]) {
    const peopleMap = new Map();
    const roots: unknown[] = [];

    // Create map of all people
    people.forEach(person => {
      peopleMap.set(person.id, {
        ...person,
        directReports: [],
        level: 0
      });
    });

    // Build hierarchy
    people.forEach(person => {
      if (person.reports_to && peopleMap.has(person.reports_to)) {
        const manager = peopleMap.get(person.reports_to);
        manager.directReports.push(peopleMap.get(person.id));
      } else {
        roots.push(peopleMap.get(person.id));
      }
    });

    // Calculate levels
    const calculateLevel = (person: unknown, level: number = 0) => {
      person.level = level;
      person.directReports.forEach((report: unknown) => calculateLevel(report, level + 1));
    };

    roots.forEach(root => calculateLevel(root));

    return roots;
  }

  // Competency Analytics Queries
  async getCompetencyAnalytics() {
    // Get competency distribution across organization
    const { data: competencyData, error: competencyError } = await this.supabase
      .from('person_competencies')
      .select(`
        *,
        person:people(
          id,
          first_name,
          last_name,
          department,
          memberships!inner(organization_id)
        ),
        competency:people_competencies(
          id,
          name,
          category,
          organization_id
        )
      `)
      .eq('person.memberships.organization_id', this.orgId);

    if (competencyError) throw competencyError;

    // Aggregate by competency and level
    const analytics = this.aggregateCompetencyData(competencyData || []);
    return analytics;
  }

  private aggregateCompetencyData(data: unknown[]) {
    const competencies = new Map();
    const departments = new Map();

    data.forEach(item => {
      const competencyId = item.competency.id;
      const competencyName = item.competency.name;
      const category = item.competency.category;
      const level = item.level;
      const department = item.person.department || 'Unassigned';

      // Competency aggregation
      if (!competencies.has(competencyId)) {
        competencies.set(competencyId, {
          id: competencyId,
          name: competencyName,
          category,
          levels: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
          total: 0
        });
      }

      const competency = competencies.get(competencyId);
      competency.levels[level] = (competency.levels[level] || 0) + 1;
      competency.total += 1;

      // Department aggregation
      if (!departments.has(department)) {
        departments.set(department, {
          name: department,
          competencies: new Map(),
          totalPeople: 0
        });
      }

      const dept = departments.get(department);
      if (!dept.competencies.has(competencyId)) {
        dept.competencies.set(competencyId, {
          name: competencyName,
          levels: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
          total: 0
        });
      }

      const deptCompetency = dept.competencies.get(competencyId);
      deptCompetency.levels[level] = (deptCompetency.levels[level] || 0) + 1;
      deptCompetency.total += 1;
    });

    return {
      competencies: Array.from(competencies.values()),
      departments: Array.from(departments.values()).map(dept => ({
        ...dept,
        competencies: Array.from(dept.competencies.values())
      }))
    };
  }

  // Performance and Activity Queries
  async getPeopleActivityReport(startDate: string, endDate: string) {
    // Get activity metrics for people within date range
    const { data: assignments, error: assignmentsError } = await this.supabase
      .from('people_assignments')
      .select(`
        *,
        person:people(id, first_name, last_name, department)
      `)
      .eq('organization_id', this.orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: endorsements, error: endorsementsError } = await this.supabase
      .from('people_endorsements')
      .select(`
        *,
        recipient:people(id, first_name, last_name, department)
      `)
      .eq('organization_id', this.orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: training, error: trainingError } = await this.supabase
      .from('people_training')
      .select(`
        *,
        person:people(id, first_name, last_name, department)
      `)
      .eq('organization_id', this.orgId)
      .gte('completed_at', startDate)
      .lte('completed_at', endDate);

    if (assignmentsError || endorsementsError || trainingError) {
      throw new Error('Failed to fetch activity report data');
    }

    return {
      assignments: assignments || [],
      endorsements: endorsements || [],
      training: training || [],
      summary: {
        totalAssignments: assignments?.length || 0,
        totalEndorsements: endorsements?.length || 0,
        totalTrainingCompletions: training?.length || 0
      }
    };
  }

  // Advanced Search with Full-Text Search
  async advancedSearch(params: {
    query?: string;
    filters?: {
      departments?: string[];
      roles?: string[];
      competencies?: string[];
      status?: string[];
      dateRange?: { start: string; end: string };
    };
    facets?: boolean;
  }) {
    const { query, filters = {}, facets = false } = params;

    let searchQuery = this.supabase
      .from('people')
      .select(`
        *,
        memberships!inner(
          role,
          status,
          organization:organizations(id, name, slug)
        ),
        roles:people_roles(*),
        competencies:person_competencies(*)
      `)
      .eq('memberships.organization_id', this.orgId);

    // Text search
    if (query) {
      searchQuery = searchQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,title.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    // Filters
    if (filters.departments?.length) {
      searchQuery = searchQuery.in('department', filters.departments);
    }

    if (filters.roles?.length) {
      searchQuery = searchQuery.in('memberships.role', filters.roles);
    }

    if (filters.status?.length) {
      searchQuery = searchQuery.in('status', filters.status);
    }

    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Competency filtering
    if (filters.competencies?.length) {
      searchQuery = searchQuery.in('person_competencies.competency_id', filters.competencies);
    }

    const { data, error } = await searchQuery.limit(100);

    if (error) throw error;

    const results = data || [];

    // Calculate facets if requested
    let facetsData = null;
    if (facets) {
      facetsData = this.calculateFacets(results);
    }

    return {
      results,
      total: results.length,
      facets: facetsData
    };
  }

  private calculateFacets(results: unknown[]) {
    const departments = new Map();
    const roles = new Map();
    const statuses = new Map();

    results.forEach(person => {
      // Department facets
      const dept = person.department || 'Unassigned';
      departments.set(dept, (departments.get(dept) || 0) + 1);

      // Role facets
      const role = person.memberships?.[0]?.role || 'Unassigned';
      roles.set(role, (roles.get(role) || 0) + 1);

      // Status facets
      const status = person.status || 'Unknown';
      statuses.set(status, (statuses.get(status) || 0) + 1);
    });

    return {
      departments: Object.fromEntries(departments),
      roles: Object.fromEntries(roles),
      statuses: Object.fromEntries(statuses)
    };
  }
}

// Factory function for query builder
export function createPeopleQueryBuilder(orgId: string) {
  return new PeopleQueryBuilder(orgId);
}
