// Jobs API Service
// HTTP API handlers for Jobs module

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JobsQueries } from './queries';
import { JobsMutations } from './mutations';
import { JobsPermissions } from './permissions';
import {
  validateJobCreate,
  validateJobUpdate,
  validateAssignmentCreate,
  validateAssignmentUpdate,
  validateOpportunityCreate,
  validateOpportunityUpdate,
  validateBidCreate,
  validateBidUpdate,
  validateContractCreate,
  validateContractUpdate,
  validateComplianceCreate,
  validateComplianceUpdate,
  validateRfpCreate,
  validateRfpUpdate
} from './validations';

export class JobsApiService {
  private supabase = createClient();
  private queries = new JobsQueries();
  private mutations = new JobsMutations();
  private permissions = new JobsPermissions();

  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION HELPERS
  // ============================================================================

  private async getAuthContext(request: NextRequest) {
    const supabase = createClient();

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Unauthorized');
    }

    // Get user profile and organization membership
    const { data: profile } = await supabase
      .from('users')
      .select(`
        *,
        memberships!inner(
          organization_id,
          role,
          status,
          organization:organizations(
            id,
            name,
            slug
          )
        )
      `)
      .eq('auth_id', session.user.id)
      .single();

    if (!profile || !profile.memberships?.[0]) {
      throw new Error('Organization membership not found');
    }

    const orgId = profile.memberships[0].organization_id;
    const userRole = profile.memberships[0].role;

    return {
      user: session.user,
      orgId,
      userRole,
      userId: profile.id
    };
  }

  private async checkPermission(context: unknown, action: string, resourceType: string, resourceId?: string): Promise<void> {
    const permissionContext = {
      userId: context.userId,
      orgId: context.orgId,
      userRole: context.userRole,
      resourceId,
      resourceType
    };

    let hasPermission = false;

    switch (resourceType) {
      case 'jobs':
        hasPermission = await this.permissions.checkJobAccess(permissionContext, action as any);
        break;
      case 'assignments':
        hasPermission = await this.permissions.checkAssignmentAccess(permissionContext, action as any);
        break;
      case 'opportunities':
        hasPermission = await this.permissions.checkOpportunityAccess(permissionContext, action as any);
        break;
      case 'bids':
        hasPermission = await this.permissions.checkBidAccess(permissionContext, action as any);
        break;
      case 'contracts':
        hasPermission = await this.permissions.checkContractAccess(permissionContext, action as any);
        break;
      case 'compliance':
        hasPermission = await this.permissions.checkComplianceAccess(permissionContext, action as any);
        break;
      case 'rfps':
        hasPermission = await this.permissions.checkRfpAccess(permissionContext, action as any);
        break;
      default:
        hasPermission = false;
    }

    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }
  }

  // ============================================================================
  // JOBS API HANDLERS
  // ============================================================================

  async getJobs(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'jobs');

      const { searchParams } = new URL(request.url);
      const filters = {
        status: searchParams.get('status') || undefined,
        project_id: searchParams.get('project_id') || undefined,
        created_by: searchParams.get('created_by') || undefined,
        due_before: searchParams.get('due_before') || undefined,
        due_after: searchParams.get('due_after') || undefined,
        search: searchParams.get('search') || undefined,
      };

      const jobs = await this.queries.getJobs(filters);

      return NextResponse.json({
        success: true,
        data: jobs,
        total: jobs.length
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createJob(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'jobs');

      const body = await request.json();
      const validation = validateJobCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const job = await this.mutations.createJob({
        ...validation.data,
        organization_id: context.orgId,
        created_by: context.userId
      });

      return NextResponse.json({
        success: true,
        data: job
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  async getJob(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'jobs', params.id);

      const job = await this.queries.getJob(params.id);

      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: job
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async updateJob(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'update', 'jobs', params.id);

      const body = await request.json();
      const validation = validateJobUpdate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const job = await this.mutations.updateJob(params.id, validation.data);

      return NextResponse.json({
        success: true,
        data: job
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async deleteJob(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'delete', 'jobs', params.id);

      await this.mutations.deleteJob(params.id);

      return NextResponse.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  // ============================================================================
  // ASSIGNMENTS API HANDLERS
  // ============================================================================

  async getAssignments(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'assignments');

      const assignments = await this.queries.getAssignments();

      return NextResponse.json({
        success: true,
        data: assignments,
        total: assignments.length
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createAssignment(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'assignments');

      const body = await request.json();
      const validation = validateAssignmentCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const assignment = await this.mutations.createAssignment(validation.data);

      return NextResponse.json({
        success: true,
        data: assignment
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // OPPORTUNITIES API HANDLERS
  // ============================================================================

  async getOpportunities(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'opportunities');

      const opportunities = await this.queries.getOpportunities();

      return NextResponse.json({
        success: true,
        data: opportunities,
        total: opportunities.length
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createOpportunity(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'opportunities');

      const body = await request.json();
      const validation = validateOpportunityCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const opportunity = await this.mutations.createOpportunity({
        ...validation.data,
        organization_id: context.orgId,
        created_by: context.userId
      });

      return NextResponse.json({
        success: true,
        data: opportunity
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // BIDS API HANDLERS
  // ============================================================================

  async getBids(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'bids');

      // Implementation would go here
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createBid(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'bids');

      const body = await request.json();
      const validation = validateBidCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const bid = await this.mutations.createBid(validation.data);

      return NextResponse.json({
        success: true,
        data: bid
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // CONTRACTS API HANDLERS
  // ============================================================================

  async getContracts(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'contracts');

      // Implementation would go here
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createContract(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'contracts');

      const body = await request.json();
      const validation = validateContractCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const contract = await this.mutations.createContract(validation.data);

      return NextResponse.json({
        success: true,
        data: contract
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // COMPLIANCE API HANDLERS
  // ============================================================================

  async getCompliance(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'compliance');

      // Implementation would go here
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createCompliance(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'compliance');

      const body = await request.json();
      const validation = validateComplianceCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const compliance = await this.mutations.createCompliance(validation.data);

      return NextResponse.json({
        success: true,
        data: compliance
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // RFPS API HANDLERS
  // ============================================================================

  async getRfps(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'read', 'rfps');

      // Implementation would go here
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
  }

  async createRfp(request: NextRequest) {
    try {
      const context = await this.getAuthContext(request);
      await this.checkPermission(context, 'create', 'rfps');

      const body = await request.json();
      const validation = validateRfpCreate(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validation.error.format() },
          { status: 400 }
        );
      }

      const rfp = await this.mutations.createRfp({
        ...validation.data,
        organization_id: context.orgId,
        created_by: context.userId
      });

      return NextResponse.json({
        success: true,
        data: rfp
      }, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : error.message === 'Insufficient permissions' ? 403 : 500 }
      );
    }
  }

  // ============================================================================
  // ERROR HANDLING HELPERS
  // ============================================================================

  private handleApiError(error: unknown): NextResponse {
    console.error('Jobs API Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
